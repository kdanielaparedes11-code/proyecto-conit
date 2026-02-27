import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft } from 'lucide-react';

import { forgotPasswordSchema, ForgotPasswordFormValues } from '../validations/auth.validation';
import { forgotPassword } from '../services/auth.service';

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      setIsLoading(true);
      
      //Aquí es donde conectamos con el backend para solicitar el restablecimiento de contraseña, enviando el correo del usuario
      await forgotPassword(data);
      
      toast.success(`Se ha enviado un enlace a ${data.correo}`, {
        style: {
          background: '#1b2751',
          color: '#82a1d0',
          border: '1px solid #344c92',
        },
      });

      //Regresamos al login después de unos segundos
      setTimeout(() => navigate('/login'), 2500);
    } catch (error: any) {
      toast.error(error.message ||'Hubo un error al intentar enviar el correo', {
        style: {
          background: '#894329',
          color: '#ffffff',
          border: '1px solid #61141b',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-300 to-slate-400 p-4">
      
      <div className="w-full max-w-md p-10 bg-white/20 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl relative overflow-hidden">
        
        {/* Botón de regreso al Login */}
        <Link 
          to="/login" 
          className="absolute top-6 left-6 text-[#1b2751] hover:text-[#5573b3] transition-colors flex items-center gap-2 text-sm font-bold"
        >
          <ArrowLeft size={20} />
          Volver
        </Link>

        {/* Título y descripción */}
        <div className="mt-8 mb-10 text-center">
          <h2 className="text-3xl font-extrabold text-[#141426] tracking-tight uppercase drop-shadow-sm">
            Recuperar acceso
          </h2>
          <p className="mt-4 text-[#1b2751] font-medium drop-shadow-sm">
            Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
          
          <div className="relative">
            <input
              id="correo"
              type="email"
              placeholder="Tu correo electrónico"
              className={`w-full py-4 px-6 bg-[#1b2751] text-white placeholder-gray-400 rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#5573b3] transition-all duration-300 ${
                errors.correo ? 'ring-2 ring-[#894329]' : ''
              }`}
              {...register('correo')}
            />
            {errors.correo && (
              <p className="text-[#894329] text-sm mt-2 ml-4 font-bold drop-shadow-sm">{errors.correo.message}</p>
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
                Enviando...
              </>
            ) : (
              'Enviar enlace de recuperación'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}