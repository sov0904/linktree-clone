'use client'

import { useActionState, useState, type ChangeEvent } from 'react'
import { updateProfile } from '@/app/actions/profile'
import { AvatarFlip } from '@/components/avatar-flip'
import { ColorField } from '@/components/color-field'
import { Toast } from '@/components/toast'
import { getContrastColor } from '@/lib/color'

type ProfileFormProps = {
  profile: {
    username: string
    display_name: string | null
    bio: string | null
    avatar_url: string | null
    bg_color: string
    button_color: string
  }
}

const MAX_BIO_LENGTH = 160

export function ProfileForm({ profile }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(updateProfile, undefined)

  const [displayName, setDisplayName] = useState(profile.display_name ?? profile.username)
  const [bio, setBio] = useState(profile.bio ?? '')
  const [bgColor, setBgColor] = useState(profile.bg_color)
  const [buttonColor, setButtonColor] = useState(profile.button_color)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url)

  // Patrón "ajustar estado durante el render" (no en un efecto): cada vez
  // que useActionState entrega un `state` nuevo con resultado general
  // (éxito/error), se arma un nuevo toast y se resetea su dismiss.
  const [prevState, setPrevState] = useState(state)
  const [toastKey, setToastKey] = useState(0)
  const [toastDismissed, setToastDismissed] = useState(false)

  if (state !== prevState) {
    setPrevState(state)
    if (state?.success || state?.error) {
      setToastKey((k) => k + 1)
      setToastDismissed(false)
    }
  }

  const showToast = Boolean(state?.success || state?.error) && !toastDismissed
  const toastVariant: 'success' | 'error' = state?.success ? 'success' : 'error'
  const toastMessage = state?.success ? 'Perfil actualizado.' : (state?.error ?? '')

  function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const previewTextColor = getContrastColor(bgColor)

  return (
    <div className="space-y-6">
      {/* Vista previa en vivo, simula cómo se verá la página pública */}
      <div
        className="flex flex-col items-center gap-3 rounded-xl border border-slate-800 p-6 md:p-8"
        style={{ backgroundColor: bgColor }}
      >
        <AvatarFlip
          avatarUrl={avatarPreview}
          username={profile.username}
          buttonColor={buttonColor}
          sizeClassName="h-24 w-24 md:h-32 md:w-32"
          textClassName="text-2xl md:text-3xl"
        />
        <p className="text-center font-semibold" style={{ color: previewTextColor }}>
          {displayName || profile.username}
        </p>
        <p className="text-xs" style={{ color: previewTextColor, opacity: 0.7 }}>
          Toca o pasa el mouse sobre el avatar para ver el flip
        </p>
      </div>

      <form
        action={formAction}
        className="space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-6"
      >
        <div>
          <label htmlFor="avatar" className="block text-sm text-slate-300">
            Foto de perfil
          </label>
          <input
            id="avatar"
            name="avatar"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleAvatarChange}
            className="mt-1 w-full text-sm text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-900"
          />
          <p className="mt-1 text-xs text-slate-500">PNG, JPG o WEBP. Máximo 2MB.</p>
          {state?.fieldErrors?.avatar && (
            <p className="mt-1 text-xs text-red-400">{state.fieldErrors.avatar}</p>
          )}
        </div>

        <div>
          <label htmlFor="display_name" className="block text-sm text-slate-300">
            Nombre visible
          </label>
          <input
            id="display_name"
            name="display_name"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white"
          />
          {state?.fieldErrors?.display_name && (
            <p className="mt-1 text-xs text-red-400">{state.fieldErrors.display_name}</p>
          )}
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm text-slate-300">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            maxLength={MAX_BIO_LENGTH}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="mt-1 w-full resize-none rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white"
          />
          {state?.fieldErrors?.bio && (
            <p className="mt-1 text-xs text-red-400">{state.fieldErrors.bio}</p>
          )}
          <p className="mt-1 text-right text-xs text-slate-500">
            {bio.length}/{MAX_BIO_LENGTH}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ColorField
            name="bg_color"
            label="Color de fondo"
            defaultValue={profile.bg_color}
            onChange={setBgColor}
            error={state?.fieldErrors?.bg_color}
          />
          <ColorField
            name="button_color"
            label="Color de botones"
            defaultValue={profile.button_color}
            onChange={setButtonColor}
            error={state?.fieldErrors?.button_color}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-white py-2 font-medium text-slate-900 disabled:opacity-50"
        >
          {pending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>

      {showToast && (
        <Toast
          key={toastKey}
          message={toastMessage}
          variant={toastVariant}
          onDismiss={() => setToastDismissed(true)}
        />
      )}
    </div>
  )
}
