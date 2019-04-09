const fs = require('fs');

// Recurse through all directories to find jiro dotfiles
function readDirectory(directory) {
  let results = [];
  fs
    .readdirSync(directory)
    .forEach((fileName) => {
      const file = `${directory}/${fileName}`;
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        results = results.concat(readDirectory(file));
      } else {
        results.push(file);
      }
    });
  return results;
}

module.exports = () => {
  let projectConfig = {
    pages: [],
    routes: [],
  };

  readDirectory('..')
    .filter(path => (path.endsWith('koji.json') || path.startsWith('../.koji')) && !path.includes('.koji-resources'))
    .forEach((path) => {
      try {
        const file = JSON.parse(fs.readFileSync(path, 'utf8'));

        Object.keys(file).forEach((key) => {
          // If the key already exists in the project config, use it
          if (projectConfig[key]) {
            if (Array.isArray(projectConfig[key]) && Array.isArray(file[key])) {
                projectConfig[key] = projectConfig[key].concat(file[key]);
            } else {
                projectConfig[key] = Object.assign(projectConfig[key], file[key]);
            }
          } else {
            // Otherwise, set it
            projectConfig[key] = file[key];
          }
        });

        // Create a map of backend routes by name
        projectConfig.backend = {};
        if (projectConfig.routes) {
            projectConfig.routes.forEach(({ name, route }) => {
                projectConfig.backend[name] = `${process.env.JIRO_BACKEND_URL}${route}`;
            });
        }
      } catch (err) {
        //
      }
    });

//   console.log(projectConfig);
  return JSON.stringify(projectConfig);
}
