// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  receive: (channel, callback) => {
    ipcRenderer.on(channel, (_, data) => callback(data));
  },
  removeListener: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback);
  },
  invoke: (channel, ...args) => {
    return ipcRenderer.invoke(channel, ...args);
  },
  redraw: () => ipcRenderer.send("redraw"),
  set: (key, value) => ipcRenderer.invoke('set-store-value', key, value),
  get: (key) => ipcRenderer.invoke('get-store-value', key)
});