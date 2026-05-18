import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2, Eye, EyeOff, AlertTriangle, LockKeyhole } from "lucide-react";

import { loginSchema, LoginFormValues } from "../validations/auth.validation";
import { login } from "../services/auth.service";

import ReCAPTCHA from "react-google-recaptcha";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [capsLockOn, setCapsLockOn] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const verificarMayusculas = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLockOn(e.getModifierState("CapsLock"));
  };

  const onSubmit = async (data: LoginFormValues) => {
    if (!captchaToken) {
      toast.error("Por favor completa el reCAPTCHA");
      return;
    }

    try {
      setIsLoading(true);

      const loginData = {
        ...data,
        recaptchaToken: captchaToken,
      };

      const respuesta = await login(loginData);
      console.log("RESPUESTA LOGIN >>>", respuesta);

      if (!respuesta?.access_token) {
        throw new Error("No llegó access_token del backend");
      }

      const token = respuesta.access_token;
      localStorage.setItem("token", token);

      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );

      const tokenData = JSON.parse(jsonPayload);

      localStorage.removeItem("idalumno");
      localStorage.setItem("usuario", JSON.stringify(tokenData));

      if (tokenData.idalumno) {
        localStorage.setItem("idalumno", tokenData.idalumno.toString());
      }

      const userRole = tokenData.rol || respuesta.usuario?.rol;

      toast.success("Inicio de sesión exitoso");

      if (userRole === "ADMINISTRADOR") {
        navigate("/admin");
      } else if (userRole === "DOCENTE") {
        navigate("/docente");
      } else if (userRole === "ALUMNO") {
        navigate("/alumno");
      } else {
        console.warn("Rol no reconocido", userRole);
        navigate("/web");
      }
    } catch (error: any) {
      toast.error(error.message || "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (hasError?: boolean) =>
    `w-full rounded-2xl border px-5 py-4 text-sm outline-none transition placeholder:text-[var(--color-muted-text)] ${
      hasError
        ? "border-red-400 bg-red-50 text-red-900 focus:border-red-500 focus:ring-4 focus:ring-red-100"
        : "border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_16%,transparent)]"
    }`;

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 text-[var(--color-text)]"
      style={{
        background:
          "linear-gradient(135deg, var(--color-background), color-mix(in srgb, var(--color-primary) 10%, var(--color-background)))",
      }}
    >
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_16%,transparent)] blur-3xl" />

      <div className="pointer-events-none absolute -bottom-28 -left-24 h-80 w-80 rounded-full bg-[color-mix(in_srgb,var(--color-secondary)_10%,transparent)] blur-3xl" />

      <section className="relative z-10 w-full max-w-md">
        <div className="overflow-hidden rounded-[28px] border border-[var(--color-border)] bg-[var(--color-card)] shadow-xl">
          <div className="px-8 pt-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)]">
              <LockKeyhole size={26} />
            </div>

            <h1 className="text-3xl font-black uppercase tracking-tight text-[var(--color-text)]">
              Accede a tu aula virtual
            </h1>

            <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-[var(--color-muted-text)]">
              Ingresa tus credenciales para continuar a tu panel.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-8 py-8">
            <div>
              <input
                id="correo"
                type="email"
                placeholder="Correo"
                className={inputClass(!!errors.correo)}
                {...register("correo")}
              />

              {errors.correo && (
                <p className="mt-2 text-sm font-semibold text-red-600">
                  {errors.correo.message}
                </p>
              )}
            </div>

            <div>
              <div className="relative">
                <input
                  id="contrasenia"
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  className={`${inputClass(!!errors.contrasenia)} pr-12`}
                  {...register("contrasenia")}
                  onKeyUp={verificarMayusculas}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-muted-text)] transition hover:text-[var(--color-primary)]"
                  tabIndex={-1}
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {capsLockOn && (
                <p className="mt-2 flex items-center gap-1 text-sm font-semibold text-amber-600">
                  <AlertTriangle size={16} />
                  Mayúsculas activadas
                </p>
              )}

              {errors.contrasenia && (
                <p className="mt-2 text-sm font-semibold text-red-600">
                  {errors.contrasenia.message}
                </p>
              )}
            </div>

            <div className="flex justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-3">
              <ReCAPTCHA
                sitekey="6LeBVX0sAAAAABptVURftyu-3F1crVMQnOr2uDoC"
                onChange={(token: string | null) => setCaptchaToken(token)}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-2xl bg-[var(--color-button-primary)] px-5 py-4 text-base font-black text-[var(--color-button-primary-text)] shadow-lg transition hover:-translate-y-0.5 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-3 animate-spin" size={22} />
                  Iniciando...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </button>

            <div className="text-center">
              <Link
                to="/forgot-password"
                className="text-sm font-semibold italic text-[var(--color-primary)] transition hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}