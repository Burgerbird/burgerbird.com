const fs = require('fs');
const PurgeCSS = require('purgecss').default;

// Configuration for PurgeCSS
const purgecssConfig = {
  content: ['docs/**/*.html', 'docs/**/*.js'], // Array of HTML/JS files to analyze
  css: ['docs/**/*.css'], // Array of CSS files to process
  safelist: ['poopybutthole'], // Array of classes to exclude from purging
};

// Function to run PurgeCSS and update CSS files in place
async function runPurgeCSS() {
  try {
    console.log('Run PurgeCSS...');

    // Run PurgeCSS with the configuration
    const result = await new PurgeCSS().purge(purgecssConfig);

    // Loop through the result and update CSS files in place
    for (const file of result) {
      const { file: cssFile, css } = file;

      // Update the CSS file with the purged styles
      fs.writeFileSync(cssFile, css);

      // Log the successful update
      console.log(`Updated ${cssFile}`);
    }

    console.log('PurgeCSS completed!');
  } catch (error) {
    console.error('PurgeCSS error:', error);
  }
}

// Call the function to run PurgeCSS
runPurgeCSS();
