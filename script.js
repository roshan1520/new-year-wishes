const canvas = document.getElementById('fireworks')
const ctx = canvas.getContext('2d')

function resize() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}
resize()
window.addEventListener('resize', resize)

/* ===== EDGE + CARD DETECTION ===== */
function isEdgePosition(x, y) {
  const m = 150
  return x < m || x > canvas.width - m || y < m || y > canvas.height - m
}

function isInsideCard(x, y) {
  const card = document.querySelector('.ny-card')
  if (!card) return false
  const r = card.getBoundingClientRect()
  return x > r.left && x < r.right && y > r.top && y < r.bottom
}

/* ===== AUDIO ===== */
const music = document.getElementById('bgMusic')
let audioCtx, analyser, dataArray

music.addEventListener('play', () => {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  const source = audioCtx.createMediaElementSource(music)
  analyser = audioCtx.createAnalyser()
  analyser.fftSize = 256
  dataArray = new Uint8Array(analyser.frequencyBinCount)
  source.connect(analyser)
  analyser.connect(audioCtx.destination)
})

/* ===== FIREWORK ENGINE ===== */
let rockets = []
let particles = []

class HeartParticle {
  constructor(x, y, vx, vy, color) {
    this.x = x
    this.y = y
    this.vx = vx
    this.vy = vy
    this.life = 120
    this.alpha = 1
    this.color = color
  }

  update() {
    this.vy += 0.06
    this.x += this.vx
    this.y += this.vy
    this.alpha -= 0.01
    this.life--
  }

  draw() {
    ctx.save()
    ctx.globalAlpha = this.alpha
    ctx.fillStyle = this.color
    ctx.font = '16px serif'
    ctx.fillText('❤', this.x, this.y)
    ctx.restore()
  }
}

class Rocket {
  constructor(x, targetY, shape) {
    this.x = x
    this.y = canvas.height
    this.targetY = targetY
    this.speed = 6 + Math.random() * 3
    this.color = `hsl(${Math.random() * 360},100%,60%)`
    this.shape = shape
    this.trail = []
  }

  update() {
    this.trail.push({ x: this.x, y: this.y })
    if (this.trail.length > 10) this.trail.shift()
    this.y -= this.speed

    ctx.beginPath()
    ctx.moveTo(this.trail[0].x, this.trail[0].y)
    this.trail.forEach((p) => ctx.lineTo(p.x, p.y))
    ctx.strokeStyle = this.color
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2)
    ctx.fillStyle = this.color
    ctx.fill()

    if (this.y <= this.targetY) {
      explode(this.x, this.y, this.color, this.shape)
      rockets.splice(rockets.indexOf(this), 1)
    }
  }
}

function explode(x, y, color, shape) {
  if (shape === 'heart') {
    heartExplosion(x, y, color)
    return
  }

  const count = shape === 'circle' ? 80 : 90
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2
    const s = Math.random() * 6
    particles.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: 100,
      alpha: 1,
      color,
    })
  }
}

function heartExplosion(x, y, color) {
  for (let i = 0; i < 40; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = Math.random() * 4 + 2

    particles.push(
      new HeartParticle(
        x,
        y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        color
      )
    )
  }
}

/* ===== AUTO LAUNCH ===== */
function autoLaunch() {
  if (Math.random() < 0.035) {
    let x, y
    do {
      x = Math.random() * canvas.width
      y = Math.random() * canvas.height * 0.4 + 80
    } while (!isEdgePosition(x, y) || isInsideCard(x, y))

    const shapes = ['circle', 'circle', 'heart', 'star']
    rockets.push(new Rocket(x, y, shapes[Math.floor(Math.random() * 3)]))
  }
}

/* ===== CLICK ===== */
canvas.addEventListener('click', (e) => {
  if (!isEdgePosition(e.clientX, e.clientY)) return
  if (isInsideCard(e.clientX, e.clientY)) return
  rockets.push(new Rocket(e.clientX, e.clientY, 'circle'))
})

/* ===== ANIMATE ===== */
function animate() {
  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  autoLaunch()
  rockets.forEach((r) => r.update())

  particles.forEach((p, i) => {
    if (p instanceof HeartParticle) {
      p.update()
      p.draw()
    } else {
      p.vy += 0.08
      p.x += p.vx
      p.y += p.vy
      p.alpha -= 0.01
      p.life--

      ctx.globalAlpha = p.alpha
      ctx.fillStyle = p.color
      ctx.fillRect(p.x, p.y, 2, 2)
      ctx.globalAlpha = 1
    }

    if (p.life <= 0) particles.splice(i, 1)
  })

  requestAnimationFrame(animate)
}
animate()

/* ===== UI ===== */
function generateWish() {
  const name = document.getElementById('name').value || 'Friend'
  document.getElementById('wish').innerText = `🎉 Happy New Year From ${name}! 🎆✨`
}
function toggleMusic() {
  music.paused ? music.play() : music.pause()
}
function shareWish() {
  window.open(
    `https://wa.me/?text=${encodeURIComponent(
      document.getElementById('wish').innerText
    )}`,
    '_blank'
  )
}
/* ================= QUOTES ================= */
const quotes = [
  'Any new beginning is forged from the shards of the past, not from the abandonment of the past.',
  'In our perfect ways, in the ways we are beautiful, in the ways we are human — we are here. Happy New Year’s. Let’s make it ours.',
  "This year's book, at midnight turns to footnote in the next.",
  'You are never too old to set another goal or to dream a new dream.',

  'I don’t know where I’m going from here, but I promise it won’t be boring.',
  'New year is the glittering light to brighten the dream-lined pathway of future.',
  'नया रंग हो नई उमंगे,आंखो में उल्लास नया \nनए गगन को छू लेने का मन में हो विश्वास नया\nनए वर्ष में चलो पुराने मौसम का हम बदलें रंग\nनई बहारें लेकर आए जीवन में मधुमास नया\nनए साल 2026 की हार्दिक शुभकामनाएं!',
  'May your dreams take flight and your goals turn into achievements ✨',
  'New year, new hopes, new beginnings 🌟',
  'Let this year be the chapter where everything changes for the better 💫',
  'Success, happiness, and good health — may they follow you all year 🎉',
  'A fresh start, a bright future, and endless possibilities 🚀',
  'May this year surprise you with joy and success 🎆',
  'Turn every challenge into an opportunity this year 💖',
]

/* ================= GET NAME FROM URL ================= */
function getNameFromURL() {
  const params = new URLSearchParams(window.location.search)
  return params.get('name')
}

/* ================= GENERATE WISH ================= */
function generateWish(nameFromUrl = null) {
  const input = document.getElementById('name')
  const name = nameFromUrl || input.value || 'Friend'

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]

  const wishText = `🎉Wishing you and your Family\n Happy New Year\n From ${name}! 🎆`

  document.getElementById('wish').innerText = wishText
}

/* ================= AUTO LOAD FROM URL ================= */
window.addEventListener('load', () => {
  const urlName = getNameFromURL()

  if (urlName) {
    const formattedName = urlName.charAt(0).toUpperCase() + urlName.slice(1)

    document.getElementById('name').value = formattedName
    generateWish(formattedName)
  }
})

/* ===== AUTOPLAY MUSIC ON FIRST USER INTERACTION ===== */

let musicStarted = false

function startMusic() {
  if (!musicStarted) {
    music.play().catch(() => {})
    musicStarted = true
  }
}

// Start music on ANY interaction
window.addEventListener('click', startMusic, { once: true })
window.addEventListener('touchstart', startMusic, { once: true })

function shareWish() {
  const nameInput = document.getElementById('name').value || 'Friend'

  // Get current page URL (without query params)
  const baseUrl = window.location.origin + window.location.pathname

  // Create shareable URL with name
  const shareUrl = `${baseUrl}?name=${encodeURIComponent(nameInput)}`

  const message = `🎉 Happy New Year From ${nameInput}! 🎆✨\n\nOpen your wish:\n${shareUrl}`

  // WhatsApp share
  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
}

function copyShareLink() {
  const nameInput = document.getElementById('name').value || 'Friend'
  const baseUrl = window.location.origin + window.location.pathname
  const shareUrl = `${baseUrl}?name=${encodeURIComponent(nameInput)}`

  navigator.clipboard.writeText(shareUrl).then(() => {
    alert('Link copied! 🎉')
  })
}
