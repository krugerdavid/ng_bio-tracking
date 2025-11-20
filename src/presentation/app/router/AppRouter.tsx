import { Routes, Route } from 'react-router-dom';
import AppLayout from './AppLayout';
import PrivateRoute from './PrivateRoute';
import LoginPage from '../../features/auth/pages/LoginPage';
import MemberListPageController from '../../features/members/pages/MemberListPageController';
import MemberDetailPageController from '../../features/members/pages/MemberDetailPageController';
import RegisterMemberPageController from '../../features/members/pages/RegisterMemberPageController';
import UserManagementPageController from '../../features/admin/pages/UserManagementPageController';

export function AppRouter() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes */}
            <Route element={<PrivateRoute />}>
                <Route element={<AppLayout />}>
                    <Route path="/" element={<MemberListPageController />} />
                    <Route path="/members" element={<MemberListPageController />} />
                    <Route path="/register-member" element={<RegisterMemberPageController />} />
                    <Route path="/member/:memberId" element={<MemberDetailPageController />} />
                    <Route path="/users" element={<UserManagementPageController />} />
                </Route>
            </Route>
        </Routes>
    );
}

