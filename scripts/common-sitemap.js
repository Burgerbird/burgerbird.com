const fs = require('fs');
const path = require('path');
const { SitemapStream, streamToPromise } = require('sitemap');
const xmlFormatter = require('xml-formatter');

// Configuration
const domain = 'https://burgerbird.com'; // Replace with your domain
const outputDir = path.join(__dirname, '..', 'source'); // Output directory
const outputName = 'sitemap.xml';
const subfolders = ['wallpaper']; // Specify subfolders, if any
const excludedUrls = [];
let urls = []; // extra urls
const pretty = true; // pretty sitemap

// Function to crawl a directory and add URLs to the sitemap
function crawlDirectory(directory, baseUrl) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const filePath = path.join(directory, file);
    if (fs.statSync(filePath).isDirectory()) {
      // Skip directories and only crawl HTML files
      continue;
    }
    if (file.endsWith('.html')) {
      let filename = file.replace('.html', '');
      if (filename !== 'index') {
        // Remove the .html extension
        let relativePath = path.relative(outputDir, filePath).replace('.html', '');

        // Loop through subfolders and remove them from the URL
        for (const subfolder of subfolders) {
          if (relativePath.startsWith(subfolder)) {
            // +1 to remove the leading slash
            relativePath = relativePath.substring(subfolder.length + 1);
          }
        }

        // Fix URL construction
        let url = relativePath === '' ? baseUrl : `${baseUrl}/${relativePath}`;
        //Trim trailing slashes
        url = url.replace(/\/$/, "");
        // Get the last modified date and format it
        const lastmod = fs.statSync(filePath).mtime.toISOString();
        // Push it
        urls.push({ url, lastmod });
      } else {
        urls.push({ url: baseUrl });
      }
    }
  }
}

// Add root URLs
crawlDirectory(outputDir, domain);

// Add subfolder URLs
for (const subfolder of subfolders) {
  crawlDirectory(path.join(outputDir, subfolder), `${domain}/${subfolder}`);
}

// Function to remove specified URLs from an array
function removeUrls(array, value, key) {
  return array.filter(item => item[key] !== value);
}

excludedUrls.forEach(excludedUrl => {
  urls = removeUrls(urls, excludedUrl, 'url');
});

// Sort the URLs with numbers in real ascending order
urls.sort((a, b) => {
  // Move the root URL to the top
  if (a.url === domain) return -1;
  if (b.url === domain) return 1;

  // Convert URLs to numbers for numeric sorting
  const numA = parseInt(a.url.replace(/[^0-9]/g, ''), 10);
  const numB = parseInt(b.url.replace(/[^0-9]/g, ''), 10);

  // If both URLs have numbers, compare them numerically
  if (!isNaN(numA) && !isNaN(numB)) {
    return numA - numB;
  }

  // Sort the rest of the URLs alphabetically
  return a.url.localeCompare(b.url);
});

// Create a writable stream for the sitemap
const sitemapStream = new SitemapStream({ 
  hostname: domain,
  xmlns: {
    news: false, // if you want the news namespace
    xhtml: false, // if you want the xhtml namespace
    image: false, // if you want the image namespace
    video: false // set to false to exclude the video namespace
  } 
});

// Add URLs to the stream
urls.forEach(url => sitemapStream.write(url));

// End the stream
sitemapStream.end();

// Convert the stream to a promise
streamToPromise(sitemapStream).then(sm => {
  // Save sitemap to a file
  const sitemapPath = path.join(outputDir, outputName);
  let sitemapXML = sm.toString();

  // Replace occurrences of "<loc>https://burgerbird.com/</loc>" with "<loc>https://burgerbird.com</loc>" (https://github.com/ekalinin/sitemap.js/issues/403)
  sitemapXML = sitemapXML.replace(/<loc>https:\/\/sin\.ai\/<\/loc>/g, '<loc>https://burgerbird.com</loc>');

  if (pretty) {
    // Format the sitemap XML for pretty printing
    const formattedSitemapXML = xmlFormatter(sitemapXML, { collapseContent: true, lineSeparator: '\n' });
    fs.writeFileSync(sitemapPath, formattedSitemapXML);
  } else {
    fs.writeFileSync(sitemapPath, sitemapXML);
  }

  console.log(`Sitemap generated and saved to ${sitemapPath}`);
});

// TODO: Additional URL and img infos
// TODO: Handle index files better