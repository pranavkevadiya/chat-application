const users = []

const addUser = ({id, username, room}) => {
    if(!username || !room) {
        return {
            error : "Username and Room are required!"
        }
    }
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //check for existing user
    const existingUser = users.find((user) => user.username === username && user.room === room);

    if(existingUser){
        return {
            error : "A user with same name already exists"
        }
    }

    // add user
    const user = {
        id,
        username,
        room
    }
    users.push(user)
    return { user } ;
}

const removeUser = (id) => {
    const findIndex = users.findIndex((user) => user.id === id)
    if(findIndex !== -1){
        return users.splice(findIndex, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    return users.filter((user) => {
        return user.room === room
    })
}

module.exports = {
    getUser,
    getUsersInRoom,
    addUser,
    removeUser
}