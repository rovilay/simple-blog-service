const { randomBytes } = require('crypto')

const axios = require('axios')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()

app.use(bodyParser.json())
app.use(cors())

const posts = {} // DB

const handleEvent = (type, data) => {
    switch (type) {
        case 'PostCreated':
            const { id: postId, title } = data
            posts[postId] = { id: postId, title, comments: [] }
            break
        case 'CommentCreated':
            posts[data.postId]?.comments.push({ ...data })
            break
        case 'CommentUpdated':
            console.log('here🙂', data)
            const { id: commentId } = data
            const indx = posts[data.postId]?.comments.findIndex(c => c.id === commentId)

            if (indx >= 0) {
                posts[data.postId].comments[indx] = {
                    ...posts[data.postId]?.comments[indx],
                    ...data,
                }
            }
            
            break
        default:
            break;
    }
}

app.get('/posts', (req, res) => {
    res.send(posts)
})

app.post('/events', (req, res) => {
    console.log('Event Received: ', req.body.type)
    const { data, type } = req.body
    console.log('type😀', type)
    
    handleEvent(type, data)

    console.log(posts)
    res.send({})
})

app.listen(4002, async () => {
    console.log("Listening on 4002");
    try {
      const res = await axios.get("http://event-bus-srv:4005/events");
    
      for (let event of res.data) {
        console.log("Processing event:", event.type);
        handleEvent(event.type, event.data);
      }
    } catch (error) {
      console.log(error.message);
    }
  });

