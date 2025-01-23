/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require('firebase-functions/v2/https')
const logger = require('firebase-functions/logger')
const express = require('express')
const cors = require('cors')
const fetch = require('node-fetch')

const app = express()
app.use(cors({ origin: '*' }))

app.get('/rainfall', async (req, res) => {
    logger.log('Hello, logs! weather')
    const apiKey = process.env.YAHOO_CLIENT_ID
    const { coordinates, date } = req.query

    try {
        const params = new URLSearchParams({
            appid: apiKey,
            coordinates,
            output: 'json',
            date
        })
        const response = await fetch('https://map.yahooapis.jp/weather/V1/place?' + params.toString(), {
            method: 'GET'
        })
        const data = await response.json()
        res.json(data)
    } catch (error) {
        logger.error('Error fetching weather data:', error)
        res.status(500).send('Error fetching weather data')
    }
})

app.get('/weather', async (req, res) => {
    logger.log('Fetching weather data')
    const { latitude, longitude } = req.query

    try {
        const params = new URLSearchParams({
            latitude,
            longitude,
            hourly: 'temperature_2m,weather_code',
            timezone: 'Asia/Tokyo',
            forecast_days: '3',
            past_days: '1'
        })
        const response = await fetch('https://api.open-meteo.com/v1/forecast?' + params.toString(), {
            method: 'GET'
        })
        const data = await response.json()
        res.json(data)
    } catch (error) {
        logger.error('Error fetching weather data:', error)
        res.status(500).send('Error fetching weather data')
    }
})

exports.api = onRequest({ region: 'asia-northeast1' }, app)
