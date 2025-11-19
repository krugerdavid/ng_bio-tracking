import { Routes, Route } from 'react-router-dom';
import Layout from './presentation/components/Layout';
import ProtectedRoute from './presentation/components/ProtectedRoute';
import LoginPage from './presentation/pages/auth/LoginPage';
import MemberListPage from './presentation/pages/MemberListPage';
import MemberDetailPage from './presentation/pages/MemberDetailPage';
import RegisterMemberPage from './presentation/pages/RegisterMemberPage';
import UserManagementPage from './presentation/pages/admin/UserManagementPage';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<MemberListPage />} />
          <Route path="/register-member" element={<RegisterMemberPage />} />
          <Route path="/member/:memberId" element={<MemberDetailPage />} />
          <Route path="/users" element={<UserManagementPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
