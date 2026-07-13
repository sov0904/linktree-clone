import { getContrastColor } from '@/lib/color'

type LinkButtonProps = {
  title: string
  url: string
  color: string
}

// Componente único y reutilizable para renderizar CUALQUIER link. Nunca debe
// haber botones fijos por red social — el diseño sale 100% de las props.
export function LinkButton({ title, url, color }: LinkButtonProps) {
  const textColor = getContrastColor(color)

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full truncate rounded-md px-4 py-3 text-center font-medium transition-opacity hover:opacity-90"
      style={{ backgroundColor: color, color: textColor }}
    >
      {title}
    </a>
  )
}
