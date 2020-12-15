import UIkit from 'uikit'
import Icons from 'uikit/dist/js/uikit-icons'

UIkit.use(Icons)

const list = document.querySelector(`ul.uk-list`)
const items = list.querySelectorAll(`li:not(.uk-nav-header)`)

const mainCountEl = document.querySelector(`span.main-count`)
const innerCountEl = document.querySelector(`span.inner-count`)
const topCountEl = document.querySelector(`span.top-count`)
const sideCountEl = document.querySelector(`span.side-count`)
const bodyCountEl = document.querySelector(`span.body-count`)

const totalCountEl = document.querySelector(`span.total-count`)

const overlay = document.getElementById(`allDoneOverlay`)

let topCount = 0
let mainCount = 0
let innerCount = 0
let sideCount = 0
let bodyCount = 0

let totalCount = 0

const mainTotal = document.querySelector(`span.main-total`)
const innerTotal = document.querySelector(`span.inner-total`)
const topTotal = document.querySelector(`span.top-total`)
const sideTotal = document.querySelector(`span.side-total`)
const bodyTotal = document.querySelector(`span.body-total`)

const itemsTotal = document.querySelector(`span.items-total`)

const main = {}
const inner = {}
const top = {}
const side = {}
const body = {}

const total = {}
const progressBar = document.querySelector(`progress.uk-progress`)
const statusMsg = document.getElementById(`statusMsg`)

items.forEach(el => {
    total[el.innerHTML] = false
    if (el.classList.contains(`main`)) {
        main[el.innerHTML] = false
        el.addEventListener(`click`, () => {
            if (!el.classList.contains(`added`)) {
                main[el.innerHTML] = true
                total[el.innerHTML] = true
                el.classList.add(`added`)
                totalCount++
                mainCount++
            } else {
                main[el.innerHTML] = false
                total[el.innerHTML] = false
                el.classList.remove(`added`)
                totalCount--
                mainCount--
            }
            mainCountEl.innerHTML = mainCount
            totalCountEl.innerHTML = totalCount
            progressBar.setAttribute(`value`, totalCount)
            checkStatus()
        })
    } else if (el.classList.contains(`inner`)) {
        inner[el.innerHTML] = false
        el.addEventListener(`click`, () => {
            if (!el.classList.contains(`added`)) {
                inner[el.innerHTML] = true
                total[el.innerHTML] = true
                el.classList.add(`added`)
                totalCount++
                innerCount++
            } else {
                inner[el.innerHTML] = false
                total[el.innerHTML] = false
                el.classList.remove(`added`)
                totalCount--
                innerCount--
            }
            innerCountEl.innerHTML = innerCount
            totalCountEl.innerHTML = totalCount
            progressBar.setAttribute(`value`, totalCount)
            checkStatus()
        })
    } else if (el.classList.contains(`top`)) {
        top[el.innerHTML] = false
        el.addEventListener(`click`, () => {
            if (!el.classList.contains(`added`)) {
                top[el.innerHTML] = true
                total[el.innerHTML] = true
                el.classList.add(`added`)
                totalCount++
                topCount++
            } else {
                top[el.innerHTML] = false
                total[el.innerHTML] = false
                el.classList.remove(`added`)
                totalCount--
                topCount--
            }
            topCountEl.innerHTML = topCount
            totalCountEl.innerHTML = totalCount
            progressBar.setAttribute(`value`, totalCount)
            checkStatus()
        })
    } else if (el.classList.contains(`side`)) {
        side[el.innerHTML] = false
        el.addEventListener(`click`, () => {
            if (!el.classList.contains(`added`)) {
                side[el.innerHTML] = true
                total[el.innerHTML] = true
                el.classList.add(`added`)
                totalCount++
                sideCount++
            } else {
                side[el.innerHTML] = false
                total[el.innerHTML] = false
                el.classList.remove(`added`)
                totalCount--
                sideCount--
            }
            sideCountEl.innerHTML = sideCount
            totalCountEl.innerHTML = totalCount
            progressBar.setAttribute(`value`, totalCount)
            checkStatus()
        })
    } else if (el.classList.contains(`body`)) {
        body[el.innerHTML] = false
        el.addEventListener(`click`, () => {
            if (!el.classList.contains(`added`)) {
                body[el.innerHTML] = true
                total[el.innerHTML] = true
                el.classList.add(`added`)
                totalCount++
                bodyCount++
            } else {
                body[el.innerHTML] = false
                total[el.innerHTML] = false
                el.classList.remove(`added`)
                totalCount--
                bodyCount--
            }
            bodyCountEl.innerHTML = bodyCount
            totalCountEl.innerHTML = totalCount
            progressBar.setAttribute(`value`, totalCount)
            checkStatus()
        })
    }
})

function checkStatus() {
    if (totalCount === Object.keys(total).length) {
        statusMsg.innerHTML = `You have everything, go!`
        statusMsg.classList.add(`success`)
        overlay.classList.add(`shown`)
    } else {
        statusMsg.innerHTML = `You don't have everything yet`
        statusMsg.classList.remove(`success`)
        overlay.classList.remove(`shown`)
    }
}

overlay.addEventListener(`click`, () => {
    overlay.classList.remove(`shown`)
})

topTotal.innerHTML = Object.keys(top).length
mainTotal.innerHTML = Object.keys(main).length
innerTotal.innerHTML = Object.keys(inner).length
sideTotal.innerHTML = Object.keys(side).length
bodyTotal.innerHTML = Object.keys(body).length

itemsTotal.innerHTML = Object.keys(total).length
progressBar.setAttribute(`max`, Object.keys(total).length)
