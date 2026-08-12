import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { container } from "@core/container/bindings";
import { TYPES } from "@core/container/DIContainer";
import type { AcceptInviteUseCase } from "@application/auth/use-cases/AcceptInviteUseCase";
import { PasswordInput } from "@presentation/shared/components/PasswordInput";

export default function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const acceptInviteUseCase = container.get<AcceptInviteUseCase>(TYPES.AcceptInviteUseCase);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    const result = await acceptInviteUseCase.execute(token, password, passwordConfirmation);
    setIsLoading(false);

    if (result.isError()) {
      setError(result.getError());
      return;
    }

    setSuccess(result.getValue());
    setTimeout(() => navigate("/login"), 1500);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8 text-center">
          <img src="/ngtraining.png" alt="NG Training Logo" className="h-16 sm:h-24 w-auto mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Enlace inválido</h1>
          <p className="text-gray-600 mb-6 text-sm">
            Falta el token de invitación. Pedile a un administrador que te reenvíe el acceso.
          </p>
          <Link to="/login" className="text-orange-600 font-semibold hover:underline">
            Ir al login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8">
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <img src="/ngtraining.png" alt="NG Training Logo" className="h-16 sm:h-24 w-auto" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-1 text-gray-900">Activar acceso</h2>
          <p className="text-center text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
            Creá tu contraseña para ver tu bioimpedancia y estado de cuenta
          </p>

          {error && (
            <div className="mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <PasswordInput
              id="password"
              label="Nueva contraseña"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              disabled={isLoading || !!success}
              required
              minLength={8}
              autoComplete="new-password"
              inputClassName="text-base py-3 sm:py-3.5"
            />

            <PasswordInput
              id="password_confirmation"
              label="Confirmar contraseña"
              value={passwordConfirmation}
              onChange={setPasswordConfirmation}
              placeholder="••••••••"
              disabled={isLoading || !!success}
              required
              minLength={8}
              autoComplete="new-password"
              inputClassName="text-base py-3 sm:py-3.5"
            />

            <button
              type="submit"
              disabled={isLoading || !!success}
              className="w-full py-3 sm:py-3.5 bg-orange-500 text-white font-semibold rounded-lg shadow-lg hover:bg-orange-600 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:pointer-events-none disabled:transform-none"
            >
              {isLoading ? "Activando…" : "Activar acceso"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            ¿Ya tenés cuenta?{" "}
            <Link to="/login" className="text-orange-600 font-semibold hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
