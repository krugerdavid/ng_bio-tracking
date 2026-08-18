import { useState } from "react";
import { useInstallPrompt } from "@presentation/shared/hooks/useInstallPrompt";

const DISMISSED_KEY = "bio-tracker-install-prompt-dismissed";

/**
 * Banner chico para instalar la app (Android/Chrome). Solo aparece cuando el
 * navegador dispara beforeinstallprompt; en iOS o si ya está instalada no
 * renderiza nada.
 */
export function InstallPrompt() {
  const { canInstall, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISSED_KEY) === "1");

  if (!canInstall || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 bg-white rounded-xl shadow-xl border border-gray-200 p-4 flex items-center gap-3">
      <img src="/icon-192.png" alt="" className="w-10 h-10 rounded-lg shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">Instalá NG Training</p>
        <p className="text-xs text-gray-500">Acceso rápido desde tu celular</p>
      </div>
      <button
        onClick={promptInstall}
        className="shrink-0 px-3 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors"
      >
        Instalar
      </button>
      <button onClick={handleDismiss} aria-label="Descartar" className="shrink-0 p-1 text-gray-400 hover:text-gray-600">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
