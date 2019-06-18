/**
 * backend/index.js
 * 
 * What it Does:
 *   This file reads through the routes directory and finds every route that needs to be set up on the server.
 *   Routes need to have a koji.json file telling this script where to find the code for the route and what
 *   endpoint to put the route on on the server. In production these routes are setup on AWS lambdas.
 * 
 * Things to Change:
 *   Any specific routes should go in the route directory and not here. If you would like to change anything
 *   about how the routes that you have made should be handled and put on to the server then this is the place
 *   to do it.
 */

import 'babel-polyfill';
import express from 'express';
import * as fs from 'fs';
import bodyParser from 'body-parser';

const app = express();

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  limit: '2mb',
  extended: true,
}));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Jiro-Request-Tag');
  next();
});

// Dynamically execute route handler (and capture console from koji if request
// is tagged)
const __originalConsole = console.log.bind(console);
function processRoute(routeName, isProtected, req, res) {
  const route = require(`./routes/${routeName}/index.js`);

  // Console overload for debugging
  const requestTag = req.headers['x-jiro-request-tag'];
  if (!requestTag) {
    console.log = __originalConsole;
  } else {
    console.log = (...args) => {
      args.unshift(`[koji-log] ${requestTag}`);
      __originalConsole.apply(this, args);
    }
  }

  // Invoke the route
  try {
    route.default(req, res)
      .catch(err => console.log('[koji-error]', err));
  } catch (err) {
      console.log('[koji-error]', err);
  }
}

// Get all routes
const backendConfig = fs
  .readdirSync('./routes/')
  .map((name) => {
    try {
      const body = fs.readFileSync(`./routes/${name}/koji.json`, 'utf8');
      const data = JSON.parse(body);
      return {
        name,
        route: data.routes[0]
      };
    } catch (err) {
      return null;
    }
  })
  .filter(route => route)
  .reduce((config, { name, route }) => {
    config[name] = route;
    return config;
  }, {});

// Create express handlers for each route
Object.keys(backendConfig).forEach((routeName) => {
  const {
      route,
      method,
      isProtected,
  } = backendConfig[routeName];

  if (method === 'GET') {
    app.get(route, (req, res) => {
      processRoute(routeName, isProtected, req, res);
    });
  } else if (method === 'POST') {
    app.post(route, (req, res) => {
      processRoute(routeName, isProtected, req, res);
    });
  } else if (method === 'PUT') {
    app.put(route, (req, res) => {
      processRoute(routeName, isProtected, req, res);
    });
  } else if (method === 'DELETE') {
    app.delete(route, (req, res) => {
      processRoute(routeName, isProtected, req, res);
    });
  }
})

app.listen(process.env.PORT, null, async err => {
    if (err) {
        console.log(err.message);
    }
    console.log('[koji] backend started');
});
