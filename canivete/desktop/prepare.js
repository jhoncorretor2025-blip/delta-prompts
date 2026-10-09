const fs = require('node:fs');
const path = require('node:path');
const source = path.resolve(__dirname, '..', 'teleprompter.html');
const destination = path.join(__dirname, 'teleprompter.html');
fs.copyFileSync(source, destination);
console.log('Teleprompter HTML preparado para o aplicativo Windows.');