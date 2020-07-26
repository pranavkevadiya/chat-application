const express = require('express')
const path = require('path')
const http = require('http')
const app = express()
const socketio = require('socket.io')
const Filter = require('bad-words')
const {
    generateMessage,
    generateLocationMessage
} = require('./utils/messages')

const {
    getUser,
    getUsersInRoom,
    addUser,
    removeUser
} = require('./utils/users')


const server = http.createServer(app)
const io = socketio(server)

const MESSAGE_PUBLISHER = "user-message"
const LOCATION_PUBLISHER = "user-location"
const MESSAGE_SUBSCRIBER = "message"
const LOCATION_SUBSCRIBER = "location"

io.on('connection' , (socket) => {
    socket.emit(MESSAGE_PUBLISHER, generateMessage('Admin', 'Welcome man, please type a message'))

    socket.on(MESSAGE_SUBSCRIBER, (message, callback) => {
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('Message contains bad words')
        }
        const user = getUser(socket.id)
        if(!user){
            callback({error : 'User has disconnected'})
        }
        callback()
        io.to(user.room).emit(MESSAGE_PUBLISHER, generateMessage(user.username, message))
    })

    socket.on(LOCATION_SUBSCRIBER, (location, callback) => {
        const user = getUser(socket.id)
        if(!user){
            callback({error : 'User has disconnected'})
        }
        callback()
        io.to(user.room).emit(LOCATION_PUBLISHER, generateLocationMessage(user.username, location.latitude, location.longitude))
    })

    socket.on('join', ({username, room}, callback) => {
        room = room.trim().toLowerCase()
        const {error, user} = addUser({ id : socket.id, username, room})
        //Error while joining the room
        if(error){
            return callback('Error occurred :' + error)
        }
        socket.join(room)
        socket.broadcast.to(room).emit(MESSAGE_PUBLISHER, generateMessage('Admin', `${username} has just joined`))

        //users in the room
        const users = getUsersInRoom(user.room)
        io.to(user.room).emit('roomData', {
            room,
            users
        })
    })

    socket.on('disconnect', ()=> {
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit(MESSAGE_PUBLISHER, generateMessage('Admin', `${user.username} just disconnected`))
            //users in the room
            const users = getUsersInRoom(user.room)
            io.to(user.room).emit('roomData', {
                room: user.room,
                users
            })
        }
    })
})

const publicDir = path.join(__dirname, '../public')
const port = process.env.PORT || 3000
app.use(express.static(publicDir))

server.listen(port, () => {
    console.log(`Server is listening at ${port}`)
})
