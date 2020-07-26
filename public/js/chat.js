const socket = io()

const $messageForm = document.querySelector("#message-form")
const $sendLocationButton = document.querySelector("#send-location")
const $sendMessageButton = document.querySelector("#send-message")
const $messageArea = document.querySelector("#message-area")


//templates
const $messagesTemplate = document.querySelector("#messages-template")
const $locationTemplate = document.querySelector("#locations-template")
const $sidebarTemplate = document.querySelector("#sidebar-template")

const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true});

const autoscroll = () => {
    // New message element
    const $newMessage = $messageArea.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messageArea.offsetHeight

    // Height of messageArea container
    const containerHeight = $messageArea.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messageArea.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messageArea.scrollTop = $messageArea.scrollHeight
    }
}

socket.on('user-location', (details) => {
    const html = Mustache.render($locationTemplate.innerHTML, {
        url : details.url,
        createdAt : moment(details.createdAt).format('h:mm a'),
        username : details.username
    })
    $messageArea.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('user-message', (details) => {
    const html = Mustache.render($messagesTemplate.innerHTML, {
        message : details.text,
        createdAt : moment(details.createdAt).format('h:mm a'),
        username : details.username
    })
    $messageArea.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    console.log('roomData is called')
    console.log(users)
    const html = Mustache.render($sidebarTemplate.innerHTML, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

if(username || room){
    socket.emit('join', {username, room}, (error) => {
        alert(error)
        location.href = "/";
    })
}



$sendLocationButton.addEventListener("click", (e) => {
    e.preventDefault()
    if(!navigator.geolocation){
        return alert('location cannot be determined')
    }
    $sendLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
            const location = { latitude : position.coords.latitude,
                  longitude  : position.coords.longitude}
            socket.emit('location', location, (message) => {
                $sendLocationButton.removeAttribute('disabled')
            })
        })
})

$sendMessageButton.addEventListener("click", (e) => {
    e.preventDefault()
    const $messageInput = $messageForm.querySelector('input')
    $sendMessageButton.setAttribute('disabled', 'disabled')    
    const message = $messageInput.value
    socket.emit('message', message, (response) => {
        $sendMessageButton.removeAttribute('disabled')
        $messageInput.focus();
        $messageInput.value = '';
    })
})