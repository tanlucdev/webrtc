
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
import proSocketListeners from "../webRTCutilities/proSocketListeners"

const ProMainVideoPage = () => {
  const dispatch = useDispatch()
  const callStatus = useSelector(state => state.callStatus)
  const streams = useSelector(state => state.streams)
  // Lấy chuỗi truy vấn tìm hook
  const [searchParams, setSearchParams] = useSearchParams()
  const [apptInfo, setApptInfo] = useState({})
  const smallFeedEl = useRef(null)
  const largeFeedEl = useRef(null)
  const [haveGottenIce, setHaveGottenIce] = useState(false)
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
        largeFeedEl.current.srcObject = remoteStream
      } catch (err) {
        console.log(err)
      }
    }
    fetchMedia()
  }, [])

  useEffect(() => {
    const getIceAsync = async () => {
      const socket = socketConnection(searchParams.get('token'))
      const uuid = searchParams.get('uuid')
      const iceCandidates = await socket.emitWithAck('getIce', uuid, 'professional')
      console.log("Ice Candidates Received")
      console.log(iceCandidates)
      iceCandidates.forEach(iceC => {
        for (const s in streams) {
          if (s !== 'localStream') {
            const pc = streams[s].peerConnection
            pc.addIceCandidate(iceC)
            console.log("===== Add ice candidates")
          }
        }
      })
    }
    if (streams.remote1 && !haveGottenIce) {
      setHaveGottenIce(true)
      getIceAsync()
      streamsRef.current = streams // cập nhật streamsRef khi biết stream tồn tại

    }
  }, [streams, haveGottenIce])

  useEffect(() => {
    const setAsyncOffer = async () => {
      for (const s in streams) {
        if (s !== 'localStream') {
          const pc = streams[s].peerConnection
          await pc.setRemoteDescription(callStatus.offer)
          console.log(pc.signalingState)
        }
      }
    }
    if (callStatus.offer && streams.remote1 && streams.remote1.peerConnection) {
      setAsyncOffer()
    }
  }, [callStatus.offer, streams.remote1])

  useEffect(() => {
    const createAnswerAsync = async () => {
      // có video và audio, có thể tạo answer và setLocalDescription
      for (const s in streams) {
        if (s !== "localStream") {
          const pc = streams[s].peerConnection
          // Tạo answer
          const answer = await pc.createAnswer();
          // Bởi vì là answering client, answer là localDesciption
          await pc.setLocalDescription(answer)
          console.log(pc.signalingState) // có local answer
          dispatch(updateCallStatus('haveCreatedAnswer', true))
          dispatch(updateCallStatus('answer', answer))
          // Gửi answer đến server
          const token = searchParams.get('token')
          const socket = socketConnection(token)
          const uuid = searchParams.get('uuid')
          socket.emit('newAnswer', { answer, uuid })
        }
      }
    }
    // chỉ tạo câu trả lời nếu audio và vidieo đã enable và haveCreatedAnswer là false
    // nó sẽ chạy nhiều lần, nhưng ba điều kiện chỉ xuất hiện một lần
    if (
      callStatus.audio === "enabled"
      && callStatus.video === "enabled"
      && !callStatus.haveCreatedAnswer
    ) {
      createAnswerAsync()
    }
  }, [callStatus.audio, callStatus.video, callStatus.haveCreatedAnswer])

  useEffect(() => {
    // Lấy token được tìm ra khỏi chuỗi truy vấn
    const token = searchParams.get('token')
    const fetchDecodedToken = async () => {
      const resp = await axios.post('https://localhost:9000/validate-link', { token })
      // console.log(resp.data)
      setApptInfo(resp.data)
    }
    fetchDecodedToken()
  }, [])

  useEffect(() => {
    // Lấy token được tìm ra khỏi chuỗi truy vấn
    const token = searchParams.get('token')
    const socket = socketConnection(token)
    proSocketListeners.proVideoSocketListeners(socket, addIceCandidateToPc)
  }, [])

  const addIceCandidateToPc = (iceC) => {
    // Thêm iceCandidate từ remote đến peerconnection
    for (const s in streamsRef.current) {
      if (s !== 'localStream') {
        const pc = streamsRef.current[s].peerConnection
        console.log("before add pro")
        pc.addIceCandidate(iceC)
        console.log("Added an iceCandidate to existing page presence ")
      }
    }
  }

  const addIce = (iceC) => {
    // gửi icecandidate đến server
    const socket = socketConnection(searchParams.get('token'))
    socket.emit('iceToServer', {
      iceC,
      who: 'professional',
      uuid: searchParams.get('uuid')
    })
  }

  return (

    <div className="main-video-page">

      <div className="video-chat-wrapper">
        {/* Div giữ remote video, local video và chat window  */}
        <video id="large-feed" ref={largeFeedEl} autoPlay controls playsInline></video>
        <video id="own-feed" ref={smallFeedEl} autoPlay controls playsInline></video>
        {callStatus.audio === "off" || callStatus.video === "off"
          ?
          <div className="call-info">
            <h1>
              {searchParams.get('client')} is in the waiting room.<br />
              Can will start when video and audio are enabled.
            </h1>
          </div>
          : <></>
        }
        <ChatWindow />
      </div>
      <ActionButtons
        smallFeedEl={smallFeedEl}
      />
    </div>
  )
}

export default ProMainVideoPage