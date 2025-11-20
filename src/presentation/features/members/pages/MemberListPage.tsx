import { Link } from 'react-router-dom';
import type { Member } from '@domain/member/entities/Member';

interface MemberListPageProps {
    members: Member[];
    loading: boolean;
}

export function MemberListPage({ members, loading }: MemberListPageProps) {
    const getAge = (dateOfBirth: Date) => {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8 flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900">
                    Miembros Registrados
                </h2>
                <Link
                    to="/register-member"
                    className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-lg hover:bg-orange-600 transform hover:-translate-y-0.5 transition-all duration-300"
                >
                    + Nuevo Miembro
                </Link>
            </div>

            {members.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay miembros registrados</h3>
                    <p className="text-gray-500 mb-6">Comienza registrando tu primer miembro</p>
                    <Link
                        to="/register-member"
                        className="inline-block px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-lg hover:bg-orange-600 transform hover:-translate-y-0.5 transition-all duration-300"
                    >
                        Registrar Primer Miembro
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {members.map((member) => (
                        <Link
                            key={member.id}
                            to={`/member/${member.id}`}
                            className="group bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl hover:border-orange-300 transform hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="flex items-start space-x-4">
                                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                    {member.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xl font-bold text-gray-800 mb-1 truncate group-hover:text-orange-600 transition-colors duration-300">
                                        {member.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-2 truncate">{member.email}</p>
                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                        <span className="flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {getAge(member.dateOfBirth)} años
                                        </span>
                                        <span className="capitalize">{member.gender === 'male' ? 'M' : member.gender === 'female' ? 'F' : 'O'}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

