import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { container } from "@core/container/bindings";
import { TYPES } from "@core/container/DIContainer";
import type { RegisterUseCase } from "@application/auth/use-cases/RegisterUseCase";
import { PasswordInput } from "@presentation/shared/components/PasswordInput";
import { TrainingGroupSelect } from "@presentation/shared/components/TrainingGroupSelect";

const inputClass =
  "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [trainingGroup, setTrainingGroup] = useState<string | undefined>(undefined);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const registerUseCase = container.get<RegisterUseCase>(TYPES.RegisterUseCase);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    const result = await registerUseCase.execute({
      name,
      email,
      trainingGroup,
      password,
      passwordConfirmation,
    });
    setIsLoading(false);

    if (result.isError()) {
      setError(result.getError());
      return;
    }

    setSuccess(result.getValue());
    setTimeout(() => navigate("/login"), 2500);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8">
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <img src="/ngtraining.png" alt="NG Training Logo" className="h-16 sm:h-24 w-auto" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-1 text-gray-900">Registrate</h2>
          <p className="text-center text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
            Creá tu cuenta para llevar tu registro con el profe
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
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre completo
              </label>
              <input
                type="text"
                id="name"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Tu nombre y apellido"
                disabled={isLoading || !!success}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                disabled={isLoading || !!success}
                autoComplete="email"
                className={inputClass}
              />
            </div>

            <TrainingGroupSelect
              id="training_group"
              value={trainingGroup}
              onChange={setTrainingGroup}
              disabled={isLoading || !!success}
            />

            <PasswordInput
              id="password"
              label="Contraseña"
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
              {isLoading ? "Enviando…" : "Registrarme"}
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
