const https = require('https');
const fs = require('fs');
const ids = ['PLZhk_SkrSopDvX7kjcayZTLJF9LwbiSYx', 'PL3HnYRKfTBJVPJqjp0VZN3agpPEHX8An6', 'PLZ4BrZ6_G9NMP0krgYIEz0NEs5DTycBiz', 'PLDBY0HRfwJx44lDeLXGBTQJ7SFYCIN_e6'];
const result = {};

async function fetchPlaylist(id) {
  return new Promise((resolve) => {
    https.get('https://www.youtube.com/playlist?list=' + id, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const tracks = [];
        const regex = /"playlistVideoRenderer":\{"videoId":"(.*?)".*?"title":\{"runs":\[\{"text":"(.*?)"\}.*?"shortBylineText":\{"runs":\[\{"text":"(.*?)"/g;
        let match;
        while(match = regex.exec(data)) {
          tracks.push({ id: match[1], title: match[2], artist: match[3] });
        }
        resolve(tracks);
      });
    });
  });
}

(async () => {
  for (const id of ids) {
    const tracks = await fetchPlaylist(id);
    result[id] = tracks;
    console.log(id, tracks.length);
  }
  fs.writeFileSync('temp_playlists6.json', JSON.stringify(result, null, 2));
})();
