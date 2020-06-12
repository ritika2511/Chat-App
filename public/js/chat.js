const socket = io()

// Elements
const $message = document.querySelector('#replyMessage')
const $input = $message.querySelector('input')
const $button = $message.querySelector('button')

// share location elements
const $locationButton = document.querySelector('#location')
const $div1 = document.querySelector('#div1')


// templates
const template1 = document.querySelector('#template1').innerHTML
const locationTemplate = document.querySelector('#locationTemplate').innerHTML
const sidebarTemplate = document.querySelector('#sidebarTemplate').innerHTML


const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // new msg element
    const $newMsg = $div1.lastElementChild

    // Height
    const MsgStyles = getComputedStyle($newMsg)
    const MsgMargin = parseInt(MsgStyles.marginBottom)
    const MsgHeight = $newMsg.offsetHeight + MsgMargin

    // visible height
    const visibleHeight = $div1.offsetHeight

    // Container height
    const containerHeight = $div1.scrollHeight

    const scrollOffset = $div1.scrollTop + visibleHeight

    if (containerHeight - MsgHeight <= scrollOffset) {
        $div1.scrollTop = $div1.scrollHeight
    }
}

// socket.on('Updatedcount', (count) => {
//     console.log('Count has updated.', count)
// })

// document.querySelector('#increement').addEventListener('click', () => {
//     console.log('Clicked')
//     socket.emit('Increement')
// })


socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(template1, {
        rendermessage: message.text,
        UserName: message.username,
        createdAt: moment(message.createdAt).format("hh:mm:ss A")
    })
    $div1.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

$message.addEventListener('submit', (e) => {
    e.preventDefault()
        // disable after clicking button 
    $button.setAttribute('disabled', 'disabled')

    const message = e.target.elements.msg.value
    socket.emit('sendMessage', message, (error) => {
        // enabling button
        $button.removeAttribute('disabled')
        $input.value = ' '
        $input.focus()
        if (error) {
            return console.log(error)
        }
        console.log("Delivered!!!")
    })
})

socket.on('locationMessage', (locationurl) => {
    console.log(locationurl)
    const link = Mustache.render(locationTemplate, {
        url: locationurl.url,
        UserName: locationurl.username,
        createdAt: moment(locationurl.createdAt).format("hh:mm:ss A")
    })
    $div1.insertAdjacentHTML('beforeend', link)
    autoscroll()
})




$locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }
    // disable
    $locationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        // console.log(position)

        socket.emit('SendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (sendAcknowledge) => {
            // enable
            $locationButton.removeAttribute('disabled')
            console.log(sendAcknowledge)
        })
    })

})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})

socket.on('sidebar', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebarDiv').innerHTML = html
})