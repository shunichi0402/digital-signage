<script setup>
import TimeDisplay from './components/TimeDisplay.vue'
import WeatherDisplay from './components/WeatherDisplay.vue'
import RainfallForecast from './components/RainfallForecast.vue'
// import ScheduleDisplay from './components/ScheduleDisplay.vue'
// import TrainScheduleDisplay from './components/TrainScheduleDisplay.vue'
// import NewsDisplay from './components/NewsDisplay.vue'
// import SlackMessagesDisplay from './components/SlackMessagesDisplay.vue'
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
