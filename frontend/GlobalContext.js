import React from 'react';
const { koji } = process.env;

const GlobalContext = React.createContext({
    variables: {},
});

export default GlobalContext;