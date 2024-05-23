const userName = "Kento-" + Math.floor(Math.random() * 100000)
const password = "x"
document.querySelector("#user-name").innerHTML = userName

const socket = io.connect('https://localhost:8181/', {
  auth: {
    userName, password
  }
})

const localVideoEl = document.querySelector('#local-video')
const remoteVideoEl = document.querySelector('#remote-video')

let localStream
let remoteStream
let peerConnection
let didIOffer = false

let peerConfiguration = {
  iceServers: [
    {
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302'
      ]
    }
  ]
}

// when a client initiates a call | khi khách hàng bắt đầu cuộc gọi
const call = async (e) => {
  await fetchUserMedia()
  // peerConnection is all set with our STUN servers sent over
  // Đã được thiết lập xong với các máy chủ STUN được gửi qua
  await createPeerConnection()

  // Create offer time! | Tạo yêu cầu
  try {
    console.log("Creating offer...")
    const offer = await peerConnection.createOffer()
    // console.log(offer)
    peerConnection.setLocalDescription(offer)
    didIOffer = true
    socket.emit('newOffer', offer) // gửi offer đến signalingServer
  } catch (err) {
    console.log(err)
  }

}

const answerOffer = async (offerObj) => {
  await fetchUserMedia()
  await createPeerConnection(offerObj)
  const answer = await peerConnection.createAnswer({})
  await peerConnection.setLocalDescription(answer)// Đây là CLIENT2
  // ClIENT 2 sử dụng answer như localDescription
  // console.log(">> offerObj: ", offerObj)
  // console.log('answer:', answer)
  // nên là have-local-pranser vì CLIENT2 set local desc của nó vào answer của nó.
  // console.log(peerConnection.signalingState)
  // Thêm phản hồi đến offerObj vì thế server biết yêu cầu nào liên quan
  offerObj.answer = answer
  // Phát phản hồi đến signaling answer, vì thế nó có thể phát tới CLIENT1
  socket.emit('newAnswer', offerObj)
}

const addAnswer = async (offerObj) => {
  // addAnswer được gọi trong socketListeners khi một answerResponse được phát đi (emitted).
  // Tại điểm này, offer và answer sẽ được trao đổi
  // Bây giờ CLIENT1 cần set remote
  await peerConnection.setRemoteDescription(offerObj.answer)
  console.log(peerConnection.signalingState)
}

const fetchUserMedia = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true
      })
      localVideoEl.srcObject = stream
      localStream = stream;
      resolve()
    } catch (err) {
      console.log(err)
      reject()
    }
  })
}

const createPeerConnection = (offerObj) => {
  return new Promise(async (resolve, reject) => {
    //RTCPeerConnection is the thing that creates the connection
    //we can pass a config object, and that config object can contain stun servers
    //which will fetch us ICE candidates
    peerConnection = await new RTCPeerConnection(peerConfiguration)
    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream)
    })

    peerConnection.addEventListener("signalingstatechange", (event) => {
      // console.log(event)
      // console.log("peerConnection.signalingState: ", peerConnection.signalingState)
    })

    peerConnection.addEventListener('icecandidate', e => {
      console.log('... Ice candidate found!')
      // console.log(e)
      if (e.candidate) {
        socket.emit('sendIceCandidateToSignalingServer', {
          iceCandidate: e.candidate,
          iceUsername: userName,
          didIOffer
        })
      }
    })
    if (offerObj) {
      // không true khi gọi từ call()
      // sẽ true khi gọi từ answerOffer()
      // console.log(peerConnection.signalingState) //sẽ ỗn định vì không có setDesc chạy 
      await peerConnection.setRemoteDescription(offerObj.offer)
      // Sẽ có  have-remote-offer, vì client2 sẽ có setRemoteDesc cho yêu cầu
      // console.log(peerConnection.signalingState)
    }
    resolve();
  })
}

document.querySelector('#call').addEventListener('click', call)

