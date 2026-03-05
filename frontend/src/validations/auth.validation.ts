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

export const forgotPasswordSchema = z.object({
  correo: z
    .string()
    .min(1, { message: "El correo electrónico es obligatorio" })
    .email({ message: "Por favor ingrese un correo electrónico válido" }),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
<<<<<<< HEAD
  codigoSeguridad: z
    .string()
    .min(1, { message: "El código de seguridad es obligatorio" })
    .length(6, { message: "El código de seguridad debe tener exactamente 6 caracteres" }),
=======
>>>>>>> 05542c37d34b8b0e415c3ea79bf733b199403bb5
  contrasenia: z
    .string()
    .min(1, { message: "La contraseña es obligatoria" })
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
    .max(15, { message: "La contraseña no puede tener más de 15 caracteres" })
    .regex(/[A-Z]/, { message: "La contraseña debe contener al menos una letra mayúscula" })
    .regex(/[0-9]/, { message: "La contraseña debe contener al menos un número" })
    .regex(/[^a-zA-Z0-9]/, { message: "La contraseña debe contener al menos un carácter especial" }),
  confirmarContrasenia: z
  .string().min(1, { message: "Por favor confirma la contraseña" }),
}).refine((data) => data.contrasenia === data.confirmarContrasenia, {
  message: "Las contraseñas no coinciden",
  path: ["confirmarContrasenia"],//Esto hace que el error se muestre debajo del campo de confirmación de cexcitanteontraseña
});

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
