import { z } from 'zod';

/** Luhn checksum, so obviously mistyped card numbers are rejected client- and server-side. */
export function luhn(num: string) {
  const digits = num.replace(/\D/g, '');
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return digits.length >= 12 && sum % 10 === 0;
}

export function cardBrand(num: string) {
  const n = num.replace(/\D/g, '');
  if (/^4/.test(n)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'Mastercard';
  if (/^3[47]/.test(n)) return 'Amex';
  return 'Card';
}

export const addressSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name').max(80),
  email: z.string().trim().email('Enter a valid email'),
  street: z.string().trim().min(3, 'Enter your street address').max(120),
  city: z.string().trim().min(2, 'Enter your city').max(60),
  postalCode: z.string().trim().regex(/^[A-Za-z0-9 -]{3,10}$/, 'Enter a valid postal code'),
  country: z.string().trim().min(2, 'Choose a country'),
});

export const paymentSchema = z.object({
  cardNumber: z.string().refine(luhn, 'Card number is invalid'),
  expiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Use MM/YY')
    .refine((v) => {
      const [m, y] = v.split('/').map(Number);
      return new Date(2000 + y, m) > new Date();
    }, 'Card has expired'),
  cvc: z.string().regex(/^\d{3,4}$/, '3 or 4 digits'),
});

export const orderRequestSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().optional(),
        size: z.string().optional(),
        quantity: z.number().int().min(1).max(10),
        deliveryOptionId: z.enum(['standard', 'express', 'next-day']),
      })
    )
    .min(1, 'Your cart is empty')
    .max(50),
  address: addressSchema,
  payment: paymentSchema,
});

export type OrderRequest = z.infer<typeof orderRequestSchema>;
