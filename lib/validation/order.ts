import { z } from "zod";

export const orderSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(1, "customer.name is required"),
    email: z.string().trim().email("customer.email must be a valid email address"),
  }),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive("items[].productId must be a positive integer"),
        quantity: z.number().int().positive("items[].quantity must be a positive integer"),
      })
    )
    .min(1, "items must contain at least one product"),
  // v1 only: no auth means the merchant has to be named explicitly in the body.
  merchantId: z.string().trim().min(1).optional(),
});

export type OrderInput = z.infer<typeof orderSchema>;

export function formatZodError(error: z.ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.join(".") || "(root)",
    message: issue.message,
  }));
}
