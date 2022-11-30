const TILE_SIZE = 32

const pressedKeys = {}
const pressedMouseButtons = {}

let canvas = null
let ctx = null

let cameraX = 0
let cameraY = 0

function initRenderer(container) {
  [canvas, ctx] = createContext(container)
  canvas.width = 800
  canvas.height = 600

  canvas.addEventListener('keydown', e => {
    pressedKeys[e.key] = true
  })

  canvas.addEventListener('keyup', e => {
    pressedKeys[e.key] = false
  })
}

function setMouseClickCallback(button, cb) {
  const handler = e => {
    e.preventDefault()
    const bounds = e.target.getBoundingClientRect()
    const x = e.x - bounds.left
    const y = canvas.height - (e.layerY - bounds.top)

    cb(x, y)
  }

  let event = null

  switch (button) {
    case 'left':
      event = 'click'
      break

    case 'right':
      event = 'contextmenu'
      break

    default:
      console.error('Invalid event')
  }

  canvas.addEventListener(event, handler)
}

function drawTile(x, y, color) {
  const finalX = (x * TILE_SIZE) - cameraX
  const finalY = (canvas.height - (TILE_SIZE * (y + 1) - cameraY))

  ctx.fillStyle = color
  ctx.fillRect(
    finalX,
    finalY,
    TILE_SIZE,
    TILE_SIZE)
}

function clear(color) {
  ctx.fillStyle = color || '#000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function setCameraPos(x, y) {
  cameraX = x
  cameraY = y
}

function isKeyPressed(key) {
  return pressedKeys[key];
}
