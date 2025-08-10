const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'src', 'data', 'original.json');
const outputPath = path.join(__dirname, 'src', 'data', 'converted.json');

// Load original data
const rawData = fs.readFileSync(inputPath, 'utf-8');
const originalArray = JSON.parse(rawData);

// Convert array to nested object
const convertedData = {};

originalArray.forEach(entry => {
  const { attraction, ...rest } = entry;

  if (!convertedData[attraction]) {
    convertedData[attraction] = {}; // Create the attraction key
  }

  convertedData[attraction]['wordle'] = rest; // Nest the rest under 'wordle'
});

// Write converted data to new file
fs.writeFileSync(outputPath, JSON.stringify(convertedData, null, 2), 'utf-8');

console.log('✅ Conversion done. Output saved to:', outputPath);
