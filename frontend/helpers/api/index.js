const { koji } = process.env;

let routeConfig = {};

if (koji.backend && koji.routes) {
    const backendHost = window.location.host.replace('frontend', 'backend');
    console.log(koji.backend, koji.routes);
    routeConfig = koji.routes.reduce((acc, { name, route, method, isProtected }) => {
        acc[name] = {
            url: koji.backend[name],
            method,
            isProtected,
        };
        return acc;
    }, {});
}

export const Routes = routeConfig;

export Request from './utils/request';
