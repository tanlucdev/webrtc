
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import axios from 'axios'
import './VideoComponents.css'
import CallInfo from "./CallInfo"
import ChatWindow from "./ChatWindow"

const MainVideoPage = () => {
  // Lấy chuỗi truy vấn tìm hook
  const [searchParams, setSearchParams] = useSearchParams()
  const [apptInfo, setApptInfo] = useState({})

  useEffect(() => {
    // Lấy token được tìm ra khỏi chuỗi truy vấn
    const token = searchParams.get('token')
    console.log(token)
    const fetchDecodedToken = async () => {
      const resp = await axios.post('https://localhost:9000/validate-link', { token })
      // console.log(resp.data)
      setApptInfo(resp.data)
    }
    fetchDecodedToken()
  }, [])
  return (

    <div className="main-video-page">
      {console.log("apptInfo.professionalsFullName: ", apptInfo.professionalsFullName)}

      <div className="video-chat-wrapper">
        {/* Div giữ remote video, local video và chat window  */}
        <video id="large-feed" autoPlay controls playsInline></video>
        <video id="own-feed" autoPlay controls playsInline></video>
        {apptInfo.professionalsFullName ? <CallInfo apptInfo={apptInfo} /> : <></>}
        <ChatWindow />
      </div>
    </div>
  )
}

export default MainVideoPage