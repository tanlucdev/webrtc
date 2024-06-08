
import { useEffect, useState, useRef } from "react"
import { useSearchParams } from "react-router-dom"
import axios from 'axios'
import './VideoComponents.css'
import CallInfo from "./CallInfo"
import ChatWindow from "./ChatWindow"
import ActionButtons from "./ActionButtons"
import addStream from '../redux-elements/actions/addStream'
import { useDispatch, useSelector } from "react-redux"
import createPeerConnection from "../webRTCutilities/createPeerConnection"
import socketConnection from '../webRTCutilities/socketConnection'
import updateCallStatus from "../redux-elements/actions/updateCallStatus"
import clientSocketListeners from "../webRTCutilities/clientSocketListeners"

const MainVideoPage = () => {
  const dispatch = useDispatch()
  const callStatus = useSelector(state => state.callStatus)
  const streams = useSelector(state => state.streams)
  // Lấy chuỗi truy vấn tìm hook
  const [searchParams, setSearchParams] = useSearchParams()
  const [apptInfo, setApptInfo] = useState({})
  const smallFeedEl = useRef(null)
  const largeFeedEl = useRef(null)
  const uuidRef = useRef(null)
  const streamsRef = useRef(null)

  useEffect(() => {
    // Lấy user media (fetch)
    const fetchMedia = async () => {
      const constraints = {
        video: true, // phải có ít nhận 1 constraint
        audio: true,
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        dispatch(updateCallStatus('haveMedia', true)) // cập nhật callStatus để biết là có media
        // dispatch sẽ gửi function đến redux dispatcher vì thế tất cả reducer có thể được thông báo
        // có 2 phần là stream và who
        dispatch(addStream('localStream', stream))
        const { peerConnection, remoteStream } = await createPeerConnection(addIce)
        // remoete1 có thể thay đổi vì không biết sẽ có ai kết nối
        dispatch(addStream('remote1', remoteStream, peerConnection))
        // SDP: thông tin về feed và không có tracks
        // không có tracks sẽ không hữu dụng. Chỉ hữu dụng khi được đưa tracks
      } catch (err) {
        console.log(err)
      }
    }
    fetchMedia()
  }, [])

  useEffect(() => {
    // không thể cập nhật streamRef cho tới khi biết redux đã kết thúc
    if (streams.remote1) {
      streamsRef.current = streams
    }
  }, [streams])

  useEffect(() => {
    const createOfferAsync = async () => {
      // có audio và video, cần offer => tạo offer
      for (const s in streams) {
        if (s !== "localStream") {
          try {
            const pc = streams[s].peerConnection
            const offer = await pc.createOffer()
            pc.setLocalDescription(offer)
            // lấy token từ url cho socket connection
            const token = searchParams.get('token')
            // lấy socket từ socketConnection
            const socket = socketConnection(token)
            socket.emit('newOffer', { offer, apptInfo })
            // thêm event listenrs
            clientSocketListeners(socket, dispatch)

          } catch (err) {
            console.log(err)
          }
        }
      }
      dispatch(updateCallStatus('haveCreatedOffer', true))
    }
    if
      (
      callStatus.audio === "enabled"
      && callStatus.video === "enabled"
      && !callStatus.haveCreatedOffer
    ) {
      createOfferAsync()
    }

  }, [callStatus.audio, callStatus.video, callStatus.haveCreatedOffer])

  useEffect(() => {
    // lắng nghe thay đổi từ callStatus.answer
    // nếu nó tồn tại, có answer
    const asyncAddAnswer = async () => {
      for (const s in streams) {
        if (s !== "localStream") {
          const pc = streams[s].peerConnection
          await pc.setRemoteDescription(callStatus.answer)
          console.log(pc.signalingState)
          console.log("Answer added.")
        }
      }
    }
    if (callStatus.answer) {
      asyncAddAnswer()
    }
  }, [callStatus.answer])
  useEffect(() => {
    // Lấy token được tìm ra khỏi chuỗi truy vấn
    const token = searchParams.get('token')
    const fetchDecodedToken = async () => {
      const resp = await axios.post('https://localhost:9000/validate-link', { token })
      // console.log(resp.data)
      setApptInfo(resp.data)
      uuidRef.current = resp.data.uuid
    }
    fetchDecodedToken()
  }, [])

  useEffect(() => {
    // Lấy token được tìm ra khỏi chuỗi truy vấn
    const token = searchParams.get('token')
    const socket = socketConnection(token)
    clientSocketListeners(socket, addIceCandidateToPc)
  }, [])

  const addIceCandidateToPc = (iceC) => {
    // Them iceCandidate tu remote den peerconnection
    for (const s in streamsRef.current) {
      if (s !== 'localStream') {
        const pc = streamsRef.current[s].peerConnection
        pc.addIceCandidate(iceC)
        console.log("Add an iceCandidate to existing page presence ")
      }
    }
  }

  const addIce = (iceC) => {
    const socket = socketConnection(searchParams.get('token'))
    socket.emit('iceToServer', {
      iceC,
      who: 'client',
      uuid: uuidRef.current
    })

  }

  return (

    <div className="main-video-page">

      <div className="video-chat-wrapper">
        {/* Div giữ remote video, local video và chat window  */}
        <video id="large-feed" ref={largeFeedEl} autoPlay controls playsInline></video>
        <video id="own-feed" ref={smallFeedEl} autoPlay controls playsInline></video>
        {apptInfo.professionalsFullName ? <CallInfo apptInfo={apptInfo} /> : <></>}
        <ChatWindow />
      </div>
      <ActionButtons smallFeedEl={smallFeedEl} />
    </div>
  )
}

export default MainVideoPage