<template>
    <div class="weather-display">
        <h3>天気予報グラフ</h3>
        <div v-if="weatherForecast.length">
            <canvas ref="weatherCanvas" class="weather-canvas"></canvas>
        </div>
        <div v-else>
            <p>Loading...</p>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, nextTick, watch, TrackOpTypes } from 'vue'
import { storeToRefs } from 'pinia'
import { useWeatherStore } from '../stores/weatherStore'

const weatherStore = useWeatherStore()
const { weatherForecast } = storeToRefs(weatherStore)
const { fetchWeatherForecast } = weatherStore
const weatherCanvas = ref(null)

const formatTime = (time) => {
    const date = new Date(time)
    return ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2)
}

const getWeatherIcon = (code) => {
    if (code >= 0 && code <= 9) {
        return '☀️'
    } else if (code >= 10 && code <= 19) {
        return '🌫️'
    } else if (code >= 20 && code <= 29) {
        return '🌪️'
    } else if (code >= 30 && code <= 39) {
        return '🌧️'
    } else if (code >= 40 && code <= 49) {
        return '🌦️'
    } else if (code >= 50 && code <= 59) {
        return '🌧️'
    } else if (code >= 60 && code <= 69) {
        return '🌧️'
    } else if (code >= 70 && code <= 79) {
        return '❄️'
    } else if (code >= 80 && code <= 99) {
        return '⛈️'
    } else {
        return '❓'
    }
}

const drawTimeLabelsAndIcons = (ctx, weatherForecast, startTime, endTime, graphWidth, graphHeight, padding, height) => {
    const timeRange = endTime - startTime

    weatherForecast.value.forEach((forecast) => {
        const time = new Date(forecast.time).getTime()
        if (time >= startTime && time <= endTime) {
            const x = padding.left + ((time - startTime) / timeRange) * graphWidth

            // Draw time labels on x-axis
            ctx.fillStyle = 'black'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            const timeLabel = formatTime(forecast.time)
            ctx.save()
            ctx.translate(x, height - padding.bottom + 30)
            ctx.rotate(-Math.PI / 2)
            ctx.fillText(timeLabel, 0, 0)
            ctx.restore()

            // Draw weather icons
            const iconY = height - padding.bottom + 10
            ctx.fillText(getWeatherIcon(forecast.weatherCode), x, iconY)
        }
    })
}

const drawGraph = () => {
    const canvas = weatherCanvas.value
    if (!canvas) {
        return
    }
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    const padding = { top: 20, right: 20, bottom: 70, left: 40 }
    const graphHeight = height - padding.top - padding.bottom
    const graphWidth = width - padding.left - padding.right

    ctx.clearRect(0, 0, width, height)

    // Reset color to black
    ctx.strokeStyle = 'black'

    // Draw axes
    ctx.beginPath()
    ctx.moveTo(padding.left, padding.top)
    ctx.lineTo(padding.left, height - padding.bottom)
    ctx.lineTo(width - padding.right, height - padding.bottom)
    ctx.stroke()

    // Draw temperature line
    ctx.beginPath()
    ctx.strokeStyle = 'blue'
    let maxTemp = Math.max(...weatherForecast.value.map(forecast => forecast.temperature))
    let minTemp = Math.min(...weatherForecast.value.map(forecast => forecast.temperature))
    let tempRange = maxTemp - minTemp
    if (tempRange < 5){
        maxTemp += 2.5
        minTemp -= 2.5
        tempRange = maxTemp - minTemp
    }


    // Draw y-axis labels for temperature
    ctx.fillStyle = 'black'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    for (let i = 0; i <= 5; i++) {
        const y = height - padding.bottom - (i / 5) * graphHeight
        const tempLabel = Math.round(minTemp + (i / 5) * tempRange)
        ctx.fillText(tempLabel, padding.left - 10, y)
    }

    // Draw y-axis title
    ctx.save()
    ctx.translate(padding.left - 30, (height - padding.bottom + padding.top) / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = 'center'
    ctx.fillText('気温[℃]', 0, 0)
    ctx.restore()

    const currentTime = new Date().getTime()
    const startTime = currentTime - 3 * 60 * 60 * 1000 // 3 hours before current time
    const endTime = currentTime + 10 * 60 * 60 * 1000 // 10 hours after current time
    const timeRange = endTime - startTime

    weatherForecast.value.forEach((forecast, index) => {
        const time = new Date(forecast.time).getTime()
        if (time >= startTime && time <= endTime) {
            const x = padding.left + ((time - startTime) / timeRange) * graphWidth
            const y = height - padding.bottom - ((forecast.temperature - minTemp) / tempRange) * graphHeight
            if (index === 0) {
                ctx.moveTo(x, y)
            } else {
                ctx.lineTo(x, y)
            }
        }
    })
    ctx.stroke()

    drawTimeLabelsAndIcons(ctx, weatherForecast, startTime, endTime, graphWidth, graphHeight, padding, height)

    // Draw current time line
    if (currentTime >= startTime && currentTime <= endTime) {
        const x = padding.left + ((currentTime - startTime) / timeRange) * graphWidth
        ctx.beginPath()
        ctx.strokeStyle = 'red'
        ctx.moveTo(x, padding.top)
        ctx.lineTo(x, height - padding.bottom)
        ctx.stroke()
        ctx.textAlign = 'left'
        ctx.fillText('現在の時刻', x + 5, padding.top + 10)
    }
}

const resizeCanvas = () => {
    const canvas = weatherCanvas.value
    const parent = canvas.parentElement
    canvas.width = parent.clientWidth
    canvas.height = parent.clientHeight
    drawGraph()
}

onMounted(async () => {
    await fetchWeatherForecast()
    await nextTick()
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    setInterval(async () => {
        await fetchWeatherForecast()
    }, 3600000) // Update weather every 1 hour
    setInterval(() => {
        drawGraph()
    }, 60000) // Update current time line every 1 minute
})

watch(
    () => weatherForecast.value,
    () => {
        drawGraph()
    }
)
</script>

<style scoped>
.weather-display {
    font-size: 1.5em;
    text-align: center;
    height: 100%;
    width: 100%;
}

.weather-canvas {
    width: 100%;
    height: 100%;
    display: block; /* 親要素のサイズに合わせるために追加 */
}
</style>
