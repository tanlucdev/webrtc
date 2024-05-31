import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useState } from "react"
import startLocalVideoStream from "./startLocalVideoStream"
import updateCallStatus from "../../redux-elements/actions/updateCallStatus"

const VideoButton = ({ smallFeedEl }) => {

  const dispatch = useDispatch()
  const callStatus = useSelector(state => state.callStatus)
  const streams = useSelector(state => state.streams)
  const [pendingUpdate, setPendingUpdate] = useState(false)
  const [caretOpen, setCaretOpen] = false

  const startStopVideo = () => {
    // Nếu có media. Bắt đầu stream thấy video
    if (callStatus.video === "enabled") {
      // cập nhật redux callStatus
      dispatch(updateCallStatus('video', "disabled"))
      // đặt stream thành disabled
      const tracks = streams.localStream.stream.getVideoTracks()
      tracks.forEach(t => t.enabled = false)
    } else if (callStatus.video === "disabled") {
      // cập nhật redux callStatus
      dispatch(updateCallStatus('video', "enabled"))
      // đặt stream thành enabled
      const tracks = streams.localStream.stream.getVideoTracks()
      tracks.forEach(t => t.enabled = true)
    } else if (callStatus.haveMedia) {
      smallFeedEl.current.srcObject = streams.localStream.stream
      // thêm tracks vào peerConnection
      startLocalVideoStream(streams, dispatch)
    } else {
      setPendingUpdate(true)
    }
  }
  useEffect(() => {
    if (pendingUpdate && callStatus.haveMedia) {
      console.log("Pending update succeeded!")
      setPendingUpdate(false)
      smallFeedEl.current.srcObject = streams.localStream.stream
      startLocalVideoStream(streams, dispatch)

    }

  }, [pendingUpdate, callStatus.haveMedia])
  return (
    <div className="button-wrapper video-button d-inline-block">
      <i className="fa fa-caret-up choose-video" onClick={() =>}></i>
      <div className="button camera" onClick={startStopVideo}>
        <i className="fa fa-video"></i>
        <div className="btn-text">{callStatus.video === "enabled" ? "Stop" : "Start"} Video</div>
      </div>
    </div>
  )
}

export default VideoButton