// Reglas de validación de avatar compartidas entre el cliente (feedback
// inmediato al elegir el archivo) y el server action (fuente de verdad).
export const MAX_AVATAR_BYTES = 2 * 1024 * 1024

export const ALLOWED_AVATAR_TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}

export function validateAvatarFile(file: File): string | null {
  if (file.size > MAX_AVATAR_BYTES) {
    return 'La imagen no puede superar 2MB.'
  }
  if (!ALLOWED_AVATAR_TYPES[file.type]) {
    return 'Formato no soportado (usa PNG, JPG o WEBP).'
  }
  return null
}
