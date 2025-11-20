import { AppRouter } from "@presentation/app/router/AppRouter";
import { AuthProvider } from "@/presentation/app/providers/AuthProvider";

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
