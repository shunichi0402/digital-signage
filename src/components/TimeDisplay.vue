<template>
    <div class="time-display">
        {{ currentTime }}
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const currentTime = ref(new Date().toLocaleTimeString())

const updateTime = () => {
    currentTime.value = new Date().toLocaleTimeString()
}

onMounted(() => {
    setInterval(updateTime, 1000)
})
</script>

<style scoped>
.time-display {
    font-size: 3em;
    text-align: center;
}
</style>
