import { z } from 'zod'

// Única fuente de verdad para las reglas de un link, compartida entre el
// formulario cliente (react-hook-form + zodResolver, feedback instantáneo)
// y las Server Actions (safeParse, fuente de verdad).
export const linkSchema = z.object({
  title: z.string().trim().min(1, 'El título no puede estar vacío.'),
  url: z
    .string()
    .trim()
    .min(1, 'La URL no puede estar vacía.')
    .regex(/^https?:\/\//, 'La URL debe empezar con http:// o https://.'),
})

export type LinkFormValues = z.infer<typeof linkSchema>

export type LinkFieldErrors = Partial<Record<keyof LinkFormValues, string>>
