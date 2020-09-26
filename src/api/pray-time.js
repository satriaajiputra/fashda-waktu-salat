// import setiap library
import axios from 'axios'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import forEach from 'lodash/forEach'
import 'dayjs/locale/id'

// extends library timezone ke dalam dayjs
dayjs.extend(timezone)

// dapatkan zona waktu
let tz = dayjs.tz.guess()

// ubah zona waktu
if (tz === 'Asia/Bangkok') tz = 'Asia/Jakarta'

// dapatkan tanggal dengan format DD-MM-YYYY dengan library dayjs
const date = dayjs().format('DD-MM-YYYY')

// buat object axios dengan melakukan beberapa
// pengaturan API Aladhan
const instance = axios.create({
  baseURL: 'https://api.aladhan.com/v1/', // atur baseURL ke API Aladhan
  timeout: 1000, // atur lama waktu habis setiap request ke server API
  headers: { // atur default header agar menerima jenis response JSON
    Accept: 'application/json'
  }
})

// buat fungsi untuk translate waktu ke dalam Bahasa Indonesia
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

// lakukan translate pada data waktu salat
const parseTimings = (timings) => {
  const times = {}
  forEach(timings, (val, idx) => {
    times[translateTime(idx)] = val
  })

  return times
}

// export zona waktu
export const timeZone = tz

// export default fungsi dari file pray-time.js
export default async (lat, lng) => {
  try {
    // lakukan rqeuest ke lokasi /timings/
    // dengan metode GET
    const { data } = await instance.get('/timings/' + date, {
      // atur parameter
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

    // dapatkan data
    const result = data.data

    // lakukan translate waktu salat ke Bahasa Indonesia
    result.timings = parseTimings(result.timings)

    // kembalikan nilai data
    return data
  } catch (error) {
    // jika terjadi error. tampilkan pada console
    console.error(error.message)
    // kembalikan nilai error
    return error
  }
}
