import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isAdmin } from '@domain/value-objects/Role';

export default function Layout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                BioTracker
                            </h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="hidden md:flex space-x-1">
                                <Link
                                    to="/"
                                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${location.pathname === '/'
                                        ? 'bg-orange-500 text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                >
                                    Miembros
                                </Link>
                                <Link
                                    to="/register-member"
                                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${location.pathname === '/register-member'
                                        ? 'bg-orange-500 text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                >
                                    Registrar Miembro
                                </Link>
                                {user && isAdmin(user.role) && (
                                    <Link
                                        to="/users"
                                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${location.pathname === '/users'
                                            ? 'bg-orange-500 text-white shadow-md'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                            }`}
                                    >
                                        Usuarios
                                    </Link>
                                )}
                            </div>

                            {user && (
                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-600">{user.email}</span>
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${isAdmin(user.role)
                                            ? 'bg-orange-100 text-orange-800'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {isAdmin(user.role) ? 'Admin' : 'Usuario'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="px-4 py-2 text-sm border-2 border-black bg-white text-black font-semibold rounded-lg hover:bg-gray-50 transition-all duration-300"
                                    >
                                        Cerrar Sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    );
}
