const fs = require('fs');

const config = require('../.koji/resources/scripts/buildConfig.js')();
console.log(config);
fs.writeFile('./src/config.json', config, (err) => {  
    // throws an error, you could also catch it here
    if (err) throw err;

    // success case, the file was saved
    console.log('saved config!');
});
