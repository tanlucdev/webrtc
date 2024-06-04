import { io } from 'socket.io-client'

let socket
const socketConnection = (jwt) => {
  // kiểm tra nếu socket đã kết nối
  if (socket && socket.connected) {
    // chỉ trả về socket để ai cần thiết có thể kết nối
    return socket
  } else {
    // nếu chưa kết nối -> tiến hành kết nối! 
    const socket = io.connect('https://localhost:9000', {
      auth: {
        jwt
      }
    })
    return socket
  }
}

export default socketConnection