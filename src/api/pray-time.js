import axios from 'axios'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import forEach from 'lodash/forEach'
import 'dayjs/locale/id'

dayjs.extend(timezone)

let tz = dayjs.tz.guess()

if (tz === 'Asia/Bangkok') tz = 'Asia/Jakarta'

const date = dayjs().format('DD-MM-YYYY')

const instance = axios.create({
  baseURL: 'https://api.aladhan.com/v1/',
  timeout: 1000,
  headers: {
    Accept: 'application/json'
  }
})

const translateTime = (time) => {
  switch (time) {
    case 'Asr':
      return 'Ashar'
    case 'Dhuhr':
      return 'Dzuhur'
    case 'Fajr':
      return 'Subuh'
    case 'Imsak':
      return 'Imsak'
    case 'Isha':
      return 'Isya'
    case 'Maghrib':
      return 'Maghrib'
    case 'Midnight':
      return 'Tengah Malam'
    case 'Sunrise':
      return 'Terbit'
    case 'Sunset':
      return 'Terbenam'
    default:
      return 'Tidak Terdefinisi'
  }
}

const parseTimings = (timings) => {
  const times = {}
  forEach(timings, (val, idx) => {
    times[translateTime(idx)] = val
  })

  return times
}

export const timeZone = tz

export default async (lat, lng) => {
  try {
    const { data } = await instance.get('/timings/' + date, {
      params: {
        latitude: lat,
        longitude: lng,
        method: 11, // method using Majlis Ugama Islam Singapura, Singapore
        timezonestring: tz,
        latitudeAdjustmentMethod: 3, // Angle Based
        tune: '1,1,-3,1,2,3,0,2,0', // Time adjustment
        adjustment: 1 // Hijri date adjustment
      }
    })

    const result = data.data
    result.timings = parseTimings(result.timings)
    return data
  } catch (error) {
    console.error(error.message)
    return error
  }
}
