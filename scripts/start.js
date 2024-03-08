const browserSync = require('browser-sync').create();
const browserSyncConfig = require('./start-browser-sync.config.js');
const { execSync } = require('child_process');

(function doStart() {
  console.log('Start dev mode');
  // runMarkdown();
  runPug();
  startBrowserSync();
  startBrowserSyncWatch();
})();

function runPug() {
  console.log('Starting Pug-to-HTML conversion.');
  try {
    // Execute the conversion script synchronously
    execSync('node scripts/pug.mjs', { stdio: 'inherit' });
    console.log('Pug-to-HTML conversion completed successfully.');

    // Call other build tasks or continue with your build process here.
  } catch (error) {
    console.error('Pug-to-HTML conversion failed:', error.message);
    // Handle the failure or terminate the build process accordingly.
  }
}

function runMarkdown() {
  console.log('Starting Markdown to HTML conversion.');
  try {
    // Execute the conversion script synchronously
    execSync('node scripts/common-markdown.js', { stdio: 'inherit' });
    console.log('Markdown to HTML conversion completed successfully.');

    // Call other build tasks or continue with your build process here.
  } catch (error) {
    console.error('Markdown to HTML conversion failed:', error.message);
    // Handle the failure or terminate the build process accordingly.
  }
}

function startBrowserSync() {
  // Start BrowserSync with the imported configuration
  browserSync.init(browserSyncConfig, (err, bs) => {
    if (!err) {
      // Run your custom action after BrowserSync initialization
    }
  });
}

function startBrowserSyncWatch() {
  // Watch for changes in the pug files
  browserSync.watch('source/**/*.pug').on('change', function (event) {
    runPug();
  });
  // Watch for changes in the markdown files
  browserSync.watch('source/markdown/*.md').on('change', function (event) {
    runMarkdown();
  });
}