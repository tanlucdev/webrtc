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
    professionalsFullName: "Kento De, X.F",
    apptDate: Date.now() + 500000
  }

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
})