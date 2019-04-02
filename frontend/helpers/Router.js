import React, { lazy, Suspense } from 'react';
import createHistory from 'history/createBrowserHistory';
import { Router as BaseRouter, Switch, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import ComponentWrapper from './ComponentWrapper';
import wrapConsole from './wrapConsole';

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
    componentWillMount() {
        // Wire debug hooks if in development environment
        if (process.env.NODE_ENV !== 'production') {
            wrapConsole();
        }
    }

    render() {
        const routes = koji.pages
            .map(page => {
                const path = page.path.replace('frontend/', '');
                return {
                    ...page,
                    Component: (props) => {
                        const InternalComponent = lazy(() => import(`../${path}`));
                        return (
                            <ComponentWrapper
                                componentName={page.name}
                                title={page.name}
                                componentProps={props}
                            >
                                <Suspense fallback={<div />}>
                                    <InternalComponent />
                                </Suspense>
                            </ComponentWrapper>
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
