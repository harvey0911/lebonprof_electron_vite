import { app, BrowserWindow } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import { fork } from 'node:child_process'

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

let win: BrowserWindow | null
let backendProcess: any = null

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']


function startBackend() {
  const logPath = path.join(app.getPath('userData'), 'backend.log');
  const logStream = fs.createWriteStream(logPath, { flags: 'a' });

  // In production, we use process.resourcesPath as we've placed the Backend in extraResources
  const backendPath = app.isPackaged
    ? path.join(process.resourcesPath, 'Backend/src/Server.mjs')
    : path.join(app.getAppPath(), '../Backend/src/Server.mjs');

  logStream.write(`\n[${new Date().toISOString()}] Startup attempt: ${backendPath}\n`);
  logStream.write(`File exists: ${fs.existsSync(backendPath)}\n`);
  logStream.write(`Resources path: ${process.resourcesPath}\n`);

  try {
    backendProcess = fork(backendPath, [], {
      env: {
        ...process.env,
        PORT: '5000',
        NODE_ENV: app.isPackaged ? 'production' : 'development',
        USER_DATA_PATH: app.getPath('userData')
      },
      stdio: 'pipe'
    });

    backendProcess.stdout?.on('data', (data: any) => {
      const output = data.toString();
      logStream.write(`[STDOUT] ${output}`);
      console.log(`[Backend] ${output}`);
    });

    backendProcess.stderr?.on('data', (data: any) => {
      const output = data.toString();
      logStream.write(`[STDERR] ${output}`);
      console.error(`[Backend ERROR] ${output}`);
    });

    backendProcess.on('error', (err: any) => {
      logStream.write(`[ERROR] ${err.message}\n`);
      console.error(`[Backend Process Error] ${err.message}`);
    });

    backendProcess.on('exit', (code: number) => {
      logStream.write(`[EXIT] code ${code}\n`);
      console.log(`[Backend Exit] code ${code}`);
    });
  } catch (err: any) {
    logStream.write(`[FORK ERROR] ${err.message}\n`);
    console.error(`[Backend Fork Error] ${err.message}`);
  }
}

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "Le Bon Prof",
    icon: path.join(process.env.VITE_PUBLIC, 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (backendProcess) {
      backendProcess.kill()
    }
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('will-quit', () => {
  if (backendProcess) {
    backendProcess.kill()
  }
})

app.whenReady().then(() => {
  createWindow()

  // Start backend after a short delay to ensure window is up
  setTimeout(() => {
    if (process.env.ELECTRON_SKIP_BACKEND) {
      console.log('[Main] Skipping internal backend startup (ELECTRON_SKIP_BACKEND is set)');
      return;
    }

    try {
      startBackend()
    } catch (e) {
      console.error('Failed to start backend:', e)
    }
  }, 1000)
})
