document.addEventListener(`DOMContentLoaded`, () => {
    function reqListener() {
        console.log(this.responseText)
    }

    const params = {
        email: 'info@visualio.cz',
        score: 8,
        vat: '02027933',
    }

    const oReq = new XMLHttpRequest()
    oReq.addEventListener('load', reqListener)
    oReq.open('POST', 'http://localhost:3000/api/score?_tracy_skip_error')
    oReq.setRequestHeader('Content-Type', 'application/json')
    oReq.send(JSON.stringify(params))
})
