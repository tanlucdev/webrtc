import updateCallStatus from "../redux-elements/actions/updateCallStatus"

const proDashBoardSocketListeners = (socket, setApptInfo, dispatch) => {
  socket.on('apptData', apptData => {
    setApptInfo(apptData)
  })

  socket.on('newOfferWaiting', offerData => {
    // gửi yêu cầu đến redux và nó có thể khả dụng sau này
    dispatch(updateCallStatus('offer', offerData.offer))
    dispatch(updateCallStatus('myRole', 'answerer'))
  })
}

const proVideoSocketListeners = (socket, addIceCandidateToPC) => {
  socket.on('iceToClient', iceC => {
    addIceCandidateToPC(iceC)
  })
}

export default { proDashBoardSocketListeners, proVideoSocketListeners }