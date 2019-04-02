import React from 'react';
import { Helmet } from 'react-helmet';

// Component wrapper for hot prop injection
const ComponentWrapper = ({ name, children }) => {
    console.log('[koji] Frontend loaded');

    return (
        <React.Fragment>
        <Helmet>
            <title>{name}</title>
        </Helmet>
        {React.cloneElement(children)}
        </React.Fragment>
    );
}

export default ComponentWrapper;
