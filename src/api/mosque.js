import axios from 'axios'

const instance = axios.create({
  baseURL: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
  timeout: 1000,
  headers: {
    Accept: 'application/json'
  }
})

export default async (key, lat, lng) => {
  try {
    const { data } = await instance.get('', {
      params: {
        location: `${lat},${lng}`,
        radius: 1500,
        type: 'mosque',
        key
      }
    })

    return data.results
  } catch (error) {
    console.error(error.message)
    return error
  }
}
