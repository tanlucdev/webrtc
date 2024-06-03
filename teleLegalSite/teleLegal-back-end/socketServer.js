const io = require('./server').io
const app = require('./server').app

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
  socket.on('newOffer', ({ offer, apptInfo }) => {
    // offer = sdp/type, apptInfo có uuid có thể thêm vào allKnowOffers
    // vì thế, professional có thể tìm chính xác allKnowOffers
  })
})