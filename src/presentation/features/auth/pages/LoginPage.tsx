import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@presentation/shared/hooks/useAuth";
import { PasswordInput } from "@presentation/shared/components/PasswordInput";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.isError()) {
      setError(result.getError());
      setIsLoading(false);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8">
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <img src="/ngtraining.png" alt="NG Training Logo" className="h-16 sm:h-24 w-auto" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-1 text-gray-900">Bienvenido</h2>
          <p className="text-center text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">Inicia sesión para continuar</p>

          {error && (
            <div className="mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                required
                autoComplete="email"
                inputMode="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 sm:py-3.5 text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                placeholder="tu@email.com"
                disabled={isLoading}
              />
            </div>

            <PasswordInput
              id="password"
              label="Contraseña"
              value={formData.password}
              onChange={password => setFormData(prev => ({ ...prev, password }))}
              placeholder="••••••••"
              disabled={isLoading}
              required
              autoComplete="current-password"
              inputClassName="text-base py-3 sm:py-3.5"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3.5 sm:py-4 bg-orange-500 text-white text-base sm:text-lg font-semibold rounded-lg shadow-lg hover:bg-orange-600 active:bg-orange-700 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 touch-manipulation"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
