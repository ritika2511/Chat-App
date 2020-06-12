const users = []

// Add user
const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase()


    // Vaalidate
    if (!username || !room) {
        return {
            error: 'Enter valid username and room'
        }
    }

    // Existing user
    const exist = users.find((user) => {
        return user.room === room && user.username === username
    })

    if (exist) {
        return {
            error: 'Username is already taken'
        }
    }
    // store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

// remove user
const removeUser = ((id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
})

// get user
const getUser = ((id) => {
    const get = users.find((user) => {
        return user.id === id
    })

    return get
})

// get users in particular room
const getUsersRoom = ((room) => {
    return common = users.filter((user) => user.room === room)

})


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersRoom

}