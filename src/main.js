import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import screenshot from 'screenshot-desktop';
import fs from 'node:fs';
import Store from 'electron-store';
import { getPrompt } from './prompts';
import { machineIdSync } from 'node-machine-id'
import { processWithOpenAI } from './services/ai/openai';

const store = new Store();
let mainWindow = null;

// Регистрируем протокол для deep linking
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('frik', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('frik')
}

// Обработка deep link на Windows
if (process.platform === 'win32') {
  const gotTheLock = app.requestSingleInstanceLock()

  if (!gotTheLock) {
    app.quit()
  } else {
    app.on('second-instance', (event, commandLine) => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()

        // Обработка deep link
        const url = commandLine.pop()
        handleAuthCallback(url)
      }
    })
  }
}

function loadHWID() {
  return store.get('hwid'); // Получаем HWID из хранилища
}

// Функция для сохранения HWID в хранилище
function saveHWID(hwid) {
  store.set('hwid', hwid); // Сохраняем HWID в хранилище
}

// Функция для проверки наличия API ключа
function checkApiKey() {
  const apiKey = store.get('apiKey');
  if (!apiKey) {
    throw new Error('API ключ не найден. Пожалуйста, добавьте его в настройках.');
  }
  return apiKey;
}

// Функция для создания скриншота и конвертации в Base64
async function captureScreenBase64() {
  try {
    const timestamp = Date.now();
    const imagePath = path.join(app.getPath('pictures'), `screenshot_${timestamp}.png`);
    await screenshot({ filename: imagePath });

    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    return base64Image;
  } catch (error) {
    console.error('Ошибка при создании скриншота:', error);
    return null;
  }
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      devTools: true,
    },
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    paintWhenInitiallyHidden: true,
    contentProtection: true,
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  mainWindow.setContentProtection(true);
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.setAlwaysOnTop(true, 'screen-saver', 1);

  // Шорткат для открытия настроек
  globalShortcut.register('CommandOrControl+/', () => {
    mainWindow.webContents.send('change-page');
  });

  // Регистрация шорткатов для управления позицией окна
  globalShortcut.register('CommandOrControl+Up', () => {
    const [x, y] = mainWindow.getPosition();
    mainWindow.setPosition(x, y - 50);
  });

  globalShortcut.register('CommandOrControl+Down', () => {
    const [x, y] = mainWindow.getPosition();
    mainWindow.setPosition(x, y + 50);
  });

  globalShortcut.register('CommandOrControl+Left', () => {
    const [x, y] = mainWindow.getPosition();
    mainWindow.setPosition(x - 50, y);
  });

  globalShortcut.register('CommandOrControl+Right', () => {
    const [x, y] = mainWindow.getPosition();
    mainWindow.setPosition(x + 50, y);
  });

  // Переключение видимости приложения с сохранением фокуса
  globalShortcut.register('CommandOrControl+B', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.setBounds(mainWindow.getBounds()); // Обновляем границы без активации
      mainWindow.setAlwaysOnTop(true, "pop-up"); // Делаем поверх, но без фокуса
      mainWindow.showInactive(); // Показываем без перехвата фокуса
    }
  });

  globalShortcut.register('CommandOrControl+Shift+S', async () => {
    try {
      mainWindow.webContents.send('start-processing');
      const apiKey = checkApiKey();
      const base64Image = await captureScreenBase64();
      if (base64Image) {
        const prompt = getPrompt(store.get('programmingLanguage'));
        const description = await processWithOpenAI(base64Image, prompt, apiKey);
        mainWindow.webContents.send('update-server-text', description);
      } else {
        console.error('Ошибка при создании скриншота');
        mainWindow.webContents.send('update-server-text', 'Ошибка при создании скриншота');
      }
    } catch (error) {
      console.error('Ошибка:', error.message);
      mainWindow.webContents.send('update-server-text', `Ошибка: ${error.message}`);
    }
  });

  ipcMain.on("redraw", () => {
    mainWindow.hide();
    setTimeout(() => mainWindow.show(), 10); // Перерисовка окна
  });
  
  // Обработчики для API ключа
  ipcMain.handle('save-api-key', async (event, apiKey) => {
    try {
      store.set('apiKey', apiKey);
      return { success: true };
    } catch (error) {
      console.error('Ошибка при сохранении API ключа:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-api-key', async () => {
    try {
      const apiKey = store.get('apiKey', '');
      return { success: true, apiKey };
    } catch (error) {
      console.error('Ошибка при получении API ключа:', error);
      return { success: false, error: error.message };
    }
  });

  // Обработчики для языка программирования
  ipcMain.handle('save-programming-language', async (event, language) => {
    try {
      store.set('programmingLanguage', language);
      return { success: true };
    } catch (error) {
      console.error('Ошибка при сохранении языка программирования:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-programming-language', async () => {
    try {
      const language = store.get('programmingLanguage', 'TypeScript');
      return { success: true, language };
    } catch (error) {
      console.error('Ошибка при получении языка программирования:', error);
      return { success: false, error: error.message };
    }
  });

  // Обработчики для работы с хранилищем
  ipcMain.handle('set-store-value', async (event, key, value) => {
    try {
      store.set(key, value);
      return { success: true };
    } catch (error) {
      console.error('Ошибка при сохранении значения:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-store-value', async (event, key) => {
    try {
      const value = store.get(key);
      return { success: true, data: value };
    } catch (error) {
      console.error('Ошибка при получении значения:', error);
      return { success: false, error: error.message };
    }
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  const hwid = machineIdSync();
  const savedHwid = loadHWID();

  if (savedHwid) {
    if (savedHwid === hwid) {
      createWindow();
    } else {
      // Если HWID не совпадает, уведомляем пользователя
      console.log('This application has already been activated on another device.');
      app.quit(); // Завершаем приложение
    }
  } else {
    saveHWID(hwid);
    createWindow();
  }

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  stopCallbackServer();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on("will-quit", () => {
  stopCallbackServer();
  globalShortcut.unregisterAll();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
