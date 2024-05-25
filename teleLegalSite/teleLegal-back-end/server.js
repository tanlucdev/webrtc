// tạo server express và socketio
const fs = require('fs')
const https = require('https')
const express = require('express')
const cors = require('cors')

const socketio = require('socket.io')
const app = express()
app.use(cors()) // nó sẽ mở các Express API đến bất kì domain nào
app.use(express.static(__dirname + '/public'))
app.use(express.json()) //cho phép chuyển Json trong body với body parser

const key = fs.readFileSync('./certs/cert.key')
const cert = fs.readFileSync('./certs/cert.crt')

const expressServer = https.createServer({ key, cert }, app)
const io = socketio(expressServer, {
  cors: ['https://localhost:3000', 'https://localhost:3001', 'https://localhost:3002']
})
expressServer.listen(9000)
module.exports = { io, expressServer, app }


