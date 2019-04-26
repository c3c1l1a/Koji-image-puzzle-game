/**
 * GlobalContext.js
 * 
 * What it Does:
 *   This file sets up the react context that holds all of the koji customizations
 *   so they can be used through your app. This context is set up in common/App.js
 *   then is referenced in [your component].contextType in every react component
 *   where you want koji customizations. They can be accessed with this.context
 *   once everything is set up.
 * 
 * Things to Change:
 *   This is a pretty simple file that doesn't require a lot of changing. You are
 *   technically able to set defaults in createContext but doing so is not too
 *   relevent because we will always just be using the parameters that koji
 *   customization gives to us.
 */

import React from 'react';

const GlobalContext = React.createContext();

export default GlobalContext;
