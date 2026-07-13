'use client'

import { useState, useTransition } from 'react'
import { addLink, deleteLink, moveLink, updateLink } from '@/app/actions/links'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { LinkButton } from '@/components/link-button'
import { LinkForm } from '@/components/link-form'
import { Toast } from '@/components/toast'
import type { LinkFormValues } from '@/lib/schemas/link'

type LinkRow = {
  id: string
  title: string
  url: string
  position: number
}

type LinksManagerProps = {
  links: LinkRow[]
  buttonColor: string
}

export function LinksManager({ links, buttonColor }: LinksManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingLink, setDeletingLink] = useState<LinkRow | null>(null)
  const [isPending, startTransition] = useTransition()

  const [toastKey, setToastKey] = useState(0)
  const [toastDismissed, setToastDismissed] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')

  function notify(message: string, variant: 'success' | 'error') {
    setToastMessage(message)
    setToastVariant(variant)
    setToastKey((k) => k + 1)
    setToastDismissed(false)
  }

  async function handleAdd(values: LinkFormValues) {
    const result = await addLink(values)
    if (result.fieldErrors) {
      return { fieldErrors: result.fieldErrors }
    }
    if (result.error) {
      notify(result.error, 'error')
      return {}
    }
    notify('Link agregado.', 'success')
    return {}
  }

  async function handleEdit(id: string, values: LinkFormValues) {
    const result = await updateLink(id, values)
    if (result.fieldErrors) {
      return { fieldErrors: result.fieldErrors }
    }
    if (result.error) {
      notify(result.error, 'error')
      return {}
    }
    notify('Link actualizado.', 'success')
    setEditingId(null)
    return {}
  }

  function confirmDelete() {
    if (!deletingLink) {
      return
    }
    const id = deletingLink.id
    setDeletingLink(null)
    startTransition(async () => {
      const result = await deleteLink(id)
      if (result.error) {
        notify(result.error, 'error')
        return
      }
      notify('Link eliminado.', 'success')
    })
  }

  function handleMove(id: string, direction: 'up' | 'down') {
    startTransition(async () => {
      const result = await moveLink(id, direction)
      if (result.error) {
        notify(result.error, 'error')
      }
    })
  }

  const showToast = Boolean(toastMessage) && !toastDismissed

  return (
    <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-lg font-semibold">Tus links</h2>

      <LinkForm
        idPrefix="add-link"
        submitLabel="Agregar"
        pendingLabel="Agregando..."
        onSubmit={handleAdd}
      />

      {links.length === 0 ? (
        <p className="text-sm text-slate-500">Todavía no agregaste ningún link.</p>
      ) : (
        <ul className="space-y-2">
          {links.map((link, index) => (
            <li key={link.id} className="rounded-md border border-slate-700 bg-slate-800 p-3">
              {editingId === link.id ? (
                <LinkForm
                  idPrefix={`edit-link-${link.id}`}
                  defaultValues={{ title: link.title, url: link.url }}
                  submitLabel="Guardar"
                  pendingLabel="Guardando..."
                  onSubmit={(values) => handleEdit(link.id, values)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <LinkButton title={link.title} url={link.url} color={buttonColor} />
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingId(link.id)}
                      disabled={isPending}
                      aria-label="Editar link"
                      className="rounded-md border border-slate-700 px-2 py-1 text-xs disabled:opacity-50"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(link.id, 'up')}
                      disabled={isPending || index === 0}
                      aria-label="Subir link"
                      className="rounded-md border border-slate-700 px-2 py-1 text-xs disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(link.id, 'down')}
                      disabled={isPending || index === links.length - 1}
                      aria-label="Bajar link"
                      className="rounded-md border border-slate-700 px-2 py-1 text-xs disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingLink(link)}
                      disabled={isPending}
                      aria-label="Eliminar link"
                      className="rounded-md border border-slate-700 px-2 py-1 text-xs disabled:opacity-50"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {showToast && (
        <Toast
          key={toastKey}
          message={toastMessage}
          variant={toastVariant}
          onDismiss={() => setToastDismissed(true)}
        />
      )}

      {deletingLink && (
        <ConfirmDialog
          title="Eliminar link"
          message={`¿Seguro que querés eliminar "${deletingLink.title}"? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          isDestructive
          onConfirm={confirmDelete}
          onCancel={() => setDeletingLink(null)}
        />
      )}
    </div>
  )
}
