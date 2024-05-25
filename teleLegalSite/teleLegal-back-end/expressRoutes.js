// Nơi tất cả express stuff xảy ra

const app = require('./server').app

app.get('/test', (req, res) => {
  res.json("This is a test route")
})