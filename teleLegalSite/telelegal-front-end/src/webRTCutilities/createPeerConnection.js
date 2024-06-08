import peerConfiguration from "./stunServers"

const createPeerConnection = (addIce) => {
  return new Promise(async (resolve, reject) => {
    const peerConnection = await new RTCPeerConnection(peerConfiguration)
    // rtcPeerConnection is the connection to peer.
    // cần nhiều hơn một vào một thời điểm nhất định
    // truyền cho config object, nó chỉ là stun servers
    // nó sẽ lấy ICE candidates
    const remoteStream = new MediaStream()
    peerConnection.addEventListener('signalingstatechange', (e) => {
      console.log("Signaling State Change")
      console.log(e)
    })
    peerConnection.addEventListener('icecandidate', e => {
      console.log("Found ice candidate...")
      if (e.candidate) {
        // gửi đến socket server
        addIce(e.candidate)
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