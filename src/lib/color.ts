// Elige texto blanco o negro según la luminancia del color de fondo, para
// mantener contraste legible sobre bg_color/button_color arbitrarios.
export function getContrastColor(hex: string): '#000000' | '#ffffff' {
  const clean = hex.replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) {
    return '#ffffff'
  }

  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  return luminance > 0.6 ? '#000000' : '#ffffff'
}
