import { defineStore } from 'pinia'
import { ref } from 'vue'

const formatDate = (date) => {
    const yyyy = date.getFullYear().toString()
    const mm = (date.getMonth() + 1).toString().padStart(2, '0')
    const dd = date.getDate().toString().padStart(2, '0')
    const hh = date.getHours().toString().padStart(2, '0')
    const mi = date.getMinutes().toString().padStart(2, '0')
    return `${yyyy}${mm}${dd}${hh}${mi}`
}

export const useWeatherStore = defineStore('weather', () => {
    const rainfallForecast = ref([])
    const weatherForecast = ref([])

    const fetchRainfallForecast = async () => {
        try {
            const params = new URLSearchParams({
                coordinates: '140.053447,35.727486',
                date: formatDate(new Date())
            })
            const url = import.meta.env.VITE_WEATHER_API_URL + '/digital-signage-a6df9/asia-northeast1/api/rainfall?' + params.toString()
            const response = await fetch(url, {
                method: 'GET'
            })
            const data = await response.json()

            console.log(JSON.stringify(data))

            // 降水量情報をrainfallForecastに格納
            rainfallForecast.value = data.Feature[0].Property.WeatherList.Weather.map(forecast => ({
                date: forecast.Date,
                rainfall: forecast.Rainfall
            }))

        } catch (error) {
            console.error('Error fetching rainfall forecast data:', error)
        }
    }

    const fetchWeatherForecast = async () => {
        try {
            const params = new URLSearchParams({
                latitude: '35.72748611',
                longitude: '140.05344722'
            })
            const url = import.meta.env.VITE_WEATHER_API_URL + '/digital-signage-a6df9/asia-northeast1/api/weather?' + params.toString()
            const response = await fetch(url, {
                method: 'GET'
            })
            const data = await response.json()

            console.log(JSON.stringify(data))

            // 天気情報をweatherForecastに格納
            weatherForecast.value = data.hourly.time.map((time, index) => ({
                time,
                temperature: data.hourly.temperature_2m[index],
                weatherCode: data.hourly.weather_code[index]
            }))

        } catch (error) {
            console.error('Error fetching weather forecast data:', error)
        }
    }

    return { rainfallForecast, fetchRainfallForecast, weatherForecast, fetchWeatherForecast }
})

// 緯度経度 35.72748611,140.05344722