import * as Sentry from "@sentry/react";
import { AppRouter } from "@presentation/app/router/AppRouter";
import { AuthProvider } from "@/presentation/app/providers/AuthProvider";
import { InstallPrompt } from "@presentation/shared/components/InstallPrompt";

function ErrorFallback() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8 text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Algo salió mal</h1>
        <p className="text-gray-600 mb-6 text-sm">
          Ocurrió un error inesperado. Probá recargar la página; si el problema persiste, avisale al profe.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-lg hover:bg-orange-600 transition-all duration-300"
        >
          Recargar
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      <AuthProvider>
        <AppRouter />
        <InstallPrompt />
      </AuthProvider>
    </Sentry.ErrorBoundary>
  );
}

export default App;
