const fs = require('fs');


module.exports = () => {

    const { metadata } = JSON.parse(fs.readFileSync('../.koji/metadata.json', 'utf8'));

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
                src: metadata.icon,
                sizes: '192x192'
            },
            {
                src: metadata.icon,
                sizes: '512x512'
            }
        ],
    }

    return JSON.stringify(manifest);
}
