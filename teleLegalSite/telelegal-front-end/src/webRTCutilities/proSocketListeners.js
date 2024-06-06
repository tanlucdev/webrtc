import updateCallStatus from "../redux-elements/actions/updateCallStatus"

const proSocketListeners = (socket, setApptInfo, dispatch) => {
  socket.on('apptData', apptData => {
    console.log(apptData)
    setApptInfo(apptData)
  })

  socket.on('newOfferWaiting', offerData => {
    // gửi yêu cầu đến redux và nó có thể khả dụng sau này
    dispatch(updateCallStatus('offer', offerData.offer))
    dispatch(updateCallStatus('myRole', 'answerer'))
  })
}

export default proSocketListeners