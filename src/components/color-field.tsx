'use client'

import { useId, useState } from 'react'

type ColorFieldProps = {
  name: string
  label: string
  defaultValue: string
  onChange?: (hex: string) => void
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/

export function ColorField({ name, label, defaultValue, onChange }: ColorFieldProps) {
  const id = useId()
  const [value, setValue] = useState(defaultValue)

  function update(next: string) {
    setValue(next)
    if (HEX_RE.test(next)) {
      onChange?.(next)
    }
  }

  return (
    <div>
      <label htmlFor={id} className="block text-sm text-slate-300">
        {label}
      </label>
      <div className="mt-1 flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={HEX_RE.test(value) ? value : defaultValue}
          onChange={(e) => update(e.target.value)}
          aria-label={`Selector de color para ${label}`}
          className="h-10 w-14 cursor-pointer rounded border border-slate-700 bg-slate-800 p-1"
        />
        <input
          type="text"
          name={name}
          value={value}
          onChange={(e) => update(e.target.value)}
          maxLength={7}
          pattern="^#[0-9a-fA-F]{6}$"
          placeholder="#000000"
          className="w-28 rounded-md border border-slate-700 bg-slate-800 px-2 py-2 text-sm text-white"
        />
      </div>
    </div>
  )
}
