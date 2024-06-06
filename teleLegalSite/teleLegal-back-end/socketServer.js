const io = require('./server').io
const app = require('./server').app
const linkSecret = 'sdjkdsjksd4ds2eqessad'
const jwt = require('jsonwebtoken')

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
  const handshakeData = socket.handshake.auth.jwt
  let decodedData
  try {
    decodedData = jwt.verify(handshakeData, linkSecret)
  } catch (err) {
    console.log(err)
    socket.disconnect()
  }
  const { fullName, proId } = decodedData
  if (proId) {
    // nó là professional. Cập nhật/ thêm đến connectedProfessionals
    // kiểm tra nếu user đã trong connectedProfessionals
    // nó sẽ xảy ra bởi vì họ kết nối lại
    const connectedPro = connectedProfessionals.find(cp => cp.proId === proId)
    if (connectedPro) {
      // nếu có, chỉ cập nhật socket.id mới
      connectedPro.socketId = socket.id
    } else {
      // nếu không có, đẩy những thông tin vào
      connectedProfessionals.push({
        socketId: socket.id,
        fullName,
        proId,
      })
    }
    // send appt data out to the professional
    const professionalAppointments = app.get('professionalAppointments')
    socket.emit('apptData', professionalAppointments.filter(pa => pa.professionalsFullName === fullName))

    // Lặp qua tất cả yêu cầu và gửi đến professional vừa tham gia
    for (const key in allKnownOffers) {
      if (allKnownOffers[key].professionalsFullName === fullName) {
        // yêu cầu cho professional
        io.to(socket.id).emit('newOfferWaiting', allKnownOffers)
      }
    }
  } else {
    // Là client
  }


  console.log("connectedProfessionals: ", connectedProfessionals)

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


    // Lấy được professionalAppointments từ express
    const professionalAppointments = app.get('professionalAppointments')
    // Tìm appt cụ thể để có thể cập nhật user đang chờ (gửi chúng tôi 1 yêu cầu )
    const pa = professionalAppointments.find(pa => pa.uuid === apptInfo.uuid)
    if (pa) {
      pa.waiting = true
    }

    // Tìm professional cụ thể, vì thế có thể gửi
    const p = connectedProfessionals.find(cp => cp.fullName === apptInfo.professionalsFullName)
    if (p) {
      // chỉ gửi nếu đã được kết nối, không kết nói thì không lấy được info
      const socketId = p.socketId
      // gửi yêu cầu mới
      socket.to(socketId).emit('newOfferWaiting', allKnownOffers[apptInfo.uuid])
      // gửi cập nhật appt info với waiting mới
      socket.to(socketId).emit('apptData',
        professionalAppointments.filter(pa => pa.professionalsFullName === apptInfo.fullName))

    }
  })
})