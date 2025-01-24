<script setup>
import TimeDisplay from './components/TimeDisplay.vue'
import WeatherDisplay from './components/WeatherDisplay.vue'
import RainfallForecast from './components/RainfallForecast.vue'
// import ScheduleDisplay from './components/ScheduleDisplay.vue'
// import TrainScheduleDisplay from './components/TrainScheduleDisplay.vue'
// import NewsDisplay from './components/NewsDisplay.vue'
// import SlackMessagesDisplay from './components/SlackMessagesDisplay.vue'
import { useSunStore } from './stores/sunStore.js'
import { computed, watch, onMounted, onUnmounted } from 'vue'

const sunStore = useSunStore()
sunStore.fetchSunTimes()

const getBackgroundColor = () => {
    const now = new Date()
    const sunrise = new Date(sunStore.sunrise)
    console.log('sunrise', sunrise)
    const sunset = new Date(sunStore.sunset)
    console.log('sunset', sunset)
    const sunriseStart = new Date(sunrise.getTime() - 30 * 60 * 1000)
    const sunriseEnd = new Date(sunrise.getTime() + 30 * 60 * 1000)
    const sunsetStart = new Date(sunset.getTime() - 30 * 60 * 1000)
    const sunsetEnd = new Date(sunset.getTime() + 30 * 60 * 1000)

    if (now >= sunriseStart && now <= sunriseEnd) {
        console.log('sunrise')
        return 'linear-gradient(to bottom, #a1c4fd, #c2e9fb)' // 薄い青色のグラデーション
    } else if (now >= sunriseEnd && now <= sunsetStart) {
        console.log('daytime')
        return 'linear-gradient(to bottom, #d4fc79, #96e6a1)' // 薄い水色のグラデーション
    } else if (now >= sunsetStart && now <= sunsetEnd) {
        console.log('sunset')
        return 'linear-gradient(to bottom, #ff9a9e, #fecfef)' // オレンジ色のグラデーション
    } else {
        console.log('nighttime')
        return 'linear-gradient(to bottom, #2c3e50, #4ca1af)' // 濃い青色のグラデーション
    }
}

const backgroundColor = computed(() => getBackgroundColor())

watch([() => sunStore.sunrise, () => sunStore.sunset], () => {
    document.body.style.background = backgroundColor.value
})

onMounted(() => {
    document.body.style.background = backgroundColor.value
    const intervalId = setInterval(() => {
        document.body.style.background = getBackgroundColor()
    }, 30 * 60 * 1000) // 30分ごとにチェック

    onUnmounted(() => {
        clearInterval(intervalId)
    })
})
</script>

<template>
    <div class="grid-container">
        <div class="grid-item time">
            <TimeDisplay />
        </div>
        <div class="grid-item weather">
            <WeatherDisplay />
        </div>
        <div class="grid-item rainfall">
            <RainfallForecast />
        </div>
        <!--
        <div class="grid-item schedule">
            <ScheduleDisplay />
        </div>
        <div class="grid-item train-schedule">
            <TrainScheduleDisplay />
        </div>
        <div class="grid-item news">
            <NewsDisplay />
        </div>
        <div class="grid-item slack-messages">
            <SlackMessagesDisplay />
        </div>
        -->
    </div>
</template>

<style scoped>
.grid-container {
    height: 100%;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr 1fr;
    grid-template-areas:
        "time time"
        "weather rainfall"
        "schedule train-schedule"
        "news slack-messages";
    gap: 10px;
    padding: 10px;
    box-sizing: border-box;
}

.grid-item {
    background-color: #f0f0f0;
    padding: 20px;
    border-radius: 8px;
}

.time {
    grid-area: time;
}

.weather {
    grid-area: weather;
    /* width: 50%; */
}

.rainfall {
    grid-area: rainfall;
}

/* .schedule { grid-area: schedule; }
.train-schedule { grid-area: train-schedule; }
.news { grid-area: news; }
.slack-messages { grid-area: slack-messages; } */
</style>
