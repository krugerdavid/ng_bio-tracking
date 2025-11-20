import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@presentation/shared/hooks/useAuth";
import { isAdmin } from "@domain/shared/value-objects/Role";

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { authState, logout } = useAuth();
  const user = authState.user;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    const result = await logout();
    if (result.isSuccess()) {
      navigate("/login");
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <img src="/ngtraining.png" alt="NG Training Logo" className="h-10 w-auto" />
              <h1 className="text-2xl font-bold text-gray-900">NG Training</h1>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex space-x-2">
                <Link
                  to="/"
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    location.pathname === "/"
                      ? "bg-orange-500 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  Inicio
                </Link>
                <Link
                  to="/members"
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    location.pathname === "/members" || location.pathname.startsWith("/member/")
                      ? "bg-orange-500 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  Miembros
                </Link>
                {user && isAdmin(user.role) && (
                  <Link
                    to="/users"
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      location.pathname === "/users"
                        ? "bg-orange-500 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    Usuarios
                  </Link>
                )}
              </div>

              {user && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 px-4 py-2 bg-white transition-all duration-300 focus:outline-none hover:cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">{user.email.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{user.email}</span>
                    </div>
                    <svg
                      className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 transition-colors duration-150"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  )}
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
