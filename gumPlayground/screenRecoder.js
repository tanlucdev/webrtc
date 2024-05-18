
let mediaRecorder
const startRecording = () => {
  if (!stream) {
    alert("No current feed.")
    return
  }
  recordedBlobs = []
  console.log("Run start.")
  mediaRecorder = new MediaRecorder(stream)
  mediaRecorder.ondataavailable = e => {
    console.log("Data is available for recorder!")
    recordedBlobs.push(e.data)
  }
  mediaRecorder.start()
  changeButtons([
    'green', 'green', 'blue', 'blue', 'green', 'blue', 'grey', 'blue'
  ])
}


const stopRecording = () => {
  if (!mediaRecorder) {
    alert("Please record before stopping!")
    return
  }
  console.log("Run stop.")
  mediaRecorder.stop()
  changeButtons([
    'green', 'green', 'blue', 'blue', 'green', 'green', 'blue', 'blue'
  ])
}


const playRecording = () => {
  console.log("Run play.")
  if (!recordedBlobs) {
    alert("No recording save.")
    return
  }
  const supperBuffer = new Blob(recordedBlobs)
  const recorderVideoEl = document.querySelector('#other-video')
  recorderVideoEl.src = window.URL.createObjectURL(supperBuffer)
  recorderVideoEl.controls = true
  recorderVideoEl.play()
  changeButtons([
    'green', 'green', 'blue', 'blue', 'green', 'blue', 'green', 'blue'
  ])
}