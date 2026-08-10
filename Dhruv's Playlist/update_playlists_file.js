const fs = require('fs');
const vm = require('vm');
const realData = JSON.parse(fs.readFileSync('all_real_tracks.json', 'utf8'));

let fileContent = fs.readFileSync('src/js/playlists.js', 'utf8');

const code = fileContent.replace('export const PLAYLISTS_DATA =', 'global.PLAYLISTS_DATA =');
const script = new vm.Script(code);
const context = vm.createContext(global);
script.runInContext(context);

const existingData = global.PLAYLISTS_DATA;

for (const id in realData) {
  if (realData[id] && realData[id].length > 0) {
    existingData[id] = realData[id];
  }
}

const newFileContent = 'export const PLAYLISTS_DATA = ' + JSON.stringify(existingData, null, 2) + ';\n';
fs.writeFileSync('src/js/playlists.js', newFileContent);
console.log('Successfully updated playlists.js with real tracks!');
