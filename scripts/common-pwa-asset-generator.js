const pwaAssetGenerator = require('pwa-asset-generator');

(async () => {
  const options = {
    // background: 'black',
    opaque: false,
    pathOverride: '/img/icons',
    manifest: './source/manifest.json',
    favicon: false,
    mstile: true,
    quality: 80
  };

  const sourceImage = './source/img/src/burgerbird-favicon.png';
  const outputFolder = './source/img/icons';

  const { savedImages, htmlMeta, manifestJsonContent } = await pwaAssetGenerator.generateImages(
    sourceImage,
    outputFolder,
    options
  );

  // You can access the generated assets and manifest data here if needed.

  // Access to static data for Apple Device specs that are used for generating launch images
  const appleDeviceSpecsForLaunchImages = pwaAssetGenerator.appleDeviceSpecsForLaunchImages;
})();
