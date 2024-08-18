import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  getPlugins: (category) => ipcRenderer.invoke('get-plugins', category),
  getBuiltinPlugins: (category) => ipcRenderer.invoke('get-builtin-plugins', category),
  addPlugin: (category) => ipcRenderer.invoke('add-plugin', category),
  togglePlugin: (category, name, enabled) => ipcRenderer.invoke('toggle-plugin', { category, name, enabled }),
  removePlugin: (category, name) => ipcRenderer.invoke('remove-plugin', { category, name }),
  saveProject: (projectData) => ipcRenderer.invoke('save-project', projectData),
  openProject: () => ipcRenderer.invoke('open-project'),
  onNewProject: (callback) => ipcRenderer.on('new-project', callback),
  onOpenProject: (callback) => ipcRenderer.on('open-project', callback),
  onSaveProject: (callback) => ipcRenderer.on('save-project', callback),
  onReloadPlugins: (callback) => ipcRenderer.on('reload-plugins', callback),
  requirePlugin: (path) => ipcRenderer.invoke('require-plugin', path)
});