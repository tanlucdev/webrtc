import updateCallStatus from "../../redux-elements/actions/updateCallStatus"

const startAudioStream = (streams) => {
  const localStream = streams.localStream
  for (const s in streams) { // s là key
    // Tạo localStream trước không có nghĩa khi lặp vòng lặp sẽ lặp qua localStream trước
    // Vì vậy phải kiểm tra xem có phải localStream không
    if (s !== "localStream") {
      // không addTracks to the localStream 
      const curStream = streams[s]
      // thêm Tracks cho tất cả peerConnections
      localStream.stream.getAudioTracks().forEach(t => {
        curStream.peerConnection.addTrack(t, streams.localStream.stream)
      })
    }
  }
}

export default startAudioStream