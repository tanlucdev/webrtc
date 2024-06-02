import { useDispatch, useSelector } from "react-redux"
import { useState, useEffect } from "react"
import ActionButtonCaretDropDown from "../ActionButtonCaretDropDown"
import getDevices from "./getDevices"
import updateCallStatus from "../../redux-elements/actions/updateCallStatus"
import addStream from "../../redux-elements/actions/addStream"

const AudioButton = ({ smallFeedEl }) => {
  const dispatch = useDispatch()
  const callStatus = useSelector(state => state.callStatus)
  const [caretOpen, setCaretOpen] = useState(false)
  const [audioDeviceList, setAudioDeviceList] = useState([])

  let micText;
  if (callStatus.current === "idle") {
    micText = "Join Audio"
  } else if (callStatus.audio) {
    micText = "Mute"
  } else {
    micText = "Unmute"
  }

  useEffect(() => {
    const getDevicesAsync = async () => {
      if (caretOpen) {
        // kiểm tra thiết bị đầu vào
        const devices = await getDevices()
        console.log("Video devices: ", devices.videoDevices)
        setAudioDeviceList(devices.audioOutputDevices.concat(devices.audioInputDevices))
      }
    }
    getDevicesAsync()
  }, [caretOpen])

  const changeAudioDevice = async (e) => {
    // Người dùng muốn chọn camera mong muốn
    // 1. Cần lấy deviceId
    const deviceId = e.target.value.slice(5)
    const audioType = e.target.value.slice(0, 5)

    if (audioType === "output") {
      // set xong cho output
      // 4. (Sắp xếp không theo thứ tự) --> đã cập nhật smallFeedEl
      smallFeedEl.current.setSinkId(deviceId)
    } else if (audioType === "input") {
      // 2. Cần getUserMedia (permission)
      const newConstraints = {
        audio: { deviceId: { exact: deviceId } },
        video: callStatus.videoDevice === "default" ? true : { deviceId: { exact: callStatus.videoDevice } }
      }
      const stream = await navigator.mediaDevices.getUserMedia(newConstraints)
      // 3. Cập nhật redux với mediaDevice, và video là enabled
      dispatch(updateCallStatus('audioDevice', deviceId))
      dispatch(updateCallStatus('audio', 'enabled'))
      // 4. Đã cập nhật ở trên output
      // 5. Cập nhật localStream ở streams
      dispatch(addStream('localStream', stream))
      // 6. Thêm tracks
      const tracks = stream.getAudioTracks()
    }
  }
  return (
    <div className="button-wrapper d-inline-block">
      <i className="fa fa-caret-up choose-audio" onClick={() => setCaretOpen(!caretOpen)}></i>
      <div className="button mic">
        <i className="fa fa-microphone"></i>
        <div className="btn-text">{micText}</div>
      </div>
      {caretOpen ? <ActionButtonCaretDropDown
        defaultValue={callStatus.audioDevice}
        changeHandler={changeAudioDevice}
        deviceList={audioDeviceList}
        type="audio"
      /> : <></>}
    </div>
  )
}

export default AudioButton