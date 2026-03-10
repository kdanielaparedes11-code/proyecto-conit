import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2, Eye, EyeOff, AlertTriangle } from "lucide-react";

import {
  resetPasswordSchema,
  ResetPasswordFormValues,
} from "../validations/auth.validation";
import { resetPassword } from "../services/auth.service";

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [campoActivo, setCampoActivo] = useState<
    "contrasenia" | "confirmarContrasenia" | null
  >(null);

  const navigate = useNavigate();
  //Extraemos el "token" de la URL para validar que el enlace es correcto y para enviarlo al backend junto con la nueva contraseña
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const verificarMayusculas = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState("CapsLock")) {
      setCapsLockOn(true);
    } else {
      setCapsLockOn(false);
    }
  };

  const onSubmit = async (data: ResetPasswordFormValues) => {
    //Si alguien entra a la página sin un token en la URL, lo bloqueamos
    if (!token) {
      toast.error("Enlace inválido o expirado.", {
        style: {
          background: "#894329",
          color: "#ffffff",
          border: "1px solid #61141b",
        },
      });
      return;
    }

    try {
      setIsLoading(true);
      //Aquí enviaremos la nueva contraseña junto con el token al backend para que valide y actualice la contraseña del usuario
      await resetPassword({
        token: token,
        contrasenia: data.contrasenia,
        codigoSeguridad: data.codigoSeguridad,
      });

      toast.success("¡Tu contraseña ha sido actualizada!", {
        style: {
          background: "#1b2751",
          color: "#82a1d0",
          border: "1px solid #344c92",
        },
      });

      //Una vez cambiada la contraseña, lo mandamos a iniciar sesión
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar la contraseña", {
        style: {
          background: "#894329",
          color: "#ffffff",
          border: "1px solid #61141b",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-300 to-slate-400 p-4">
      <div className="w-full max-w-md p-10 bg-white/20 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl relative overflow-hidden">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold text-[#141426] tracking-tight uppercase drop-shadow-sm">
            Nueva Contraseña
          </h2>
          <p className="mt-4 text-[#1b2751] font-medium drop-shadow-sm">
            Ingresa el código que enviamos a tu correo y tu nueva contraseña.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
          {/* CÓDIGO DE SEGURIDAD */}
          <div>
            <div className="relative">
              <input
                id="codigoSeguridad"
                type="text"
                maxLength={6}
                placeholder="Código de 6 dígitos"
                className={`w-full py-4 pl-6 pr-12 bg-[#1b2751] text-white placeholder-gray-400 rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#5573b3] transition-all duration-300 ${
                  errors.codigoSeguridad ? "ring-2 ring-[#894329]" : ""
                }`}
                {...register("codigoSeguridad")}
              />
            </div>
            {errors.codigoSeguridad && (
              <p className="text-[#894329] text-sm mt-2 font-bold drop-shadow-sm text-center">
                {errors.codigoSeguridad.message}
              </p>
            )}
          </div>

          {/* NUEVA CONTRASEÑA */}
          <div>
            <div className="relative">
              <input
                id="contrasenia"
                type={showPassword ? "text" : "password"}
                placeholder="Nueva contraseña"
                className={`w-full py-4 pl-6 pr-12 bg-[#1b2751] text-white placeholder-gray-400 rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#5573b3] transition-all duration-300 ${
                  errors.contrasenia ? "ring-2 ring-[#894329]" : ""
                }`}
                {...register("contrasenia")}
                onKeyUp={verificarMayusculas}
                onFocus={() => setCampoActivo("contrasenia")}
                onBlur={() => setCampoActivo(null)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {/* Mensaje de mayúsculas */}
            {capsLockOn && campoActivo === "contrasenia" && (
              <p className="text-amber-600 text-sm mt-2 ml-4 font-semibold flex items-center gap-1 drop-shadow-sm">
                <AlertTriangle size={16} /> Mayúsculas activadas
              </p>
            )}
            {/* Mensaje de error Zod */}
            {errors.contrasenia && (
              <p className="text-[#894329] text-sm mt-2 ml-4 font-bold drop-shadow-sm">
                {errors.contrasenia.message}
              </p>
            )}
          </div>

          {/* CONFIRMAR CONTRASEÑA */}
          <div>
            <div className="relative">
              <input
                id="confirmarContrasenia"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirma tu contraseña"
                className={`w-full py-4 pl-6 pr-12 bg-[#1b2751] text-white placeholder-gray-400 rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#5573b3] transition-all duration-300 ${
                  errors.confirmarContrasenia ? "ring-2 ring-[#894329]" : ""
                }`}
                {...register("confirmarContrasenia")}
                onKeyUp={verificarMayusculas}
                onFocus={() => setCampoActivo("confirmarContrasenia")}
                onBlur={() => setCampoActivo(null)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {/* Mensaje de mayúsculas */}
            {capsLockOn && campoActivo === "confirmarContrasenia" && (
              <p className="text-amber-600 text-sm mt-2 ml-4 font-semibold flex items-center gap-1 drop-shadow-sm">
                <AlertTriangle size={16} /> Mayúsculas activadas
              </p>
            )}
            {/* Mensaje de error Zod */}
            {errors.confirmarContrasenia && (
              <p className="text-[#894329] text-sm mt-2 ml-4 font-bold drop-shadow-sm">
                {errors.confirmarContrasenia.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 bg-[#5573b3] hover:bg-[#344c92] text-white text-lg font-bold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-3" size={24} />
                Guardando...
              </>
            ) : (
              "Actualizar contraseña"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
