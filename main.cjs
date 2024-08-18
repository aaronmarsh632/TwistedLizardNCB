import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import Store from 'electron-store';
import electronIsDev from 'electron-is-dev';

const store = new Store();

let mainWindow;
let pluginWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('src/index.html');
  mainWindow.maximize();
  mainWindow.setFullScreen(true);

  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        { label: 'New Project', click: () => mainWindow.webContents.send('new-project') },
        { label: 'Open Project', click: () => mainWindow.webContents.send('open-project') },
        { label: 'Save Project', click: () => mainWindow.webContents.send('save-project') },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Tools',
      submenu: [
        { label: 'Plugins', click: createPluginWindow }
      ]
    }
  ]);

  Menu.setApplicationMenu(menu);

  // Ensure plugins_3p directory exists
  const userPluginsDir = path.join(app.getPath('userData'), 'plugins_3p');
  fs.mkdir(userPluginsDir, { recursive: true }).catch(console.error);
}

function createPluginWindow() {
  if (pluginWindow) {
    pluginWindow.focus();
    return;
  }

  pluginWindow = new BrowserWindow({
    width: 600,
    height: 400,
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  pluginWindow.loadFile('src/plugin-manager.html');

  pluginWindow.on('closed', () => {
    pluginWindow = null;
    mainWindow.webContents.send('reload-plugins');
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('get-plugins', async (event, category) => {
  try {
    const builtInPluginsDir = path.join(__dirname, 'src', 'plugins', category);
    const userPluginsDir = path.join(app.getPath('userData'), 'plugins_3p', category);
    
    const builtInPlugins = await getPluginsFromDir(builtInPluginsDir, true);
    const userPlugins = await getPluginsFromDir(userPluginsDir, false);
    
    return [...builtInPlugins, ...userPlugins];
  } catch (error) {
    console.error('Error reading plugins:', error);
    return [];
  }
});

async function getPluginsFromDir(dir, isBuiltIn) {
  try {
    await fs.access(dir);
    const files = await fs.readdir(dir);
    return files
      .filter(file => file.endsWith('.js'))
      .map(file => ({
        name: file.replace('.js', ''),
        path: path.join(dir, file),
        isBuiltIn,
        enabled: isBuiltIn ? true : store.get(`plugins.${file.replace('.js', '')}`, true)
      }));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

ipcMain.handle('add-plugin', async (event, category) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'JavaScript', extensions: ['js'] }]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const sourcePath = result.filePaths[0];
    const fileName = path.basename(sourcePath);
    const destDir = path.join(app.getPath('userData'), 'plugins_3p', category);
    const destPath = path.join(destDir, fileName);

    try {
      await fs.mkdir(destDir, { recursive: true });
      await fs.copyFile(sourcePath, destPath);
      const pluginName = fileName.replace('.js', '');
      store.set(`plugins.${pluginName}`, true);
      mainWindow.webContents.send('reload-plugins');
      return { success: true, name: pluginName };
    } catch (error) {
      console.error('Error adding plugin:', error);
      return { success: false, error: error.message };
    }
  }

  return { success: false };
});

ipcMain.handle('toggle-plugin', async (event, { category, name, enabled }) => {
  store.set(`plugins.${name}`, enabled);
  mainWindow.webContents.send('reload-plugins');
  return { name, enabled };
});

ipcMain.handle('remove-plugin', async (event, { category, name }) => {
  const pluginPath = path.join(app.getPath('userData'), 'plugins_3p', category, `${name}.js`);
  try {
    await fs.unlink(pluginPath);
    store.delete(`plugins.${name}`);
    mainWindow.webContents.send('reload-plugins');
    return { success: true };
  } catch (error) {
    console.error('Error removing plugin:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-project', async (event, projectData) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [{ name: 'Project Files', extensions: ['json'] }]
  });

  if (!result.canceled && result.filePath) {
    try {
      await fs.writeFile(result.filePath, JSON.stringify(projectData));
      return { success: true, path: result.filePath };
    } catch (error) {
      console.error('Error saving project:', error);
      return { success: false, error: error.message };
    }
  }
  return { success: false };
});

ipcMain.handle('open-project', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    filters: [{ name: 'Project Files', extensions: ['json'] }],
    properties: ['openFile']
  });

  if (!result.canceled && result.filePaths.length > 0) {
    try {
      const data = await fs.readFile(result.filePaths[0], 'utf-8');
      return { success: true, data: JSON.parse(data) };
    } catch (error) {
      console.error('Error opening project:', error);
      return { success: false, error: error.message };
    }
  }
  return { success: false };

});

ipcMain.handle('get-builtin-plugins', async (event, category) => {
  const builtInPluginsDir = electronIsDev
    ? path.join(__dirname, 'src', 'plugins', category)
    : path.join(process.resourcesPath, 'app.asar', 'src', 'plugins', category);
  
  try {
    const plugins = await getPluginsFromDir(builtInPluginsDir, true);
    return plugins;
  } catch (error) {
    console.error('Error reading built-in plugins:', error);
    return [];
  }
});

ipcMain.handle('require-plugin', (event, path) => {
  return require(path);
});

ipcMain.on('require-plugin-sync', (event, path) => {
  try {
      event.returnValue = require(path);
  } catch (error) {
      console.error(`Error requiring plugin at ${path}:`, error);
      event.returnValue = null;
  }
});