const https = require('https');
const fs = require('fs');

const ids = [
  'PLZhk_SkrSopDvX7kjcayZTLJF9LwbiSYx', 
  'PL3HnYRKfTBJVPJqjp0VZN3agpPEHX8An6', 
  'PLZ4BrZ6_G9NMP0krgYIEz0NEs5DTycBiz', 
  'PLDBY0HRfwJx44lDeLXGBTQJ7SFYCIN_e6'
];

function extractYtInitialData(html) {
  const startStr = 'var ytInitialData = ';
  const idx = html.indexOf(startStr);
  if (idx === -1) return null;
  const jsonStart = idx + startStr.length;
  const endIdx = html.indexOf(';</script>', jsonStart);
  if (endIdx === -1) return null;
  const jsonStr = html.substring(jsonStart, endIdx);
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    return null;
  }
}

function findLockups(obj, results = []) {
  if (obj && typeof obj === 'object') {
    if (obj.lockupViewModel) {
      results.push(obj.lockupViewModel);
    }
    for (const k in obj) {
      findLockups(obj[k], results);
    }
  }
  return results;
}

async function fetchPlaylist(id) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'www.youtube.com',
      path: '/playlist?list=' + id,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    };
    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const json = extractYtInitialData(data);
        if (!json) {
          console.log(id, 'Failed to extract ytInitialData');
          resolve([]);
          return;
        }
        const lockups = findLockups(json);
        const tracks = lockups.map(item => {
          const title = item.metadata?.lockupMetadataViewModel?.title?.content;
          const meta = item.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows;
          const artist = meta?.[0]?.metadataParts?.[0]?.text?.content || 'Unknown Artist';
          const videoId = item.contentId;
          if (videoId && title) {
            return { id: videoId, title: title.trim(), artist: artist.trim() };
          }
          return null;
        }).filter(Boolean);
        resolve(tracks);
      });
    }).on('error', () => resolve([]));
  });
}

(async () => {
  const result = {};
  for (const id of ids) {
    console.log('Fetching real tracks for', id);
    const tracks = await fetchPlaylist(id);
    console.log(id, '=> extracted', tracks.length, 'real tracks!');
    result[id] = tracks;
  }
  fs.writeFileSync('all_real_tracks.json', JSON.stringify(result, null, 2));
  console.log('Done extracting all real tracks');
})();
