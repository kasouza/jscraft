function createContext(container) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.tabIndex = 1

  container.appendChild(canvas)

  return [canvas, ctx]
}

function clamp(n, min, max) {
  return Math.max(Math.min(n, max), min)
}
