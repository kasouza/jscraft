const WORLD_SIZE_X = 16 * 128
const WORLD_SIZE_Y = 16 * 32

function createBlock(blockType) {
  return {
    type: blockType,
  }
}

function main() {
  const container = document.querySelector('#game-container')
  initRenderer(container)

  const world = generateWorld()
  const player = {
    x: 0,
    y: TILE_SIZE * 128,
    xAcel: 0,
    yAcel: 0,
    xVel: 0,
    yVel: 0,
  }
  setCameraPos(player.x - canvas.width / 2, player.y - canvas.height / 2)

  setMouseClickCallback('left', (x, y) => placeBlock(world, 'air', x, y))
  setMouseClickCallback('right', (x, y) => placeBlock(world, 'dirt', x, y))

  const loop = time => {
    setCameraPos(player.x - canvas.width / 2, player.y - canvas.height / 2)
    update(player, world)
    render(player, world)
    requestAnimationFrame(loop)
  }

  requestAnimationFrame(loop)
}

const previous = []
function genNoise(x) {
  previous[x] = Math.random()

  const a = previous[x - 1] || x
  const b = previous[x + 1] || x
  const samples = 30

  let sum = 0
  for (let i = -(samples / 2); i <= (samples / 2); i++) {
    sum += previous[x + i] || 1
  }

  return sum / samples
}

function generateWorld() {
  const world = []
  for (let i = 0; i < WORLD_SIZE_X; i++) {
    world[i] = []

    const noise = genNoise(i)
    const height = Math.round(((noise + 1) / 2) * (WORLD_SIZE_Y / 4))

    for (let j = 0; j < WORLD_SIZE_Y; j++) {

      let type = 'air'
      if (j == height) {
        type = 'grass'

      } else if (j < height) {
        const distanceToSurface = height - j
        type = distanceToSurface < 10 ? 'dirt' : 'stone'
      }

      world[i][j] = createBlock(type)
    }
  }

  for (let i = 0; i < WORLD_SIZE_X; i++) {
    if (Math.random() < 0.1) {

      for (let j = WORLD_SIZE_Y; j > 0; j--) {
        const block = world[i][j]
        if (block?.type === 'grass') {
          world[i][j + 1].type = 'flower'
        }
      }
    }
  }

  return world
}

function placeBlock(world, blockType, screenX, screenY) {
  // Transform from "screen" space into world space
  const blockX = Math.trunc((screenX + cameraX) / TILE_SIZE)
  const blockY = Math.trunc((screenY + cameraY) / TILE_SIZE)

  const block = world[blockX]?.[blockY]
  if (block) {
    block.type = blockType
  }
}
function update(player, world) {
  const previousX = player.x
  const previousY = player.y

  // Gravity
  player.yAcel -= 1

  if (checkIfIsColliding(world, player)) {
    player.y = previousY
    player.isJumping = false
  }

  // Movement
  if (isKeyPressed('d')) {
    player.x += 10
  } else if (isKeyPressed('a')) {
    player.x -= 10
  }

  if (checkIfIsColliding(world, player)) {
    player.x = previousX
  }

  if (isKeyPressed('w') && !player.isJumping) {
    player.yAcel = 16
    player.isJumping = true
  }

  player.xVel = clamp(player.xAcel + player.xVel, -8, 16)
  player.yVel = clamp(player.yAcel + player.yVel, -8, 16)

  player.x += player.xVel
  if (checkIfIsColliding(world, player)) {
    player.x = previousX
  }

  player.y += player.yVel
  if (checkIfIsColliding(world, player)) {
    player.y = previousY
    player.yVel = 0
    player.isJumping = false
  }

  player.xAcel = 0
  player.yAcel = 0
}

function checkIfIsColliding(world, player) {
  const playerBlockPosX = Math.trunc(player.x / TILE_SIZE)
  const playerBlockPosY = Math.trunc(player.y / TILE_SIZE)
  const block = world[playerBlockPosX]?.[playerBlockPosY]
  return block && block.type !== 'air' && checkCollision(player, playerBlockPosX, playerBlockPosY)
}

function checkCollision(player, blockX, blockY) {
  const x1 = blockX * TILE_SIZE
  const y1 = blockY * TILE_SIZE
  const x2 = x1 + TILE_SIZE
  const y2 = y1 + TILE_SIZE

  const x3 = player.x
  const y3 = player.y
  const x4 = x3 + TILE_SIZE
  const y4 = y3 + TILE_SIZE

  return AABB(x1, y1, x2, y2, x3, y3, x4, y4)
}

function AABB(x1, y1, x2, y2, x3, y3, x4, y4) {
  return ((x1 >= x3 && x1 <= x4) || (x2 >= x3 && x2 <= x4)) &&// Horizontal collsiion
    ((y1 >= y3 && y1 <= y4) || (y2 >= y3 && y2 <= y4)) // Vertical collistion

}

function render(player, world) {
  clear('SkyBlue')

  const startX = Math.trunc(cameraX / TILE_SIZE)
  const endX = Math.trunc((cameraX + canvas.width) / TILE_SIZE)

  const startY = Math.trunc(cameraY / TILE_SIZE)
  const endY = Math.trunc((cameraY + canvas.height) / TILE_SIZE)

  for (let i = startX; i <= endX; i++) {
    for (let j = startY; j <= endY; j++) {
      const block = world[i]?.[j]
      if (block) {
        let color = ''

        switch (block.type) {
          case 'dirt':
            color = '#420805'
            break

          case 'grass':
            color = 'green'
            break

          case 'stone':
            color = 'gray'
            break

          case 'flower':
            color = 'red'
            break

          default:
            color = 'transparent'
        }

        drawTile(i, j, color)
      }
    }
  }

  ctx.fillStyle = 'blue'
  ctx.fillRect(player.x - cameraX, canvas.height - (player.y - cameraY) - TILE_SIZE, 32, 32)
}

window.onload = main
