const fs = require('fs');
function readJsonSafe(file) {
  let content = fs.readFileSync(file, 'utf16le');
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return JSON.parse(content);
}
const pl1 = readJsonSafe('pl1.json').entries.map(e => ({id: e.id, title: e.title, artist: e.uploader}));
const pl2 = readJsonSafe('pl2.json').entries.map(e => ({id: e.id, title: e.title, artist: e.uploader}));

const content = `export const PLAYLISTS_DATA = {
  'PLqulgEQug4aY4OH1t6u7JUdZpAZULZCKC': ${JSON.stringify(pl1, null, 2)},
  'PLcOhy50QpGlst75-brVladLyiy0-sp7Dc': ${JSON.stringify(pl2, null, 2)}
};
`;
fs.writeFileSync('src/js/playlists.js', content, 'utf8');
console.log('Created src/js/playlists.js');
