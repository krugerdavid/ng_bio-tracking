/**
 * PageLoader Component
 *
 * A reusable loading component that displays the NG Training logo
 * and a spinning loader animation. Used across the application for
 * lazy-loaded routes and data loading states.
 */
export function PageLoader() {
  return (
    <div className="flex flex-col flex-grow justify-center items-center w-full">
      <img src="/loader.png" alt="NG Training Logo" className="h-24 w-auto mb-6" />
      <div className="animate-spin rounded-full h-6 w-6 border-4 border-orange-500 border-t-transparent"></div>
    </div>
  );
}
