const fs = require('fs')
const https = require('https')
const express = require('express')
const app = express()
const socketio = require('socket.io')
app.use(express.static(__dirname))

// generate with mkcert
const key = fs.readFileSync('cert.key')
const cert = fs.readFileSync('cert.crt')


// change express setup to use https
// pass the key and cert to createServer on https
const expressServer = https.createServer({ cert, key }, app)
// create socket.io server ... listen to express port
const io = socketio(expressServer)
expressServer.listen(8181)

// offers will contain {}
const offers = [
  // offererUsername
  // offer
  // offerIceCandidates
  // answererUsername
  // answer
  // answerIceCandidates
]
const connectedSockets = [
  //username, socketId
]

io.on('connection', (socket) => {

  const userName = socket.handshake.auth.userName
  const password = socket.handshake.auth.password
  if (password !== "x") {
    socket.disconnect(true)
    return
  }
  connectedSockets.push({
    socketId: socket.id,
    userName
  })

  // Một người mới sẽ tham gia. Nếu có bất kì yêu cầu nào khả dụng. Phát nó đi.
  if (offers.length) { // check xem nếu có ít nhất một yêu cầu
    socket.emit('availableOffers', offers)
  }

  socket.on('newOffer', newOffer => {
    offers.push({
      offererUsername: userName,
      offer: newOffer,
      offerIceCandidates: [],
      answererUsername: null,
      answer: null,
      answerIceCandidates: []
    })
    console.log(">> New offer:", newOffer.sdp.slice(50))
    // Gừi đến tất cả socket được kết nối ngoại trừ người gọi
    socket.broadcast.emit('newOfferAwaiting', offers.slice(-1))
  })



  socket.on('sendIceCandidateToSignalingServer', iceCandidateObj => {
    const { didIOffer, iceUsername, iceCandidate } = iceCandidateObj
    console.log(iceCandidate)
    if (didIOffer) {
      const offerInOffers = offers.find(offer => offer.offererUsername === iceUsername)
      if (offerInOffers) {
        offerInOffers.offerIceCandidates.push(iceCandidate)
      }
    }
    console.log(">>>> offers: ", offers)
  })
})
