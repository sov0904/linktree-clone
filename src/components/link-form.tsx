'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { linkSchema, type LinkFieldErrors, type LinkFormValues } from '@/lib/schemas/link'

type LinkFormProps = {
  // Prefijo para los `id` de los inputs: agregar y editar pueden estar
  // montados al mismo tiempo (una fila en modo edición mientras el
  // formulario de "agregar" sigue arriba), así que los ids no pueden chocar.
  idPrefix: string
  defaultValues?: LinkFormValues
  submitLabel: string
  pendingLabel: string
  onSubmit: (values: LinkFormValues) => Promise<{ fieldErrors?: LinkFieldErrors } | void>
  onCancel?: () => void
}

export function LinkForm({
  idPrefix,
  defaultValues,
  submitLabel,
  pendingLabel,
  onSubmit,
  onCancel,
}: LinkFormProps) {
  const [isPending, startTransition] = useTransition()
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
    defaultValues: defaultValues ?? { title: '', url: '' },
  })

  // La Server Action llama revalidatePath, y en esta versión de Next.js eso
  // solo refresca el router del cliente si la invocación corre dentro de un
  // startTransition — invocarla desde un simple await (como haría el
  // isSubmitting nativo de react-hook-form) deja la promesa colgada.
  const submit = handleSubmit((values) => {
    startTransition(async () => {
      const result = await onSubmit(values)
      if (result?.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          if (message) {
            setError(field as keyof LinkFormValues, { message })
          }
        }
        return
      }
      if (!defaultValues) {
        // Es el formulario de "agregar": lo limpiamos tras un éxito. El de
        // "editar" no necesita esto porque la fila se desmonta al cerrar edición.
        reset({ title: '', url: '' })
      }
    })
  })

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label htmlFor={`${idPrefix}-title`} className="block text-sm text-slate-300">
          Título
        </label>
        <input
          id={`${idPrefix}-title`}
          {...register('title')}
          className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white"
        />
        {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor={`${idPrefix}-url`} className="block text-sm text-slate-300">
          URL
        </label>
        <input
          id={`${idPrefix}-url`}
          {...register('url')}
          placeholder="https://..."
          className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white"
        />
        {errors.url && <p className="mt-1 text-xs text-red-400">{errors.url.message}</p>}
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-md bg-white py-2 text-sm font-medium text-slate-900 disabled:opacity-50"
        >
          {isPending ? pendingLabel : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-700 px-4 py-2 text-sm"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
