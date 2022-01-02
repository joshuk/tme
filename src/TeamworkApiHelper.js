const { default: axios } = require("axios");

class TeamworkApiHelper {
  authCode = ''
  host = ''
  userId = ''

  constructor(dirname) {
    require('dotenv').config({ path: `${dirname}/.env` });

    this.authCode = process.env.TEAMWORK_AUTH_CODE
    this.host = process.env.TEAMWORK_HOST
    this.userId = process.env.TEAMWORK_USER_ID

    if (!this.authCode || !this.host || !this.userId) {
      console.log('.env values must be set before this script will work.')
      process.exit()
    }
  }

  makeRequest(url, options = '') {
    if (!options) {
      options = {
        'method': 'GET',
        'headers': {
          'authorization': `Basic ${this.authCode}`
        }
      }
    }

    options.url = url

    return axios.request(options)
  }

  async getProjects() {
    const url = `${this.host}/projects.json`

    const projectsRequest = await this.makeRequest(url)

    const projects = projectsRequest.data.projects
    const formattedProjects = []

    projects.forEach(project => {
      formattedProjects.push({
        id: project.id,
        name: project.name
      })
    })

    return formattedProjects
  }

  async getTasklistsForProject(project) {
    const url = `${this.host}/projects/${project}/tasklists.json`

    const tasklistRequest = await this.makeRequest(url)

    const tasklists = tasklistRequest.data.tasklists
    const formattedTaskLists = []

    tasklists.forEach(tasklist => {
      formattedTaskLists.push({
        id: tasklist.id,
        name: tasklist.name
      })
    })

    return formattedTaskLists
  }

  async getTasksForTasklist(tasklist) {
    const url = `${this.host}/tasklists/${tasklist}/tasks.json`

    const tasksRequest = await this.makeRequest(url)

    const tasks = tasksRequest.data['todo-items']
    const formattedTasks = []

    tasks.forEach(task => {
      formattedTasks.push({
        id: task.id,
        name: task.content
      })
    })

    return formattedTasks
  }

  async createTimelog({ task, description, date, time, hours, minutes, billable }) {
    const url = `${this.host}/tasks/${task}/time_entries.json`
    const options = {
      'method': 'POST',
      'data': {
        'time-entry': {
          description,
          'person-id': this.userId,
          date,
          time,
          hours,
          minutes,
          'isbillable': billable
        }
      },
      'headers': {
        'authorization': `Basic ${this.authCode}`
      }
    }

    const timelogRequest = await this.makeRequest(url, options)
  }
}

module.exports = TeamworkApiHelper