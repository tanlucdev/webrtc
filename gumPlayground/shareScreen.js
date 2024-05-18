const shareScreen = async () => {
  const options = {
    video: true,
    audio: false,
    suffaceSwitching: 'include', //include/exclude NOT true/false
  }
  try {
    mediaStream = await navigator.mediaDevices.getDisplayMedia(options)
  } catch (err) {
    console.log(err)
  }
  changeButtons([
    'green', 'green', 'blue', 'blue', 'green', 'blue', 'green', 'green'
  ])
}