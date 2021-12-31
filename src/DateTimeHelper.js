class DateTimeHelper {
  date = ''

  constructor() {
    this.date = new Date()
  }

  getTimestamp() {
    const timestamp = Date.now() / 1000

    return 300 * Math.round(timestamp/300)
  }

  getMinute(date = this.date) {
    const minute = date.getMinutes()

    return String(5 * Math.round(minute/5)).padStart(2, '0')
  }

  getHour(date = this.date) {
    return String(date.getHours()).padStart(2, '0')
  }

  getTime(timestamp = '') {
    let date = this.date

    if (timestamp) {
      date = new Date(timestamp * 1000)
    }

    // Here we need a bit of logic, as weird times like 20:60 can be returned due to the rounding
    let hours = this.getHour(date)
    let minutes = this.getMinute(date)

    if (minutes === '60') {
      hours = parseInt(hours) + 1
      minutes = '00'
    }

    if (hours === '24') {
      hours = '00'
    }

    return `${hours}:${minutes}`
  }

  getDay() {
    return String(this.date.getDate()).padStart(2, '0')
  }

  getMonth() {
    return String(this.date.getMonth() + 1).padStart(2, '0')
  }

  getYear() {
    return this.date.getFullYear()
  }

  getFullDate() {
    return `${this.getYear()}${this.getMonth()}${this.getDay()}`
  }

  getDifferenceBetweenTimestamps(start, end) {
    const minutesBetween = (end - start) / 60

    return {
      hours: Math.floor(minutesBetween / 60),
      minutes: minutesBetween % 60
    }
  }
}

module.exports = DateTimeHelper