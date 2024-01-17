const { app } = require("electron")
const path = require("path")

module.exports = {
    basename: function(filePath) {
        return filePath.replace(/^.*[\\/]/, '')
    },

    AppData: path.join(app.getPath("appData"), "YoutubeDownloader"),
}