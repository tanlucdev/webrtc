// Kết nối và lấy tất cả yêu cầu, gọi createOfferEls
socket.on('availableOffers', offers => {
  console.log(offers)
  createOfferEls(offers)
})

// Ai đó tạo một yêu cầu mới và sẵn sàng gọi createOfferEls
socket.on('newOfferAwaiting', offers => {
  createOfferEls(offers)
})
function createOfferEls(offers) {
  const answerEl = document.querySelector('#answer')
  offers.forEach(offer => {
    console.log(offer)
    const newOfferEl = document.createElement('div')
    newOfferEl.innerHTML =
      `<button class="btn btn-success col-1">
        Answer ${offer.offererUsername}
      </button>`
    newOfferEl.addEventListener('click', () => answerOffer(offer))
    answerEl.appendChild(newOfferEl)
  })
}