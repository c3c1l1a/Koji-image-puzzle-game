/**
 * buildManifest.js
 * 
 * What it does:
 *   This file takes the data that it finds in metadata.json and
 *   wraps it up into a json string of a PWA complient manifest
 *   file. This file should be included and used to serve
 *   a static manifest.json on the root of your project.
 * 
 * Things to Edit:
 *   If you would like any specific options for your PWA 
 *   manifest.json file like more icon sizes or a different
 *   theme color, you can add them to the manifest variable
 *   below.
 */

const fs = require('fs');

module.exports = () => {

    const { metadata } = JSON.parse(fs.readFileSync('../.koji/customization/metadata.json', 'utf8'));

    const manifest = {
        fingerprints: false, 
        name: metadata.title,
        short_name: metadata.title,
        start_url: '.',
        display: 'standalone',
        description: metadata.description,
        background_color: "#FFFFFF",
        theme_color: "#FFFFFF",
        icons: [
            {
                src: metadata.icon,
                sizes: '32x32',
            },
            {
                src: metadata.icon192,
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: metadata.icon512,
                sizes: '512x512',
                type: 'image/jpg',
            }
        ],
    }

    return JSON.stringify(manifest);
}
