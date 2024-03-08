const util = require('util');
const figlet = require('figlet');

// Function to generate and display ASCII art
async function displayAsciiArt(text) {
  const figletAsync = util.promisify(figlet.text);
  const artText = await figletAsync(text, {
    font: 'Standard', // You can choose different fonts here
  });
  console.log(artText);
}

module.exports = { displayAsciiArt };
