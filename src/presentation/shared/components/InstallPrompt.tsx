import { useState } from "react";
import { useInstallPrompt } from "@presentation/shared/hooks/useInstallPrompt";

const DISMISSED_KEY = "bio-tracker-install-prompt-dismissed";
const DISMISS_DAYS = 14;

function wasRecentlyDismissed(): boolean {
  const raw = localStorage.getItem(DISMISSED_KEY);
  if (!raw || raw === "1") return false;
  const dismissedAt = Date.parse(raw);
  if (Number.isNaN(dismissedAt)) return false;
  return Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000;
}

/**
 * Banner para instalar la PWA. En Chrome/Android usa beforeinstallprompt.
 * En iOS muestra cómo agregarla a la pantalla de inicio (Safari/Chrome no tienen prompt nativo).
 */
export function InstallPrompt() {
  const { canInstall, showIosHint, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(() => wasRecentlyDismissed());

  if (dismissed || (!canInstall && !showIosHint)) {
    return null;
  }

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, new Date().toISOString());
    setDismissed(true);
  };

  const isIos = showIosHint && !canInstall;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 bg-white rounded-xl shadow-xl border border-gray-200 p-4 flex items-start gap-3">
      <img src="/icon-192.png" alt="" className="w-10 h-10 rounded-lg shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">Instalá NG Training</p>
        {isIos ? (
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            En iPhone no hay botón Instalar. Tocá{" "}
            <span className="inline-flex align-text-bottom text-gray-700" aria-hidden="true">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
            </span>{" "}
            Compartir y después <span className="font-semibold text-gray-700">Agregar a pantalla de inicio</span>.
          </p>
        ) : (
          <p className="text-xs text-gray-500">Acceso rápido desde tu celular</p>
        )}
      </div>
      {canInstall && (
        <button
          onClick={promptInstall}
          className="shrink-0 px-3 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors"
        >
          Instalar
        </button>
      )}
      <button onClick={handleDismiss} aria-label="Descartar" className="shrink-0 p-1 text-gray-400 hover:text-gray-600">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
