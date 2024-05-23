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
  // offererUserName
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
      offererUserName: userName,
      offer: newOffer,
      offerIceCandidates: [],
      answererUsername: null,
      answer: null,
      answerIceCandidates: []
    })
    // console.log(">> New offer:", newOffer.sdp.slice(50))
    // Gừi đến tất cả socket được kết nối ngoại trừ người gọi
    socket.broadcast.emit('newOfferAwaiting', offers.slice(-1))
  })

  socket.on('newAnswer', offerObj => {
    // console.log("--> offerObj: ", offerObj)
    // Gửi phản hồi (offerOb) trở lại CLIENT1
    // Gửi cho tất cả socket kết nối ngoại trừ người gọi

    const socketToAnswer = connectedSockets.find(socket => socket.userName === offerObj.offererUserName);
    if (!socketToAnswer) {
      console.log("No matching socket found for user:", offerObj.offererUserName);
      return;
    }

    // Tìm được đúng socket, gửi nó đi
    const socketIdToAnswer = socketToAnswer.socketId
    // Tìm được yêu cầu để cập nhật, vì thế cập nhật nó 
    const offerToUpdate = offers.find(offer => offer.offererUserName === offerObj.offererUserName)
    if (!offerToUpdate) {
      console.log("No offerToUpdate")
      return
    }
    offerToUpdate.answer = offerObj.answer
    offerToUpdate.answererUsername = userName
    // socket có .to() cái cho phép gửi đến căn phòng
    // mỗi socket có một phòng riêng
    socket.to(socketIdToAnswer).emit('answerResponse', offerToUpdate)

  })


  socket.on('sendIceCandidateToSignalingServer', iceCandidateObj => {
    const { didIOffer, iceUsername, iceCandidate } = iceCandidateObj
    // console.log(iceCandidate)
    if (didIOffer) {
      const offerInOffers = offers.find(offer => offer.offererUserName === iceUsername)
      if (offerInOffers) {
        offerInOffers.offerIceCandidates.push(iceCandidate)
      }
    }
    // console.log(">>>> offers: ", offers)
  })
})
