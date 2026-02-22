import { z } from "zod";

export const loginSchema = z.object({
  correo: z
    .string()
    .min(1, { message: "El correo electrónico es obligatorio" })
    .email({ message: "Por favor ingrese un correo electrónico válido" }),

  contrasenia: z
    .string()
    .min(1, { message: "La contraseña es obligatoria" })
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
    .regex(/[A-Z]/, { message: "La contraseña debe contener al menos una letra mayúscula" })
    .regex(/[0-9]/, { message: "La contraseña debe contener al menos un número" })
    .regex(/[^a-zA-Z0-9]/, { message: "La contraseña debe contener al menos un carácter especial" })
});

export type LoginFormValues = z.infer<typeof loginSchema>;
