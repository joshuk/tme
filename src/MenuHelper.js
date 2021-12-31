const inquirer = require('inquirer')

class MenuHelper {
  async createObjectFilter(objectPromise, name) {
    // Something to note is that the object passed in will be a promise, rather than a JS object
    // This allows us to fetch API info while asking for user input, making the program nicer to use

    // This is also to be used with objects (arrays) of a similar strucutre to those returned in TeamworkApiHelper
    // E.G [ { id: 1, name: 'XXX' }, { id: 2, name 'YYY' } ]

    // I'm also using the word 'object' to describe two things that aren't objects, sorry not sorry future me :*

    const objectFilterInput = await inquirer.prompt([
      {
        type: 'input',
        name: 'objectFilter',
        message: `Filter ${name} Name:`
      }
    ])

    // Here we can get the result of the passed promise, since it's likely already completed by now
    // Even if it isn't, this will just pause the script until it is
    const object = await objectPromise
    
    let filteredObject = object
    // If the user actually specified a filter (inputted a string), then we can filter the object by that input
    if(objectFilterInput.objectFilter) {
      filteredObject = object.filter((obj) => {
        return obj.name.toLowerCase().includes(objectFilterInput.objectFilter.toLowerCase())
      })
    }

    const selectedObjectInput = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedObject',
        message: `Select ${name}`,
        choices: filteredObject.map((obj) => obj.name)
      }
    ])
    // Since we're only passing in the name of the object, we have to filter the object again to get the full item
    const selectedObject = object.filter((obj) => obj.name === selectedObjectInput.selectedObject)[0]

    return selectedObject
  }

  async createTextInput(name) {
    // This is basically just a wrapper for inquirer that returns the inputted string rather than the entire object

    const textInput = await inquirer.prompt([
      {
        type: 'input',
        name: 'textInput',
        message: name
      }
    ])

    return textInput.textInput
  }
}

module.exports = MenuHelper