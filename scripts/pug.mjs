/** Pug Template Renderer (ES Module)

This script, implemented as an ECMAScript Module (ESM), automates the rendering of .pug templates into .html files
within a specified source directory and its subdirectories, with support for excluding specified files and directories.
Designed for projects using the Pug templating engine, it offers a flexible and efficient solution for template
rendering during development. The script enhances productivity by allowing for directory and file-specific exclusions,
continuing processing even when encountering errors, and providing a foundation for future dynamic data/context integration.

Configuration Variables:
- sourceDir: The root directory containing .pug files to be rendered, set relative to the script's location.
- pugElementsPaths: An array of paths (relative to sourceDir) specifying directories and specific files to exclude from rendering.
  This flexible approach supports excluding template parts or shared components not intended for direct HTML output.
- pugOptions: https://pugjs.org/api/reference.html

Key Functions:
- isExcluded(filePath): Determines if a given file path matches or is contained within any excluded path, supporting
  both directory and specific file exclusions.
- renderFile(filePath): Asynchronously reads a .pug file and renders it to HTML, unless excluded, saving the output
  alongside the original file.
- renderPug(directoryPath): Recursively traverses and renders .pug files within the source directory, respecting
  exclusions specified in pugElementsPaths.

Usage:
- Tailored for development workflows in projects utilizing the Pug templating engine, requiring Node.js with ES Module support.
- The script is designed to integrate seamlessly with external watch mechanisms, automatically re-rendering templates upon changes.
- Dynamic data/context can be passed to the templates by providing an object to the Pug render function.

Execution Requirements:
- Node.js environment configured for ECMAScript Modules, achieved by setting "type": "module" in package.json or using the .mjs extension.
- Installation of `pug` via npm for Pug template processing.

Note:
- The script logs errors encountered during rendering to ensure continued processing of remaining templates, maximizing development efficiency.
- By specifying source directory and exclusions once, the script provides a straightforward and adaptable solution for rendering Pug templates.

*/

import pug from 'pug';
import { promises as fs } from 'fs';
import { join, relative, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

// Configuration variables
const sourceDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'source'); // Adjust this path as necessary
// Specify paths relative to sourceDir for exclusions (both directories and specific files)
const pugElementsPaths = [
    '_pug',
];
const pugOptions = {
    basedir: sourceDir,
    pretty: true
}; // Add any Pug-specific options here, such as `pretty: true` for formatted HTML output

// Function to check if a path is excluded
function isExcluded(filePath) {
    const relativePath = relative(sourceDir, filePath);
    return pugElementsPaths.some(excludedPath =>
        relativePath === excludedPath || relativePath.startsWith(`${excludedPath}/`));
}

// Function to render a single .pug file
async function renderFile(filePath) {
    if (isExcluded(filePath)) {
        console.log(`Skipping Pug Element: ` + chalk.blue(`${filePath}`));
        return;
    }
    const outputPath = filePath.replace('.pug', '.html');
    try {
        const templateContent = pug.renderFile(filePath, pugOptions); // Add your context data here
        await fs.writeFile(outputPath, templateContent);
        console.log(`Rendered Pug to HTML: ` + chalk.green(`${outputPath}`));
    } catch (error) {
        console.error(`Error Pug Rendering ` + chalk.red(`${filePath}:`, error));
    }
}

// Function to recursively render all .pug files in a directory
async function renderPug(directoryPath) {
    if (isExcluded(directoryPath)) {
        console.log(`Skipping Pug Directory: ` + chalk.blue( `${directoryPath}` ));
        return;
    }
    try {
        const entries = await fs.readdir(directoryPath, { withFileTypes: true });
        for (const entry of entries) {
            const entryPath = join(directoryPath, entry.name);
            if (entry.isDirectory()) {
                await renderPug(entryPath);
            } else if (entry.isFile() && entry.name.endsWith('.pug')) {
                await renderFile(entryPath);
            }
        }
    } catch (err) {
        console.error(`Error reading Pug Elements Path ` + chalk.red(`${directoryPath}:`, err));
    }
}

// Start rendering process
renderPug(sourceDir);

// TODO: Render only what's necessary (changed files, dependants)