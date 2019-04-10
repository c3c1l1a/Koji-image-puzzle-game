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

// Dynamically execute route handler (and capture console from jiro if request
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

// Start backend server
const isInLambda = !!process.env.LAMBDA_TASK_ROOT;
if (isInLambda) {
    const serverlessExpress = require('aws-serverless-express');
    const server = serverlessExpress.createServer(app);
    exports.default = (event, context) => {
        console.log('NEW', event);
        serverlessExpress.proxy(server, event, context);
    };
} else {
    app.listen(3333, null, async err => {
    if (err) {
        console.log(err.message);
    }
    console.log('[koji] backend started');
    });
}

