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
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true
  })
  localVideoEl.srcObject = stream
  localStream = stream;
  // peerConnection is all set with our STUN servers sent over
  // Đã được thiết lập xong với các máy chủ STUN được gửi qua
  await createPeerConnection()

  // Create offer time! | Tạo yêu cầu
  try {
    console.log("Creating offer...")
    const offer = await peerConnection.createOffer()
    console.log(offer)
    peerConnection.setLocalDescription(offer)
    didIOffer = true
    socket.emit('newOffer', offer) // gửi offer đến signalingServer
  } catch (err) {
    console.log(err)
  }

}

const answerOffer = (offerObj) => {
  console.log(offerObj)
}

const createPeerConnection = () => {
  return new Promise(async (resolve, reject) => {
    //RTCPeerConnection is the thing that creates the connection
    //we can pass a config object, and that config object can contain stun servers
    //which will fetch us ICE candidates
    peerConnection = await new RTCPeerConnection(peerConfiguration)

    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream)
    })
    peerConnection.addEventListener('icecandidate', e => {
      // console.log('... Ice candidate found!')
      // console.log(e)
      if (e.candidate) {
        socket.emit('sendIceCandidateToSignalingServer', {
          iceCandidate: e.candidate,
          iceUsername: userName,
          didIOffer
        })
      }
    })
    resolve();
  })
}

document.querySelector('#call').addEventListener('click', call)

