const fs = require('fs-extra');
const path = require('path');
const postcss = require('postcss');
const postcssImport = require('postcss-import');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const { JSDOM } = require('jsdom');

const baseDirectory = 'docs'; // Change this to set the base directory
const cssDirectories = ['css']; // Relative paths to folders in the docs directory
const excludedCssDirectories = ['vendor']; // Relative paths to folders in the docs directory to exclude

// Configuration Options
const postcssPlugins = [
  postcssImport(),
  autoprefixer(),
  cssnano() // Add the cssnano plugin here for minification
];

// Main function to process CSS files
async function processCSS() {
  console.log('processCSS()');
  try {
    for (const cssDir of cssDirectories) {
      const sourceDir = path.join(baseDirectory, cssDir);

      // Check if the source directory exists
      const sourceExists = await fs.pathExists(sourceDir);

      if (!sourceExists) {
        console.warn(`Source directory "${sourceDir}" does not exist.`);
        continue;
      }

      await processFilesInDirectory(sourceDir);
    }

    // Process HTML files in the root of the docs directory
    await processHTMLFilesInRoot(baseDirectory);
  } catch (err) {
    console.error('Error processing CSS files:', err);
  }
}

// Process files in a directory (helper function)
async function processFilesInDirectory(directory) {
  const files = await fs.readdir(directory);

  for (const file of files) {
    const filePath = path.join(directory, file);
    const fileStat = await fs.stat(filePath);

    if (fileStat.isFile() && path.extname(file).toLowerCase() === '.css') {
      await processCSSFile(filePath);
    } else if (fileStat.isDirectory() && !excludedCssDirectories.includes(file)) {
      await processFilesInDirectory(filePath);
    }
  }
}

// Process individual CSS file (helper function)
async function processCSSFile(filePath) {
  try {
    const cssContent = await fs.readFile(filePath, 'utf8');
    const result = await postcss(postcssPlugins).process(cssContent, { from: filePath });

    // Write the processed CSS back to the file
    await fs.outputFile(filePath, result.css);
    console.log(`CSS file "${filePath}" processed successfully.`);
  } catch (err) {
    console.error(`Error processing CSS file "${filePath}":`, err);
  }
}

// Process HTML files in the root of the docs directory (helper function)
async function processHTMLFilesInRoot(baseDirectory) {
  try {
    const files = await fs.readdir(baseDirectory);

    for (const file of files) {
      const filePath = path.join(baseDirectory, file);
      const fileStat = await fs.stat(filePath);

      if (fileStat.isFile() && path.extname(file).toLowerCase() === '.html') {
        await processCSSInHTMLHead(filePath);
      }
    }
  } catch (err) {
    console.error('Error processing HTML files in the root directory:', err);
  }
}

// Function to process CSS in the <head> section of HTML files
async function processCSSInHTMLHead(htmlFilePath) {
  try {
    const htmlContent = await fs.readFile(htmlFilePath, 'utf8');
    const dom = new JSDOM(htmlContent);
    const head = dom.window.document.head;

    // Find all <style> tags within the <head> section
    const styleTags = head.querySelectorAll('style');

    for (const styleTag of styleTags) {
      const cssContent = styleTag.innerHTML;

      // Process the CSS using PostCSS
      const result = await postcss(postcssPlugins).process(cssContent, {
        from: undefined // Set the 'from' option to undefined to prevent the warning
      });

      // Update the <style> tag content with processed CSS
      styleTag.innerHTML = result.css;
    }

    // Write the updated HTML file back to disk
    await fs.outputFile(htmlFilePath, dom.serialize());
    console.log(`CSS in <head> section of HTML file "${htmlFilePath}" processed successfully.`);
  } catch (err) {
    console.error(`Error processing CSS in <head> section of HTML file "${htmlFilePath}":`, err);
  }
}

// If this module is run directly, call processCSS                                                                          
if (require.main === module) {
  processCSS();
};

// Export the functions as modules                                                                                          
module.exports = {
  processCSS,
  processCSSInHTMLHead,
};     


// ESM Variant

// // If this module is run directly, call processCSS
// if (import.meta.main) {
//   processCSS();
// }

// // Export the functions as modules
// export { processCSS, processCSSInHTMLHead };