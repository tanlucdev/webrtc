
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import axios from 'axios'

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
      console.log(resp.data)
      setApptInfo(resp.data)
    }
    fetchDecodedToken()
  }, [])
  return (
    <h1>{apptInfo.professionalFullName} at {apptInfo.appDate}</h1>
  )
}

export default MainVideoPage