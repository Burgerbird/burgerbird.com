const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');
const pug = require('pug');

// Configure markdown-it
const md = new MarkdownIt({
  html: false,
  xhtmlOut: false,
  breaks: false,
  linkify: false,
  typographer: false
});

const pugOptions = {
    basedir: "source",
    pretty: true
};

const sourceDirectory = path.join(__dirname, '..', 'source');
const outputDirectory = path.join(sourceDirectory, 'blog');
const pugTemplatePath = path.join(sourceDirectory, 'pug', 'blog-post.pug');

// Specify folders and files to exclude
const foldersToProcess = ['markdown'];
const excludeFiles = ['readme.md', 'Readme.md', 'README.md'];

function needsConversion(mdFilePath, htmlFilePath) {
  try {
    const mdStats = fs.statSync(mdFilePath);
    const htmlStats = fs.statSync(htmlFilePath);

    return mdStats.mtimeMs > htmlStats.mtimeMs;
  } catch (error) {
    // If there's an error (e.g., file doesn't exist), we need to perform the conversion
    return true;
  }
}

function convertMdToHTML(directoryPath) {
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${directoryPath}:`, err);
      return;
    }

    files.forEach((file) => {
      if (excludeFiles.includes(file)) {
        // Skip excluded files
        return;
      }

      const filePath = path.join(directoryPath, file);

      if (path.extname(file) === '.md') {
        const htmlFileName = path.basename(file, '.md') + '.html';
        const htmlFilePath = path.join(outputDirectory, htmlFileName);

        if (needsConversion(filePath, htmlFilePath)) {
          const mdContent = fs.readFileSync(filePath, 'utf8');

          try {
            const htmlContent = md.render(mdContent);

            // Read the Pug template
            const pugTemplate = pug.compileFile(pugTemplatePath, pugOptions);

            // Extract the first h1 as the title
            const titleMatch = mdContent.match(/^#\s+(.*)/);
            const title = titleMatch ? titleMatch[1] : 'Untitled';

            // Generate HTML using the Pug template
            const finalHtml = pugTemplate({ title, content: htmlContent });

            fs.writeFileSync(htmlFilePath, finalHtml, 'utf8');
            console.log(`Converted ${filePath} to ${htmlFilePath}`);
          } catch (renderError) {
            console.error(`Error rendering ${filePath}:`, renderError);
          }
        } else {
          console.log(`Skipped ${filePath} (HTML file is up to date)`);
        }
      }
    });
  });
}

// Process each specified folder
foldersToProcess.forEach((folder) => {
  const fullPath = path.join(sourceDirectory, folder);
  convertMdToHTML(fullPath);
});

// TODO: Delete HTML Files that no longer have a corresponding Markdown file