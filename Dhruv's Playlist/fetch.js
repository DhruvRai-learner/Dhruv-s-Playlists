const { execSync } = require('child_process');
const fs = require('fs');

const ids = [
  'PLZhk_SkrSopDvX7kjcayZTLJF9LwbiSYx', 
  'PL3HnYRKfTBJVPJqjp0VZN3agpPEHX8An6', 
  'PLZ4BrZ6_G9NMP0krgYIEz0NEs5DTycBiz', 
  'PLDBY0HRfwJx44lDeLXGBTQJ7SFYCIN_e6'
];

const result = {};
for (const id of ids) {
  try {
    console.log('Fetching ' + id);
    const out = execSync('.\\yt-dlp.exe -J --flat-playlist "https://music.youtube.com/playlist?list=' + id + '"');
    const pl = JSON.parse(out.toString());
    const tracks = pl.entries.map(e => ({
      id: e.id,
      title: e.title,
      artist: e.uploader || e.channel || ''
    }));
    result[id] = tracks;
    console.log('Found ' + tracks.length + ' tracks');
  } catch(e) {
    console.log('Error for ' + id + ': ' + e.message);
  }
}
fs.writeFileSync('temp_playlists4.json', JSON.stringify(result, null, 2));
console.log('Done');
