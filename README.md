Create a desktop web app builder using Electron, similar to Bootstrap Studio. The application should allow users to drag and drop elements onto a canvas, edit their properties, and save/load projects. Follow these detailed steps:

Set up the project:

Initialize a new Node.js project
Install Electron, electron-builder, electron-store, and electron-is-dev
Create a basic Electron app structure with main.js, preload.js, and src/index.html


Implement the main process (main.js):

Set up the main window with proper dimensions and webPreferences
Create a menu with File and Tools options
Implement IPC handlers for plugin management, project saving/loading


Create the preload script (preload.js):

Expose safe APIs to the renderer process using contextBridge
Include methods for plugin management, project operations, and event listeners


Design the main UI (src/index.html):

Create a layout with component pane, canvas, and properties pane
Add necessary script tags for app.js, plugin-loader.js, and plugin-manager.js


Implement the app logic (src/scripts/app.js):

Set up drag and drop functionality for elements
Implement element selection and property editing
Handle project saving, loading, and element manipulation on the canvas


Create a plugin system:

Implement plugin-loader.js to handle loading built-in and third-party plugins
Create plugin-manager.js for user interface to manage plugins
Set up a 'plugins' directory with subdirectories for built-in and third-party plugins


Develop built-in plugins:

Create sample plugins like button.js, text.js, input.js in src/plugins/elements/
Use a consistent plugin structure with properties and methods


Implement project save/load functionality:

Use electron-store for saving app settings
Implement JSON-based project saving and loading


Set up the build process:

Configure electron-builder in package.json
Ensure proper file inclusion for built-in plugins in the final package


Handle plugin hot-reloading:

Implement functionality to reload plugins without restarting the app
Update the UI dynamically when plugins change


Ensure proper error handling and logging throughout the app
Implement an export feature to generate HTML, CSS, and JavaScript from the project

Remember to use CommonJS syntax for the main process and ES modules for the renderer process where appropriate. Ensure all IPC communications are properly set up for security. Test thoroughly in both development and production builds."
