const fs = require('fs');
const path = require('path');

const assetsToCopy = [
  // { source: './node_modules/gsap/dist/gsap.min.js', destination: './source/vendor/gsap.js' },
  // { source: './node_modules/gsap/dist/ScrollTrigger.min.js', destination: './source/vendor/ScrollTrigger.js' },
  { source: './node_modules/muuri/dist/muuri.min.js', destination: './source/js/vendor/muuri.js' },
  { source: './node_modules/swiper/swiper-bundle.min.js', destination: './source/js/vendor/swiper.js' },
  { source: './node_modules/swiper/swiper-bundle.min.css', destination: './source/css/vendor/swiper.css' },
  // Add more assets to copy here if needed
];

function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  fs.mkdirSync(dirname, { recursive: true });
}

function copyAssets() {
  assetsToCopy.forEach((asset) => {
    ensureDirectoryExistence(asset.destination);
    fs.copyFile(asset.source, asset.destination, (err) => {
      if (err) {
        console.error(`Error copying ${asset.source} to ${asset.destination}:`, err);
      } else {
        console.log(`${asset.source} copied to ${asset.destination}`);
      }
    });
  });
}

copyAssets();
