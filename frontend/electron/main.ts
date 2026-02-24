import { app, BrowserWindow } from 'electron'
import path from 'node:path'
import { spawn, ChildProcess } from 'node:child_process'

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
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

let backendProcess: ChildProcess | null = null

function startBackend() {
  const backendDir = app.isPackaged
    ? path.join(process.resourcesPath, 'Backend')
    : path.join(__dirname, '../../Backend')

  const serverPath = path.join(backendDir, 'src/Server.js')
  const dbPath = app.isPackaged
    ? path.join(app.getPath('userData'), 'lebonprof.db')
    : path.join(backendDir, 'lebonprof.db')

  console.log('Starting backend at:', serverPath)
  console.log('Using database at:', dbPath)

  backendProcess = spawn(process.execPath, [serverPath], {
    cwd: backendDir,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
      DB_PATH: dbPath,
      PORT: '5000'
    }
  })

  if (backendProcess.stdout) {
    backendProcess.stdout.on('data', (data) => {
      console.log(`Backend: ${data}`)
    })
  }

  if (backendProcess.stderr) {
    backendProcess.stderr.on('data', (data) => {
      console.error(`Backend Error: ${data}`)
    })
  }

  backendProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`)
  })
}

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
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
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill()
    backendProcess = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  startBackend()
  createWindow()
})
