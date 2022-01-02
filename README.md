# tme

A real basic command line app to try and make logging time on Teamwork.com quicker and easier.

## Installation
```
git clone https://github.com/joshuk/tme.git
cd tme
npm install
```

## Setup

There are two main bits to setup with `tme`, the `.env` file and the `settings.json` file.

### .env

The `.env` file contains 3 values that are required in order for the app to work.
| Name | Value |
|--|--|
| `TEAMWORK_AUTH_CODE` | Basic Authentication Code for accessing the Teamwork API. https://developer.teamwork.com/projects/apikey/key |
| `TEAMWORK_HOST` | Host URL for your Teamwork team. E.g. - https://yoursite.teamwork.com |
| `TEAMWORK_USER_ID` | Your User ID on Teamwork. E.g. - 474075 |


### settings.json

The `settings.json` file contains all optional settings for your tme instance.

| Name | Value |
|--|--|
| `nonBillableProjects` | An array of all project IDs that should have time marked as non-billable. |
| `shortcuts` | An object containing key:value pairs of objects defining shortcuts to be used within the app. All shortcuts require a `name` and a `project` to do anything, however `tasklist`, `task`, and `description` are all optional. |

For examples of these values, see [settings.json.example](https://github.com/joshuk/tme/blob/main/settings.json.example).

## Usage

`tme` has 4 main commands which can be used to interact with the app.

| Command | Function |
|--|--|
| `tme start`/`tme s` | Starts the timelogging for the day. This command must be ran when timelogging begins. No other commands will work until this has been ran. |
| `tme nopush`/`tme np` | Logs time *locally* without pushing to Teamwork. Mainly to be used for things such as breaks or lunch. |
| `tme lunch`/`tme l` | The same functionality as `nopush`, however auto-populates the local description with `End of Lunch` |
| `tme (--shortcut)` | Running `tme` with no command will bring up the interface for logging time using Teamwork. Optionally, you can include a shortcut defined in `settings.json` as an argument using double dashes (`--`). |

`tme` works using a constantly running timer, running a command will take the time since the last command was ran and use that to log.

For example, here is a potential day using tme:

- 9:00 - `tme start` - Creates a timelog file for the day, starts tracking time at 9am.
- 13:30 - `tme --shortcut1` - Logs time at shortcut 1 and pushes to Teamwork. This will log 4.5 hours (between 9am and 1:30pm) on whichever project/task is specified using this shortcut. *This is where the user's lunch hour would begin.*
- 14:30 - `tme lunch` - Logs *the end* of the user's lunch hour locally, without pushing anything to Teamwork.
- 17:30 - `tme --shortcut2` - Logs time at shortcut 2 and pushes to Teamwork. This will log 3 hours (between 14:30 and 17:30) on whichever project/task is specified using this shortcut. *This is the end of the day, and is where the user would stop working.*

In the case that you made a mistake with timelogging that you would like to fix, or you would like to see time logged locally, this information is stored in local JSON files.

You can access these files in the `/json` folder, named `YYYYMMDD.json`, depending on the date. So for example, `/json/20220101.json` would show all time logged (both locally and on Teamwork) on the 1st of January 2022.
