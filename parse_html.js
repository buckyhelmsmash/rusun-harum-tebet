const fs = require('fs');
const html = fs.readFileSync(process.argv[2], 'utf8');
const text = html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
console.log(text);
