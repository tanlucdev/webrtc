import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useState } from "react"
import startLocalVideoStream from "./startLocalVideoStream"
import updateCallStatus from "../../redux-elements/actions/updateCallStatus"
import getDevices from "./getDevices"
import addStream from "../../redux-elements/actions/addStream"
import ActionButtonCaretDropDown from "../ActionButtonCaretDropDown"

const VideoButton = ({ smallFeedEl }) => {

  const dispatch = useDispatch()
  const callStatus = useSelector(state => state.callStatus)
  const streams = useSelector(state => state.streams)
  const [pendingUpdate, setPendingUpdate] = useState(false)
  const [caretOpen, setCaretOpen] = useState(false)
  const [videoDeviceList, setVideoDeviceList] = useState([])

  useEffect(() => {
    const getDevicesAsync = async () => {
      if (caretOpen) {
        // kiểm tra thiết bị đầu vào
        const devices = await getDevices()
        console.log("Video devices: ", devices.videoDevices)
        setVideoDeviceList(devices.videoDevices)
      }
    }
    getDevicesAsync()
  }, [caretOpen])

  const changeVideoDevice = async (e) => {
    // Người dùng muốn chọn camera mong muốn
    // 1. Cần lấy deviceId
    const deviceId = e.target.value
    // 2. Cần dùng getUserMedia(permission)
    const newConstraints = {
      audio: callStatus.audioDevice === "default" ? true : { deviceId: { exact: callStatus.audioDevice } },
      video: { deviceId: { exact: deviceId } }
    }
    const stream = await navigator.mediaDevices.getUserMedia(newConstraints)
    // 3. Cập nhật redux với mediaDevice, và video là enabled
    dispatch(updateCallStatus('videoDevice', deviceId))
    dispatch(updateCallStatus('video', 'enabled'))
    // 4. Cập nhật smallFeedEl
    smallFeedEl.current.srcObject = stream
    // 5. Cập nhật localStream ở streams
    dispatch(addStream('localStream', stream))
    // 6. Thêm tracks
  }

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
      <i className="fa fa-caret-up choose-video" onClick={() => setCaretOpen(!caretOpen)}></i>
      <div className="button camera" onClick={startStopVideo}>
        <i className="fa fa-video"></i>
        <div className="btn-text">{callStatus.video === "enabled" ? "Stop" : "Start"} Video</div>
      </div>
      {caretOpen ? <ActionButtonCaretDropDown
        defaultValue={callStatus.videoDevice}
        changeHandler={changeVideoDevice}
        deviceList={videoDeviceList}
      /> : <></>}
    </div>
  )
}

export default VideoButton