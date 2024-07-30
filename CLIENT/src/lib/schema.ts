import { z } from 'zod'

export const LoginValidation = z
  .object({
    email: z.string().email({
      message: 'Email format error'
    }),
    password: z.string().min(6).max(15, {
      message: 'Password must be at least 8 characters'
    })
  })
  .strict()

export type TypeLoginValidation = z.infer<typeof LoginValidation>
