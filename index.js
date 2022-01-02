#!/usr/bin/env node

const parseArgs = require('minimist');

const TeamworkApiHelper = require('./src/TeamworkApiHelper');
const DateTimeHelper = require('./src/DateTimeHelper');
const FileHelper = require('./src/FileHelper');
const MenuHelper = require('./src/MenuHelper');

const apiClient = new TeamworkApiHelper(__dirname);
const dateTime = new DateTimeHelper();
const fileHelper = new FileHelper(__dirname);
const menuHelper = new MenuHelper();


//Check if settings file exists, import it if so
let settings = {}
if (fileHelper.doesFileExist('/settings.json', __dirname)) {
  settings = require(`./settings.json`)
}

// Since this is used in a couple of places and doesn't change, may as well put it here
const filename = `${dateTime.getFullDate()}.json`

// Start Timelog function
// Creates timesheet file with new entry without pushing to API
const startTimelog = () => {
  if (fileHelper.doesFileExist(filename)) {
    console.log('Timelogging for today already started. Exiting.')

    return
  }

  const timeArray = [{
    description: 'Start of day',
    formattedTime: dateTime.getTime(),
    timestamp: dateTime.getTimestamp()
  }]

  fileHelper.writeArrayToFile(timeArray, filename)

  console.log('Timelog started')
}


// Log without pushing function
// Mainly to be used for lunch or other breaks that don't need to be logged online, but are noteworthy
const logWithoutPushing = async (description) => {
  if (!fileHelper.doesFileExist(filename)) {
    console.log('Timelogging for the day not started. Exiting.')

    return
  }

  const currentTimeFileContents = fileHelper.getFileContents(filename)
  const currentTimeFile = JSON.parse(currentTimeFileContents)

  // If a description hasn't been passed already (E.G it isn't the end of lunch), allow the user to input one
  if (!description) {
    description = await menuHelper.createTextInput('Enter description:')
  }

  currentTimeFile.push({
    description,
    formattedTime: dateTime.getTime(),
    timestamp: dateTime.getTimestamp()
  })

  fileHelper.writeArrayToFile(currentTimeFile, filename)

  console.log('Time logged locally')
  console.log('')
  console.log(`Description: ${description}`)
}


// Log time and push
// To be used for logging time on any Teamwork project
const logTime = async ({ project, tasklist, task, description, projectName } = {}) => {
  if (!fileHelper.doesFileExist(filename)) {
    console.log('Timelogging for the day not started. Exiting.')

    return
  }
  
  // If a project hasn't been specified, get them from Teamwork and let the user choose
  if (!project) {
    const projectsRequest = apiClient.getProjects()

    // This creates a basic filter based on the stuff fetched from the API above
    const selectedProject = await menuHelper.createObjectFilter(projectsRequest, 'Project')

    project = selectedProject.id
    projectName = selectedProject.name
  }

  // If a tasklist hasn't been specified, get them from Teamwork and let the user choose
  // This code is essentially the same as the above since the data is essentially identical
  if (!tasklist) {
    const tasklistsRequest = apiClient.getTasklistsForProject(project)

    const selectedTasklist = await menuHelper.createObjectFilter(tasklistsRequest, 'Tasklist')

    tasklist = selectedTasklist.id
  }

  // If a task hasn't been specified, you guessed it, get them from Teamwork and let the user choose
  // Same shit as the last two
  if (!task) {
    const tasksRequest = apiClient.getTasksForTasklist(tasklist)

    const selectedTask = await menuHelper.createObjectFilter(tasksRequest, 'Task')

    task = selectedTask.id
  }

  // Get a description for the logged time if one isn't provided
  if (!description) {
    description = await menuHelper.createTextInput('Enter description:')
  }

  // Now we can figure out how much time has passed between the last timestamp and the one we're logging
  const currentTimeFileContents = fileHelper.getFileContents(filename)
  const currentTimeFile = JSON.parse(currentTimeFileContents)

  // Figure out when the last local time log was, then the time passed since
  const lastTimeItem = currentTimeFile[currentTimeFile.length - 1]
  const lastTimeItemTime = dateTime.getTime(lastTimeItem.timestamp)
  const timeDifference = dateTime.getDifferenceBetweenTimestamps(lastTimeItem.timestamp, dateTime.getTimestamp())

  // Let's update the local time file first, so if it doesn't push properly there won't be any issues
  currentTimeFile.push({
    'Project/Shortcut': projectName,
    'Task': task,
    description,
    formattedStartTime: lastTimeItemTime,
    formattedTime: dateTime.getTime(),
    hours: timeDifference.hours,
    minutes: timeDifference.minutes,
    timestamp: dateTime.getTimestamp()
  })
  fileHelper.writeArrayToFile(currentTimeFile, filename)

  // Now determine whether the task is in a billable project or not
  const billable = !(settings.nonBillableProjects || []).includes(project)

  // Now we've got all the data that we need, we can push the time to Teamwork
  await apiClient.createTimelog({
    task,
    description,
    date: dateTime.getFullDate(),
    time: lastTimeItemTime,
    hours: timeDifference.hours,
    minutes: timeDifference.minutes,
    billable
  })

  console.log('Time logged and pushed')
  console.log('')
  console.log(`Project/Shortcut: ${projectName}`)
  console.log(`Description: ${description}`)
  console.log(`From/To: ${lastTimeItemTime}/${dateTime.getTime()}`)
  console.log(`Hours: ${timeDifference.hours}`)
  console.log(`Minutes: ${timeDifference.minutes}`)
}

// This part will run whenever the program is opened
(async () => {
  const arguments = parseArgs(process.argv.slice(2))
  // Get the first command
  const command = arguments._[0]

  // Get the shortcuts to check through
  const shortcuts = Object.keys(settings.shortcuts || {})

  // Handle start command
  if (['start', 's'].includes(command)) {
    startTimelog()

    return
  }

  // Handle nopush/lunch command
  if (['nopush', 'np', 'lunch', 'l'].includes(command)) {
    let description = ''

    // Auto populate the description if we're running the lunch command
    if (['lunch', 'l'].includes(command)) {
      description = 'End of lunch'
    }

    await logWithoutPushing(description)

    return
  }

  // Here we're gonna try and figure out if any shortcuts have been specified
  for (const currentShortcut in arguments) {
    // If the current shortcut is inside the shortcuts specified in the settings
    if (shortcuts.includes(currentShortcut)) {
      const shortcutInfo = settings.shortcuts[currentShortcut]

      console.log(`Using shortcut: ${shortcutInfo.name || currentShortcut}`)
      console.log('')

      // Now just run logTime with the stuff we've got from the settings
      await logTime({
        project: shortcutInfo.project || '',
        tasklist: shortcutInfo.tasklist || '',
        task: shortcutInfo.task || '',
        description: shortcutInfo.description || '',
        projectName: shortcutInfo.name || currentShortcut
      })

      // If a shortcut is specifed, don't run anything else afterwards
      return
    }
  }

  // In case no shortcut is specified, just run the logTime function with no info
  await logTime()
})()