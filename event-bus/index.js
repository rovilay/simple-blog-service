const axios = require('axios')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const events = [] // DB

const app = express()
app.use(bodyParser.json())
app.use(cors())

app.post('/events', (req, res) => {
    const event = req.body

    events.push(event)

    axios.post('http://posts-srv:4000/events', event) // posts
    .catch(err => console.error(err.message))
    axios.post('http://comments-srv:4001/events', event) // comments
    .catch(err => console.error(err.message))
    axios.post('http://query-srv:4002/events', event) // query
    .catch(err => console.error(err.message))
    axios.post('http://moderation-srv:4003/events', event) // moderation
    .catch(err => console.error(err.message))

    res.send({ status: 'OK' })
})

app.get('/events', (req, res) => {
    res.send(events)
})

app.listen(4005, () => {
    console.log('Listening on 4005')
})
