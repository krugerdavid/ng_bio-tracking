import { AppRouter } from "@presentation/app/router/AppRouter";
import { AuthProvider } from "@/presentation/app/providers/AuthProvider";
import { InstallPrompt } from "@presentation/shared/components/InstallPrompt";

function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <InstallPrompt />
    </AuthProvider>
  );
}

export default App;
