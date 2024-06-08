import updateCallStatus from "../redux-elements/actions/updateCallStatus"

const clientSocketListeners = (socket, dispatch, addIceCandidateToPC) => {
  socket.on('answerToClient', answer => {
    console.log(answer)
    dispatch(updateCallStatus('answer', answer))
    dispatch(updateCallStatus('myRole', 'offerer'))
  })

  socket.on('iceToClient', iceC => {
    addIceCandidateToPC(iceC)
  })
}

export default clientSocketListeners