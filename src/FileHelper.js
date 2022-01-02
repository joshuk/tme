const fs = require('fs')

class FileHelper {
  filepath = ''

  constructor(dirname) {
    this.filepath = `${dirname}/json/`
  }

  doesFileExist(filename, filepath = this.filepath) {
    if (!fs.existsSync(filepath)) {
      fs.mkdirSync(filepath)
    }

    return fs.existsSync(filepath + filename)
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