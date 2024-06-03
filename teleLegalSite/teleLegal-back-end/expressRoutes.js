// Nơi tất cả express stuff xảy ra
const app = require('./server').app
const jwt = require('jsonwebtoken')
const linkSecret = 'sdjkdsjksd4ds2eqessad'
const { v4: uuidv4 } = require('uuid')
// Route này là của chúng ta
// Gửi nó đi. Chúng ta sẽ print và past nó vào.
// Nó sẽ thả chúng ta xuống trang React với thông tin đúng cho CLIENT1 để tạo yêu cầu

const professionalsAppointments = []

app.set('professionalsAppointments', professionalsAppointments)

app.get('/user-link', (req, res) => {

  const uuid = uuidv4() // nó là unique id hoặc primary key


  // Dữ liệu cho end-user's appt
  const apptData = {
    professionalsFullName: "Peter Chan, J.D.",
    apptDate: Date.now() + 500000,
    uuid,
    clientName: "mtxinhdep",
  }

  professionalsAppointments.push(apptData)

  // chúng ta cần mã hóa dữ liệu trong token
  // vì thế nó có thể được thêm vào url
  const token = jwt.sign(apptData, linkSecret)
  res.send('https://localhost:3000/join-video?token=' + token)

  // res.json("This is a test route")
})

app.post('/validate-link', (req, res) => {
  // lấy token từ body post request (dùng express.json())
  const token = req.body.token
  // giải mã jwt với linkSecret
  const decodedData = jwt.verify(token, linkSecret)
  // gửi giải mã dữ liệu (object) trở lại front-end
  res.json(decodedData)

  // console.log('professionalsAppointments: ', professionalsAppointments)
})

app.get('/pro-link', (req, res) => {
  const userData = {
    fullName: "Peter Chan, J.D.",
    proId: 1234,
  }
  const token = jwt.sign(userData, linkSecret)
  res.send(`<a href="https://localhost:3000/dashboard?token=${token}" target="_blank">Link here <a/>`)
})