'use client'

import { useState } from 'react'
import { getContrastColor } from '@/lib/color'

type AvatarFlipProps = {
  avatarUrl?: string | null
  username: string
  buttonColor: string
  /** Clases Tailwind de alto/ancho (deben ser iguales para mantener el círculo). */
  sizeClassName?: string
  /** Clases Tailwind de tamaño de texto para las iniciales. */
  textClassName?: string
}

// RF-10: avatar circular con flip 3D tipo moneda (CSS puro, sin librerías).
// Cara frontal: foto de perfil (o iniciales si no hay avatar_url todavía).
// Cara trasera: iniciales del username sobre button_color.
// Desktop: se activa con hover. Móvil/touch: se activa con tap (estado persistente).
export function AvatarFlip({
  avatarUrl,
  username,
  buttonColor,
  sizeClassName = 'h-24 w-24',
  textClassName = 'text-2xl',
}: AvatarFlipProps) {
  const [tapped, setTapped] = useState(false)
  const initials = username.slice(0, 2).toUpperCase()
  const backTextColor = getContrastColor(buttonColor)

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Avatar de ${username}`}
      onClick={() => setTapped((v) => !v)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setTapped((v) => !v)
        }
      }}
      className={`group cursor-pointer select-none outline-none [perspective:1000px] ${sizeClassName}`}
    >
      <div
        className="relative h-full w-full rounded-full transition-transform duration-700 ease-out [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] group-focus-visible:[transform:rotateY(180deg)]"
        style={tapped ? { transform: 'rotateY(180deg)' } : undefined}
      >
        {/* Cara frontal */}
        <div className="absolute inset-0 overflow-hidden rounded-full bg-slate-700 [backface-visibility:hidden]">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- preview puede ser blob: URL antes de subir
            <img
              src={avatarUrl}
              alt={username}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className={`flex h-full w-full items-center justify-center font-semibold text-white/70 ${textClassName}`}
            >
              {initials}
            </div>
          )}
        </div>

        {/* Cara trasera */}
        <div
          className={`absolute inset-0 flex items-center justify-center rounded-full font-bold [backface-visibility:hidden] [transform:rotateY(180deg)] ${textClassName}`}
          style={{ backgroundColor: buttonColor, color: backTextColor }}
        >
          {initials}
        </div>
      </div>
    </div>
  )
}
