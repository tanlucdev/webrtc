const fs = require('fs')
const https = require('https')
const express = require('express')
const app = express()
const socketio = require('socket.io')
app.use(express.static(__dirname))

// generate with mkcert
const key = fs.readFileSync('cert.key')
const cert = fs.readFileSync('cert.crt')


// change express setup to use https
// pass the key and cert to createServer on https
const expressServer = https.createServer({ cert, key }, app)
// create socket.io server ... listen to express port
const io = socketio(expressServer)
expressServer.listen(8181)

// offers will contain {}
const offers = [
  // offererUsername
  // offer
  // offerIceCandidates
  // answererUsername
  // answer
  // answericeCandidates
]
io.on('connection', (socket) => {
  console.log("Someone has connected.")

  socket.on('newOffer', newOffer => {

  })
})
