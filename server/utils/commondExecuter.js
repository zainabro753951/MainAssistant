import { exec } from 'child_process'
import { promisify } from 'util'
import open from 'open'
import axios from 'axios'

const execAsync = promisify(exec)

export const executeSystemCommand = async (commandType, input) => {
  try {
    console.log(`Executing command: ${commandType} for user}`)
    switch (commandType) {
      case 'google_search':
        await open(`https://www.google.com/search?q=${encodeURIComponent(input)}`)
        break

      case 'youtube_search':
        await open(`https://www.youtube.com/results?search_query=${encodeURIComponent(input)}`)
        break

      case 'pc_shutdown':
        if (process.platform === 'win32') {
          await execAsync('shutdown /s /t 0')
        } else {
          await execAsync('shutdown now')
        }
        break

      case 'calculator_open':
        if (process.platform === 'win32') {
          await execAsync('start calc')
        } else if (process.platform === 'darwin') {
          await execAsync('open /System/Applications/Calculator.app')
        } else {
          await execAsync('gnome-calculator')
        }
        break

      case 'weather_show':
        // Implement weather API call
        const weather = await getWeatherData(input)
        return weather

      // Add more command cases as needed

      default:
        console.error(`No execution needed for command type: ${commandType}`)
    }

    return true
  } catch (error) {
    console.error(`Command execution failed: ${commandType}`, error)
    throw new Error(`Failed to execute ${commandType} command`)
  }
}

async function getWeatherData(location) {
  const response = await axios.get(
    `https://api.synopticdata.com/v2/stations/nearesttime?key=${
      process.env.WEATHER_API_KEY
    }&q=${encodeURIComponent(location)}`
  )
  return response.data
}
