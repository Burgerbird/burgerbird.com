const fs = require('fs-extra');
const path = require('path');
const { minify } = require('terser');

// To check, to do:
// How to handle files in the base directory?
// How to handle all JavaScript files in docs?

// Define the jsConfig object to configure the script
const jsConfig = {
  baseDirectory: 'docs', // The base directory for processing JavaScript files
  jsDirectories: ['js'], // Directories to process without subdirectories
  jsDirectoriesPlusSubdirectories: [], // Directories to process with all subdirectories
};

// Define the terserConfig object to configure Terser options
const terserConfig = {
  // Sample Terser options, you can customize these as needed
  toplevel: false,
  compress: {
    global_defs: {
      "@console.log": "alert",
    },
    passes: 2,
  },
  format: {
    preamble: "/* minified */",
  },
};

// Function to minify JavaScript files using Terser
async function minifyJSFiles(jsConfig, terserConfig) {
  try {
    const { baseDirectory, jsDirectories, jsDirectoriesPlusSubdirectories } = jsConfig;

    // Function to recursively get all JavaScript files in a directory
    const getJSFilesRecursive = async (dir) => {
      const dirents = await fs.readdir(dir, { withFileTypes: true });
      const files = await Promise.all(dirents.map(async (dirent) => {
        const res = path.resolve(dir, dirent.name);
        return dirent.isDirectory() ? getJSFilesRecursive(res) : res;
      }));
      return Array.prototype.concat(...files);
    };

    // Get JavaScript files to minify
    let jsFilesToMinify = [];
    for (const dir of jsDirectories) {
      const fullPath = path.join(baseDirectory, dir);
      const files = await getJSFilesRecursive(fullPath);
      jsFilesToMinify = jsFilesToMinify.concat(files);
      console.log(`Found JavaScript files in ${dir}:`, files);
    }

    for (const dir of jsDirectoriesPlusSubdirectories) {
      const fullPath = path.join(baseDirectory, dir);
      const files = await getJSFilesRecursive(fullPath);
      jsFilesToMinify = jsFilesToMinify.concat(files);
      console.log(`Found JavaScript files in ${dir} (including subdirectories):`, files);
    }

    console.log('Total JavaScript files to minify:', jsFilesToMinify.length);
    console.log('jsFilesToMinify:', jsFilesToMinify);

    // Minify JavaScript files using Terser
    for (const file of jsFilesToMinify) {
      console.log('Minifying:', file);
      const code = await fs.readFile(file, 'utf-8');
      try {
        const result = await minify({ [file]: code }, terserConfig);
        if (result.code) {
          await fs.writeFile(file, result.code, 'utf-8');
          console.log('Minified:', file);
        } else {
          console.error('Terser result.code is undefined for:', file);
          console.error('Terser error:', result.error);
        }
      } catch (err) {
        console.error('Error during minification:', err);
      }
    }

    console.log('JavaScript files minified successfully!');
  } catch (err) {
    console.error('An error occurred:', err);
  }
}

// Call the minifyJSFiles function with the provided configurations
minifyJSFiles(jsConfig, terserConfig);
