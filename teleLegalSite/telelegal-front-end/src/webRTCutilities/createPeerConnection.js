import peerConfiguration from "./stunServers"

const createPeerConnection = () => {
  return new Promise(async (resolve, reject) => {
    const peerConnection = await new RTCPeerConnection()
    // rtcPeerConnection is the connection to peer.
    // cần nhiều hơn một vào một thời điểm nhất định
    // truyền cho config object, nó chỉ là stun servers
    // nó sẽ lấy ICE candidates
    const remoteStream = MediaStream()
    peerConnection.addEventListener('signalingstatechange', (e) => {
      console.log("Signaling State Change")
      console.log(e)
    })
    peerConnection.addEventListener('icecandidates', (e) => {
      console.log("Found ice candidate...")
      if (e.icecandidate) {
        // gửi đến socket server
      }
      console.log(e)
    })
    resolve({
      peerConnection,
      remoteStream,
    })
  })
}

export default createPeerConnection