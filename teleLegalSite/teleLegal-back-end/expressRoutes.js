// Nơi tất cả express stuff xảy ra
const app = require('./server').app
const jwt = require('jsonwebtoken')
const linkSecret = 'sdjkdsjksd4ds2eqessad'

// Route này là của chúng ta
// Gửi nó đi. Chúng ta sẽ print và past nó vào.
// Nó sẽ thả chúng ta xuống trang React với thông tin đúng cho CLIENT1 để tạo yêu cầu
app.get('/user-link', (req, res) => {

  // Dữ liệu cho end-user's appt
  const apptData = {
    professionalFullName: "Kento De, X.F",
    appDate: Date.now()
  }

  // chúng ta cần mã hóa dữ liệu trong token
  // vì thế nó có thể được thêm vào url
  const token = jwt.sign(apptData, linkSecret)
  res.send('https://localhost:3000/join-video?token=' + token)

  // res.json("This is a test route")
})

app.get('/validate-link', (req, res) => {
  const token = req.query.token
  const decodedData = jwt.verify(token, linkSecret)
  res.json(decodedData)
})