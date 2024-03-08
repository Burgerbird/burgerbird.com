const fs = require('fs-extra');
const path = require('path');

// Options:
const copyOptions = {
  baseDirectoryPath: '.',
  sourceDirectory: 'source',
  destinationDirectory: 'docs',
  directoriesToCopy: [],  // Empty array for wildcard-like behavior for all directories
  excludedFileTypes: ['.pug','.DS_Store'], // Files with this filetype to be excluded from all directories (optional)
  excludedDirectories: ['_pug', 'studio'], // Does not work for subdirectories! (optional)
  copyFilesOnly: [ // Copy all files from a directory, without subdirectories, except excluded file types. Use absolute paths. (optional)
    { from: './source', to: './docs' },
    // Add more source and destination paths as needed
  ]
};

// Main function to copy all files and directories
async function copyAll() {
  try {
    await destroyAndCreateDirectory(copyOptions.baseDirectoryPath, copyOptions.destinationDirectory)
    await copyFilesAndDirectories(copyOptions)
    await copyFilesOnly(copyOptions.copyFilesOnly, copyOptions.excludedFileTypes);
  } catch (err) {
    console.error('Error copying files and directories:', err);
  }
}

async function destroyAndCreateDirectory(baseDirectoryPath, directory) {
  try {
    const directoryPath = path.join(baseDirectoryPath, directory);

    // Check if the directory exists
    const dirExists = await fs.pathExists(directoryPath);

    if (dirExists) {
      // If the directory exists, remove it with all its contents
      await fs.remove(directoryPath);
      console.log(`Directory "${directoryPath}" and its contents removed.`);
    }

    // Create the directory
    await fs.ensureDir(directoryPath);
    console.log(`Directory "${directoryPath}" created successfully.`);
  } catch (err) {
    console.error('Error in destroyAndCreateDirectory:', err);
  }
}

async function copyFilesAndDirectories(copyOptions) {
  try {
    const {
      baseDirectoryPath = './fallback-base',
      sourceDirectory = 'fallback-source',
      destinationDirectory = 'fallback-destination',
      directoriesToCopy = [],
      excludedFileTypes = [],
      excludedDirectories = []
    } = copyOptions;

    const baseDirectory = path.join(baseDirectoryPath, sourceDirectory);
    const destination = path.join(baseDirectoryPath, destinationDirectory);

    // If directoriesToCopy is empty, consider all directories directly under baseDirectory
    const allDirectories = directoriesToCopy.length === 0
      ? Array.from(await fs.readdir(baseDirectory)).filter(name => fs.statSync(path.join(baseDirectory, name)).isDirectory())
      : directoriesToCopy;

    // Copy specified directories and their contents recursively
    for (const dirName of allDirectories) {
      const sourceDir = path.join(baseDirectory, dirName);
      const destinationDir = path.join(destination, dirName);

      // Check if the source directory exists
      const sourceExists = await fs.pathExists(sourceDir);

      if (!sourceExists) {
        console.error(`Source directory "${sourceDir}" does not exist.`);
        continue;
      }

      // Check if the directory is excluded
      if (excludedDirectories.includes(dirName)) {
        console.log(`Excluded directory: "${sourceDir}"`);
        continue;
      }

      // Perform the copy, excluding specified file types and directories
      await fs.copy(sourceDir, destinationDir, {
        filter: (src, dest) => {
          const filename = path.basename(src);

          // Exclude files with specified file types
          if (excludedFileTypes.includes(path.extname(filename).toLowerCase())) {
            console.log(`Excluded file: ${src}`);
            return false;
          }

          return true;
        }
      });

      console.log(`Directory "${sourceDir}" copied to "${destinationDir}" successfully.`);
    }
  } catch (err) {
    console.error('Error in copyDirectories:', err.message);
  }
}

async function copyFilesOnly(copyFilesWithoutDirectories, excludedFileTypes = []) {
  try {
    for (const copyOption of copyFilesWithoutDirectories) {
      const { from, to } = copyOption;

      // Get the list of files in the source directory
      const filesInSourceDir = await fs.readdir(from);

      // Filter out any directories and files with excluded types from the list of files
      const filesToCopy = await Promise.all(filesInSourceDir.map(async (file) => {
        const filePath = path.join(from, file);
        const fileStat = await fs.stat(filePath);
        
        // Check if the file is not a directory and is not excluded by file types
        if (fileStat.isFile() && !excludedFileTypes.includes(path.extname(file).toLowerCase())) {
          return file;
        }
        return null;
      }));

      // Copy each file to the corresponding destination directory
      for (const file of filesToCopy) {
        if (file) {
          const sourceFile = path.join(from, file);
          const destinationFile = path.join(to, file);

          await fs.copy(sourceFile, destinationFile);
          console.log(`File "${sourceFile}" copied to "${destinationFile}" successfully.`);
        }
      }
    }
  } catch (err) {
    console.error('Error in copyFilesOnly:', err);
  }
}

// If you want to call it separately from copy.build.js, you can do it
copyAll();

// Export the functions as modules
// module.exports = {
//     destroyAndCreateDirectory,
//     copyFilesAndDirectories,
//     copyFilesOnly,
//     copyAll,
//   };
