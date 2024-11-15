const { randomBytes } = require('crypto')

const axios = require('axios')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()

app.use(bodyParser.json())
app.use(cors())

const commentsByPostId = {} // DB

app.get('/posts/:id/comments', (req, res) => {
    res.send(commentsByPostId[req.params.id] || [])
})

app.post('/posts/:id/comments', async (req, res) => {
    const commentId = randomBytes(4).toString('hex')
    const postId = req.params.id
    const { content } = req.body
    const comment = { id: commentId, content }

    if (!commentsByPostId[postId]) commentsByPostId[postId] = []

    commentsByPostId[postId].push(comment)

    await axios.post('http://event-bus-srv:4005/events', {
        type: 'CommentCreated',
        data: {
            id: commentId,
            content,
            postId,
            status: 'pending'
        }
    }).catch(err => console.error(err))

    res.status(201).send(comment)
})

app.post('/events', async (req, res) => {
    try {
        console.log('Event Received: ', req.body.type)
    
        switch (req.body.type) {
            case 'CommentModerated':
                const { id, postId, status } = req.body.data
    
                const indx = commentsByPostId[postId]?.findIndex((c) => c.id === id)
    
                if (indx < 0) {
                    break
                }
    
                commentsByPostId[postId][indx] = {
                    ...commentsByPostId[postId][indx],
                    status
                }
    
                await axios.post('http://event-bus-srv:4005/events', {
                    type: 'CommentUpdated',
                    data: { ...commentsByPostId[postId][indx], postId }
                }).catch(err => console.error(err.message))
                break
            default:
                break;
        }
    
        res.send({})
    } catch (error) {
        console.error(error.message)
    }
})

app.listen(4001, () => {
    console.log('Listening on 4001')
})
