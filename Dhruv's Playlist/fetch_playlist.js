const https = require('https');
const fs = require('fs');

const playlistId = 'PLCAxG7on8A6bgJEAbXvfstliUopl0ibrN';
const url = `https://www.youtube.com/playlist?list=${playlistId}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const match = data.match(/var ytInitialData = (\{.*?\});/);
    if (match) {
      const ytData = JSON.parse(match[1]);
      let tracks = [];
      try {
        let tracks = [];
        let seen = new Set();
        
        function extract(obj) {
          if (!obj) return;
          if (Array.isArray(obj)) {
            obj.forEach(extract);
          } else if (typeof obj === 'object') {
            if (obj.playlistVideoRenderer && obj.playlistVideoRenderer.videoId && obj.playlistVideoRenderer.title && obj.playlistVideoRenderer.title.runs && obj.playlistVideoRenderer.title.runs[0]) {
              const id = obj.playlistVideoRenderer.videoId;
              const title = obj.playlistVideoRenderer.title.runs[0].text;
              const artist = (obj.playlistVideoRenderer.shortBylineText && obj.playlistVideoRenderer.shortBylineText.runs) ? obj.playlistVideoRenderer.shortBylineText.runs[0].text : 'YouTube Music';
              if (!seen.has(id)) {
                seen.add(id);
                tracks.push({ id, title, artist });
              }
            }
            Object.values(obj).forEach(extract);
          }
        }
        
        extract(ytData);
        fs.writeFileSync('playlist_data.json', JSON.stringify(tracks, null, 2));
        console.log('Successfully fetched playlist data. Total tracks:', tracks.length);
      } catch (e) {
        console.error('Error parsing playlist data:', e);
      }
    } else {
      console.log('ytInitialData not found');
    }
  });
}).on('error', err => {
  console.log('Error: ', err.message);
});
