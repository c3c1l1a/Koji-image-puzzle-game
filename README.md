# Create React App With Koji

This template is a modification of the npm package `create-react-app` that is made specifically as a Koji template. Modifications have been made to work in the Koji editor, but the original code can be found commented out at the bottom of each file if the files have been modified.

-------
[Original documentation can be found here](#~/REACT_README.md!visual)
# Modifications
1. New Component [Game.js](#~/frontend/src/components/Game.js) acts as the global container for the application.
2. The application is styled using `styled-components`
3. 3 Visual Configuration Controls (VCCs) have been added to the template. These can be quickly modified to your applicaiton
    - [Colors](#~/.koji/colors.json!visual) - Change the text color, background color, & link text color.
    - [Images](#~/.koji/images.json!visual) - Change the spinning icon.
    - [Strings](#~/.koji/strings.json!visual) - Change the page content text & link text.

See [Game.js](#~/frontend/src/components/Game.js) to see how each VCC is used within the context of both `styled-components` and within the global context.