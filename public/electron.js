const { app, Menu, screen, BrowserWindow, ipcMain, dialog, nativeImage, Tray } = require("electron")
const isDev = require("electron-is-dev")
const Path = require("path")
const { AppData } = require("./electronModule")
const fs = require("fs")
const ytdl = require("ytdl-core")
const { exec } = require("child_process")
const ffmpeg = require("ffmpeg-static-electron")
let ffmpegPath = isDev? ffmpeg.path : `${__dirname}/../../app.asar.unpacked/node_modules/ffmpeg-static-electron/bin/win/x64/ffmpeg.exe`

let win
if(!fs.existsSync(AppData)) fs.mkdirSync(AppData)
const isFirst = app.requestSingleInstanceLock()
if(!isFirst) {
    app.quit()
    process.exit(0)
} else app.on("second-instance", (workingDirectory, argv, additionalData) => {
    win.show()
})

/*
고칠것들

1. Desktop 없으면 계속 다운로드됨
2. 폴더 감지 정규식 수정(띄어쓰기 혹은 괄호에 문제있음) - 해결
3. 파일 저장위치 저장
4. 자동 업데이트 - 해?결
5. 다운로드 순서 정렬 이상함 - 해?결
6. 일부 영상 화질 낮게 다운됨 - 해결
*/
if(!isDev) Menu.setApplicationMenu(false)

let downloadingCount = 0
let tray
const trayImage = nativeImage.createFromPath(Path.join(__dirname, "whitelogo.png"))
const downloadingImage = nativeImage.createFromPath(Path.join(__dirname, "logo512.png"))
//트레이 아이콘
function initTrayIconMenu() {
    tray = new Tray(trayImage.resize({ width: 16, height: 16 }))
    const rightMenu = Menu.buildFromTemplate([
            {label: "프로그램 종료", type: "normal", checked: true, click: ()=> {
                app.quit()
            }},
            {label: "새로고침", type: "normal", checked: true, click: ()=> {
                if(downloadingCount === 0) win.reload()
                else dialog.showMessageBox(win, {
                    type: "info",
                    title: "다운로드 중",
                    message: "다운로드 중에는 새로고침 할 수 없습니다.",
                    buttons: ["확인"]
                })
            }},
        ])
    tray.on("click", (event) => {
        if (win.isVisible()) win.hide()
        else win.show()
    })
    tray.setToolTip("Youtube Downloader")
    tray.setContextMenu(rightMenu)
}

function createWindow() {
    const primaryDisplay = screen.getAllDisplays()[0]
    const { width, height } = primaryDisplay.workAreaSize
    const windowSize = {
        width: Math.ceil(width*(975/3840)), //3840기준 975
        height: Math.ceil(height*(1300/2160)), //2160기준 1300
    }

    const win = new BrowserWindow({
        width: windowSize.width,
        height: windowSize.height,
        x: width - windowSize.width-1,
        y: height - windowSize.height-1,
        show: false,
        center: false,
        skipTaskbar: true,
        frame: false,
        movable: false,
        minimizable: false,
        resizable: false,
        alwaysOnTop: true,
        useContentSize: true,
        icon: `${__dirname}/icon.png`,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            webSecurity: false,
        }
    })
    require("@electron/remote/main").enable(win.webContents)

    isDev ? win.loadURL("http://localhost:3000")
          : win.loadFile(`${__dirname}/../build/index.html`)

    if(isDev) {
        win.webContents.once("did-finish-load", async () => {
            win.show()
            // if(isDev) win.webContents.openDevTools()
        })
    }
    return win
}

app.whenReady().then(() => {
    if (BrowserWindow.getAllWindows().length === 0) {
        win = createWindow()
        require("@electron/remote/main").initialize()
        initTrayIconMenu()
        require("./update")(app, win)
    }
})

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit()
})

ipcMain.on("SelectPath", (event, args) => {
    const type = args.type
    const mime = args.mime

    dialog.showSaveDialog(win, {
        title: "저장",
        filters: [
            { name: (type === "video")? "동영상 파일" : "오디오 파일", extensions: [mime]},
        ]
    }).then(async result => {
        if (!result.canceled) {
            const filePath = result.filePath
            event.sender.send("SelectPath", [filePath])
        } else event.sender.send("SelectPath", [])
    }).catch(err => {
        console.log(err)
    })
})


ipcMain.on("Download", async (event, args) => {
    const url = args[0]
    const id = args[1]
    const type = args[2]
    const mime = args[3]
    let path = args[4].replaceAll("\\", "/")
    let downloadId = args[5]
    try {
        if(!path.endsWith(mime)) path+=`.${mime}`
        if(!fs.existsSync(Path.dirname(path))) return
        downloadingCount++
        await tray.setImage(downloadingImage.resize({ width: 16, height: 16 }))

        const randomCode = randomString(7)
        const videoPath = `${Path.dirname(path)}/.${Path.basename(path)}.${randomCode}.mp4`
        let audioPath = `${Path.dirname(path)}/.${Path.basename(path)}.${randomCode}.mp3`
        if(type === "audio") audioPath = path

        let complete = 0
        const audio = await ytdl(id,{ //오디오 생성
            quality: "highestaudio",
            format: "mp3"
        }).on("progress", async (chunkLength, downloaded, total) => {
            event.sender.send(`SetStatus${downloadId}`, [`오디오 다운로드중: ${Math.round(downloaded/total*1000)/10}%`])
        }).pipe(fs.createWriteStream(audioPath)).on("close", async () => {
            complete++
            if(type === "audio") {
                event.sender.send(`SetStatus${downloadId}`, [true])
                downloadingCount--
                if(downloadingCount === 0) await tray.setImage(trayImage.resize({ width: 16, height: 16 }))
            }
        }).on("error", async (err) => {
            console.log(err)
            event.sender.send(`SetStatus${downloadId}`, [false])
            downloadingCount--
            if(downloadingCount === 0) await tray.setImage(trayImage.resize({ width: 16, height: 16 }))
        })
        if(type === "audio") return

        const video = await ytdl(id,{ //비디오 생성
            quality: "highestvideo",
            format: "mp4"
        }).on("progress", async (chunkLength, downloaded, total) => {
            event.sender.send(`SetStatus${downloadId}`, [`영상 다운로드중: ${Math.round(downloaded/total*1000)/10}%`])
        }).pipe(fs.createWriteStream(videoPath)).on("close", () => {
            complete++
        }).on("error", async (err) => {
            console.log(err)
            event.sender.send(`SetStatus${downloadId}`, [false])
            downloadingCount--
            if(downloadingCount === 0) await tray.setImage(trayImage.resize({ width: 16, height: 16 }))
        })
    

        const interval = setInterval(() => { //합치기
            if(complete === 2) {
                if(fs.existsSync(path)) fs.unlinkSync(path)
                let dot = " ."
                const dotInterval = setInterval(() => {
                    event.sender.send(`SetStatus${downloadId}`, [`영상과 소리 병합중${dot}`])
                    if(dot.length < 6) dot +=" ."
                    else dot = " ."
                }, 500)
                const command = `"${ffmpegPath.replaceAll("\\", "/")}" -i "${videoPath}" -i "${audioPath}" -c copy "${path}"`
                exec(command, async (error, stdout, stderr) => {
                    clearInterval(dotInterval)
                    if(error) {
                        console.log(error)
                        event.sender.send(`SetStatus${downloadId}`, [null, false])
                        downloadingCount--
                        if(downloadingCount === 0) await tray.setImage(trayImage.resize({ width: 16, height: 16 }))
                    } else {
                        event.sender.send(`SetStatus${downloadId}`, [null, true])
                        downloadingCount--
                        if(downloadingCount === 0) await tray.setImage(trayImage.resize({ width: 16, height: 16 }))
                    }
                    fs.unlinkSync(videoPath)
                    fs.unlinkSync(audioPath)
                })
                clearInterval(interval)
            }
        }, 1)
    } catch(err) {
        console.log(err)
        event.sender.send(`SetStatus${downloadId}`, [false])
        downloadingCount--
        if(downloadingCount === 0) await tray.setImage(trayImage.resize({ width: 16, height: 16 }))
    }
})

function randomString(length) {
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    let counter = 0
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
      counter += 1
    }
    return result
}