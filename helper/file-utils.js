const fs = require('fs');

function readFileSync(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  return data;
}

async function writeFileSync(filePath, data) {
  fs.writeFileSync(filePath, data, 'utf8');
}


module.exports = {
  readFileSync: readFileSync,
  writeFileSync: writeFileSync,
};