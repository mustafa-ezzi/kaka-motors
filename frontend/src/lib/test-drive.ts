import { z } from 'zod'

export const SLOT_LABELS = {
  morning: 'Morning · 10:00–13:00',
  afternoon: 'Afternoon · 13:00–17:00',
  evening: 'Evening · 17:00–20:00',
} as const

export const testDriveSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.'),
  email: z.string().trim().email('A valid email is required.'),
  phone: z
    .string()
    .trim()
    .refine((value) => value.replace(/\D/g, '').length >= 10, 'A reachable mobile number is required.'),
  date: z.string().min(1, 'Preferred date is required.'),
  slot: z.enum(['morning', 'afternoon', 'evening']),
  city: z.string().trim().min(1, 'City is required.'),
  vehicleSlug: z.string().min(1, 'Choose a vehicle.'),
  message: z.string().max(600).optional(),
  consent: z.boolean().refine((value) => value === true, { message: 'Consent is required.' }),
  hpField: z.string().optional(),
})

export type TestDriveInput = z.infer<typeof testDriveSchema>

export function whatsappHref(phone: string) {
  const digits = phone.replace(/\D/g, '')
  const intl = digits.startsWith('92') ? digits : digits.startsWith('0') ? `92${digits.slice(1)}` : digits
  return `https://wa.me/${intl}`
}
