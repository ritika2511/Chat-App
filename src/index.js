const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocation } = require('./utils/generate')
const { addUser, removeUser, getUser, getUsersRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

const public_dir = path.join(__dirname, '../public')
app.use(express.static(public_dir))

io.on('connection', (socket) => {
    console.log("Connected")

    socket.on('join', ({ username, room }, callback) => {
        const { user, error } = addUser({ id: socket.id, username, room })
        if (error) {
            return callback(error)
        }
        socket.join(user.room)

        socket.emit('message', generateMessage("Admin", "Welcome! to this App."))
        socket.broadcast.to(user.room).emit('message', generateMessage("Admin", `${user.username} has joined!!`))

        io.to(user.room).emit('sidebar', {
            room: user.room,
            users: getUsersRoom(user.room)
        })
        callback()
    })
    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Mind your language')
        }
        const user = getUser(socket.id)
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('SendLocation', (location, callback) => {
        // console.log(location.latitude)
        // io.emit('message', `Location: ${location.latitude}, ${location.longitude}`)
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocation(user.username, `https://www.google.com/maps?q=${location.latitude},${location.longitude}`))
        callback("Location shared.")
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessage("Admin", `${user.username} has left`))
            io.to(user.room).emit('sidebar', {
                room: user.room,
                users: getUsersRoom(user.room)
            })
        }


    })


})



server.listen(port, () => {
    console.log("Server is started at", port)
})



// socket.emit('Updatedcount', count)
// socket.on('Increement', () => {
//     count++
//     // socket.emit('Updatedcount', count)
//     io.emit('Updatedcount', count)
// })