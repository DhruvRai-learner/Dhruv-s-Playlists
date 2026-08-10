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

function findByKey(obj, key, results = []) {
  if (obj !== null && typeof obj === 'object') {
    if (Array.isArray(obj)) {
      for (const item of obj) findByKey(item, key, results);
    } else {
      if (obj.hasOwnProperty(key)) {
        results.push(obj[key]);
      }
      for (const k in obj) {
        findByKey(obj[k], key, results);
      }
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
        const videoRenderers = findByKey(json, 'playlistVideoRenderer');
        const tracks = videoRenderers.map(v => {
          return {
            id: v.videoId,
            title: v.title?.runs?.[0]?.text || 'Unknown Title',
            artist: v.shortBylineText?.runs?.[0]?.text || v.longBylineText?.runs?.[0]?.text || 'Unknown Artist'
          };
        }).filter(t => t.id);
        resolve(tracks);
      });
    }).on('error', () => resolve([]));
  });
}

(async () => {
  const result = {};
  for (const id of ids) {
    console.log('Fetching', id);
    const tracks = await fetchPlaylist(id);
    console.log(id, '=> found', tracks.length, 'real tracks!');
    if (tracks.length > 0) {
      console.log('Sample track 1:', tracks[0]);
    }
    result[id] = tracks;
  }
  fs.writeFileSync('real_playlists_data.json', JSON.stringify(result, null, 2));
  console.log('Done writing real_playlists_data.json');
})();
