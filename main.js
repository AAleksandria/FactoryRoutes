const electron = require('electron')
const {app, BrowserWindow, Menu} = electron
const path = require('path')
const url = require('url')

// отвечает за главное окно приложение
let mainWindow

// создание основного окна приложения
function createWindow () {
  mainWindow = new BrowserWindow({
    center: true,
    icon: path.join(__dirname, '/files/GoogleMaps.ico')
  })    // создание окна приложения 

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))   // загружает index.html как шаблон для главной страницы приложения


  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.setMinimumSize(580, 400);              // задаёт минимальный размер 
}

// работа с самим приложением, события приложения  
app.on('ready', () => {
  createWindow()
  mainWindow.maximize()
  mainWindow.show()
  electron.powerMonitor.on('on-ac', () => {
    mainWindow.restore()
  })
  electron.powerMonitor.on('on-battery', () => {
    mainWindow.minimize()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
