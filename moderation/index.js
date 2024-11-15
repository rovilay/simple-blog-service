const { randomBytes } = require('crypto')
const axios = require('axios')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()

app.use(bodyParser.json())
app.use(cors())


app.post('/events', async (req, res) => {
    console.log('Event Received: ', req.body.type)

    const { data, type } = req.body
    
    switch (type) {
        case 'CommentCreated':
            const { content } = data

            const comment = { ...data }

            if (content.includes('orange')) comment.status = 'rejected'
            else comment.status = 'approved'

            await axios.post('http://event-bus-srv:4005/events', {
                type: 'CommentModerated',
                data: comment
            }).catch(err => console.error(err))
            break
        default:
            break;
    }

    res.send({})
})

app.listen(4003, () => {
    console.log('Listening on 4003')
})
