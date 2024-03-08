const browserSync = require('browser-sync').create();
const browserSyncConfig = require('./build-browser-sync.config.js');
const { execSync } = require('child_process');
const { displayAsciiArt } = require('./common-ascii-art');
const { processCSS } = require('./build-css.js');

// Start build
(async function doBuild() {
  await displayAsciiArt('Simple Rick´s');
  console.log('Vanilla Website Builder\n')
  runPug();
  copyAll();
  await processCSS();
  purgeCSS();
  minifyJS();
  minifyHTML();
  console.log('Build finished!');

  if (process.env.GitHub !== 'true') {
    startBrowserSyncBuild();
  } else {
    console.log('Built on GitHub, with GitHub Actions workflow.');
  }

})();

function runPug() {
  console.log('runPug()');
  try {
    execSync('node scripts/pug.mjs', { stdio: 'inherit' });
  } catch (error) {
    console.error('runPug() failed:', error.message);
  }
}

function copyAll() {
  console.log('copyAll()');
  try {
    execSync('node scripts/build-copy.js', { stdio: 'inherit' });
  } catch (error) {
    console.error('copyAll() failed:', error.message);
  }
}

function purgeCSS() {
  console.log('purgeCSS()');
  try {
    execSync('node scripts/build-purgecss.js', { stdio: 'inherit' });
  } catch (error) {
    console.error('purgeCSS() failed:', error.message);
  }
}

function minifyJS() {
  console.log('minifyJS()');
  try {
    execSync('node scripts/build-js.js', { stdio: 'inherit' });
  } catch (error) {
    console.error('minifyJS() failed:', error.message);
  }
}

function minifyHTML() {
  console.log('minifyHTML()');
  try {
    execSync('node scripts/build-html.js', { stdio: 'inherit' });
  } catch (error) {
    console.error('minifyHTML() failed:', error.message);
  }
}

function startBrowserSyncBuild() {
  browserSync.init(browserSyncConfig, (err, bs) => {
    if (!err) {
      // Run custom action after BrowserSync initialization
      console.log('Wubba lubba dub dub!');
    }
  });
}

// TODO: Add markdown conversion to build process