import { defineStore } from 'pinia'
import { ref } from 'vue'
import settings from '../config/setting.json'

const convertToJST = (time) => {
    const date = new Date(time)
    date.setHours(date.getHours()) // UTCからJSTに変換
    return date;
}

export const useSunStore = defineStore('sun', () => {
    const sunrise = ref('')
    const sunset = ref('')

    const fetchSunTimes = async () => {
        try {
            const latitude = settings.latitude
            const longitude = settings.longitude

            const url = `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&formatted=0&tzid=Asia/Tokyo`
            const response = await fetch(url, {
                method: 'GET'
            })
            const data = await response.json()

            console.log(JSON.stringify(data))

            if (data.status === 'OK') {
                sunrise.value = convertToJST(data.results.sunrise)
                sunset.value = convertToJST(data.results.sunset)
                console.log('==== ok ====')
                console.log(sunrise.value)
                console.log(sunset.value)
            } else {
                console.error('Error fetching sun times:', data.status)
            }
        } catch (error) {
            console.error('Error fetching sun times:', error)
        }
    }

    return { sunrise, sunset, fetchSunTimes }
})
