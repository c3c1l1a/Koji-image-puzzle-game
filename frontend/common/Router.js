/**
 * common/Router.js
 * 
 * What it Does:
 *   This file collects all of the koji.json files in your pages directory and builds them into routes to be
 *   served by your application. If your page is missing a koji.json this file is the reason it is not showing up.
 *   We use some fancy react features to lazy load in new pages with react's relatively new Suspense system.
 * 
 * Things to Change:
 *   If you have very specific views about how pages should be routed using react, then change them around here.
 *   Also if you want to use something like helmet to give each page a specific title you can add that in here
 *   as well. Basically anything having to do with switching between pages can be changed around in this file.
 * 
 */

import React, { lazy, Suspense } from 'react';
import createHistory from 'history/createBrowserHistory';
import { Router as BaseRouter, Switch, Route } from 'react-router-dom';

const { koji } = process.env;

// Router
const history = createHistory();
class BrowserRouter extends React.Component {
  render() {
    return <BaseRouter history={history} children={this.props.children} />
  }
}

// Main router
export default class Router extends React.Component {
    render() {
        const routes = koji.pages
            .map(page => {
                const path = page.path.replace('frontend/', '');
                return {
                    ...page,
                    Component: (props) => {
                        const InternalComponent = lazy(() => import(`../${path}`));
                        return (
                            <Suspense fallback={<div />}>
                                <InternalComponent />
                            </Suspense>
                        );
                    },
                    path: page.path,
                };
            });

        return (
            <BrowserRouter>
                <Switch>
                    {routes.map(({ Component, route, path }, i) => (
                        <Route
                            key={i}
                            exact={!route.includes(':')}
                            path={route}
                        >
                            <Component />
                        </Route>
                    ))}
                </Switch>
            </BrowserRouter>
        );
    }
}
