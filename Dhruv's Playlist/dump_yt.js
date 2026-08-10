const https = require('https');
const fs = require('fs');

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

https.get({
  hostname: 'www.youtube.com',
  path: '/playlist?list=PLZhk_SkrSopDvX7kjcayZTLJF9LwbiSYx',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = extractYtInitialData(data);
    if (json) {
      fs.writeFileSync('sample_yt.json', JSON.stringify(json, null, 2));
      console.log('Saved sample_yt.json');
    } else {
      console.log('Failed to parse json');
    }
  });
});
