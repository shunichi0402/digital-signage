<template>
    <div class="rainfall-forecast">
        <h3>降水量予報グラフ</h3>
        <div v-if="rainfallForecast.length">
            <canvas ref="rainfallCanvas" class="rainfall-canvas"></canvas>
        </div>
        <div v-else>
            <p>Loading...</p>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, nextTick, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useWeatherStore } from '../stores/weatherStore'
import { compileScript } from 'vue/compiler-sfc'

const weatherStore = useWeatherStore()
const { rainfallForecast } = storeToRefs(weatherStore)
const { fetchRainfallForecast } = weatherStore
const rainfallCanvas = ref(null)

const formatTime = (time) => {
    const hh = time.slice(8, 10)
    const mi = time.slice(10, 12)
    return `${hh}:${mi}`
}

function parseDate(dateStr) {
    const year = parseInt(dateStr.slice(0, 4))
    const month = parseInt(dateStr.slice(4, 6)) - 1
    const date = parseInt(dateStr.slice(6, 8))
    const hour = parseInt(dateStr.slice(8, 10))
    const minute = parseInt(dateStr.slice(10, 12))

    return new Date(year, month, date, hour, minute)
}

const drawGraph = () => {
    const canvas = rainfallCanvas.value
    if (!canvas) {
        return
    }
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    const padding = { top: 20, right: 20, bottom: 70, left: 40 } // Increase bottom padding
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

    // Draw rainfall line
    ctx.beginPath()
    ctx.strokeStyle = 'blue'
    let maxRainfall = Math.max(...rainfallForecast.value.map(forecast => forecast.rainfall))
    if (maxRainfall < 5) {
        maxRainfall = 5
    }
    const minRainfall = 0
    const rainfallRange = maxRainfall - minRainfall

    // Draw y-axis labels for rainfall
    ctx.fillStyle = 'black'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    for (let i = 0; i <= 5; i++) {
        const y = height - padding.bottom - (i / 5) * graphHeight
        const rainfallLabel = Math.round(minRainfall + (i / 5) * rainfallRange)
        ctx.fillText(rainfallLabel, padding.left - 10, y)
    }

    // Draw y-axis title
    ctx.save()
    ctx.translate(padding.left - 30, (height - padding.bottom + padding.top) / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = 'center'
    ctx.fillText('降水量[mm]', 0, 0)
    ctx.restore()

    const currentTime = new Date().getTime()
    const startTimeStr = rainfallForecast.value[0].date
    const startTime = parseDate(startTimeStr).getTime()
    const endTimeStr = rainfallForecast.value[rainfallForecast.value.length - 1].date
    const endTime = parseDate(endTimeStr).getTime()
    const timeRange = endTime - startTime

    rainfallForecast.value.forEach((forecast, index) => {
        const time = new Date(parseDate(forecast.date)).getTime()
        const x = padding.left + ((time - startTime) / timeRange) * graphWidth;
        const y = height - padding.bottom - (rainfallRange === 0 ? 0 : ((forecast.rainfall - minRainfall) / rainfallRange) * graphHeight);
        if (index === 0) {
            ctx.moveTo(x, y)
        } else {
            ctx.lineTo(x, y)
        }
    })
    ctx.stroke()

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

    // Draw time labels on x-axis
    ctx.fillStyle = 'black'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    rainfallForecast.value.forEach((forecast, index) => {
        const time = new Date(forecast.date).getTime()
        const x = padding.left + (index / (rainfallForecast.value.length - 1)) * graphWidth
        const timeLabel = formatTime(forecast.date)
        ctx.save()
        ctx.translate(x, height - padding.bottom + 30) // Adjust position for new padding
        ctx.rotate(-Math.PI / 2)
        ctx.fillText(timeLabel, 0, 0)
        ctx.restore()
    })
}

const resizeCanvas = () => {
    const canvas = rainfallCanvas.value
    const parent = canvas.parentElement
    canvas.width = parent.clientWidth
    canvas.height = parent.clientHeight
    drawGraph()
}

onMounted(async () => {
    await fetchRainfallForecast()
    await nextTick()
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    setInterval(async () => {
        await fetchRainfallForecast()
    }, 1800000) // Update rainfall forecast every 30 minutes
    setInterval(() => {
        drawGraph()
    }, 60000) // Update current time line every 1 minute
})

watch(
    () => rainfallForecast.value,
    () => {
        drawGraph()
    }
)
</script>

<style scoped>
.rainfall-forecast {
    font-size: 1.5em;
    text-align: center;
    height: 100%;
    width: 100%;
}

.rainfall-canvas {
    width: 100%;
    height: 100%;
    display: block; /* 親要素のサイズに合わせるために追加 */
}
</style>
