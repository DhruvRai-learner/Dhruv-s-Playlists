const https = require('https');
const fs = require('fs');

const ids = [
  'PLZhk_SkrSopDvX7kjcayZTLJF9LwbiSYx', 
  'PL3HnYRKfTBJVPJqjp0VZN3agpPEHX8An6', 
  'PLZ4BrZ6_G9NMP0krgYIEz0NEs5DTycBiz', 
  'PLDBY0HRfwJx44lDeLXGBTQJ7SFYCIN_e6'
];

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
        const tracks = [];
        // Extract videoId, title, artist from script tag data
        const matches = [...data.matchAll(/"playlistVideoRenderer":\{"videoId":"([^"]+)".*?"title":\{"runs":\[\{"text":"([^"]+)"\}.*?"shortBylineText":\{"runs":\[\{"text":"([^"]+)"\}/g)];
        for (const m of matches) {
          tracks.push({
            id: m[1],
            title: m[2],
            artist: m[3]
          });
        }
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
    console.log(id, '=> found', tracks.length, 'tracks');
    result[id] = tracks;
  }
  fs.writeFileSync('extracted_playlists.json', JSON.stringify(result, null, 2));
  console.log('Done writing extracted_playlists.json');
})();
