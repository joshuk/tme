const fs = require('fs')

class FileHelper {
  filepath = ''

  constructor() {
    this.filepath = './json/'
  }

  doesFileExist(filename) {
    return fs.existsSync(this.filepath + filename)
  }

  getFileContents(filename) {
    if (this.doesFileExist(filename)) {
      return fs.readFileSync(this.filepath + filename)
    }

    return '[]'
  }

  writeArrayToFile(array, filename) {
    const encodedData = JSON.stringify(array)

    fs.writeFileSync(this.filepath + filename, encodedData)
  }
}

module.exports = FileHelper