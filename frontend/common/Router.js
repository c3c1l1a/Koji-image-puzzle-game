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
