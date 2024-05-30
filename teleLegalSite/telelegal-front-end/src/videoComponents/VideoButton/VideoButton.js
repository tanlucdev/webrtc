import { useEffect } from "react"
import { useSelector } from "react-redux"
import { useState } from "react"

const VideoButton = ({ smallFeedEl }) => {
  const callStatus = useSelector(state => state.callStatus)
  const streams = useSelector(state => state.streams)
  const [pendingUpdate, setPendingUpdate] = useState(false)

  const startStopVideo = () => {
    // Nếu có media. Bắt đầu stream thấy video
    if (callStatus.haveMedia) {
      smallFeedEl.current.srcObject = streams.localStream.stream
      // thêm tracks vào peerConnection
    } else {
      setPendingUpdate(true)
    }
  }
  useEffect(() => {
    if (pendingUpdate && callStatus.haveMedia) {
      console.log("Pending update succeeded!")
      setPendingUpdate(false)
      smallFeedEl.current.srcObject = streams.localStream.stream
    }

  }, [pendingUpdate, callStatus.haveMedia])
  return (
    <div className="button-wrapper video-button d-inline-block">
      <i className="fa fa-caret-up choose-video"></i>
      <div className="button camera" onClick={startStopVideo}>
        <i className="fa fa-video"></i>
        <div className="btn-text">{callStatus.video === "display" ? "Stop" : "Start"} Video</div>
      </div>
    </div>
  )
}

export default VideoButton