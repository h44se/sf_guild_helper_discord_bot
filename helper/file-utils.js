const fs = require('fs');

function readFileSync(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return data;
  } catch (error) {
    throw error;
  }
}

async function writeFileSync(filePath, data) {
  try {
    fs.writeFileSync(filePath, data, 'utf8');
  } catch (error) {
    throw error;
  }
}


module.exports = {
  readFileSync: readFileSync,
  writeFileSync: writeFileSync,
};