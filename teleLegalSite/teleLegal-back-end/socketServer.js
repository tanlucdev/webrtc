const io = require('./server').io
const app = require('./server').app

const connectedProfessionals = []


const allKnownOffers = {
  // uniqueID - key
  // offer 
  // professionalsFullName
  // clientName
  // appDate
  // offererIceCandidates
  // answer
  // answerIceCandidates
}

io.on('connection', socket => {
  console.log(socket.id, "has connected")


  const fullName = socket.handshake.auth.fullName

  connectedProfessionals.push({
    socketId: socket.id,
    fullName: fullName,
  })

  socket.on('newOffer', ({ offer, apptInfo }) => {
    // offer = sdp/type, apptInfo có uuid có thể thêm vào allKnowOffers
    // vì thế, professional có thể tìm chính xác allKnowOffers

    allKnownOffers[apptInfo.uuid] = {
      ...apptInfo,
      offer,
      offererIceCandidates: [],
      answer: null,
      answerIceCandidates: [],
    }

    // không gửi nó cho tất cả như chat server
    // chỉ gửi cho professional
    const p = connectedProfessionals.find(cp => cp.fullName === apptInfo.professionalsFullName)
    if (p) {
      // chỉ gửi nếu đã được kết nối, không kết nói thì không lấy được info
      const socketId = p.socketId
      socket.to(socketId).emit('newOfferWaiting', allKnownOffers[apptInfo.uuid])
    }
  })
})