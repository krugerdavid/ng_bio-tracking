import { Routes, Route } from 'react-router-dom';
import Layout from './presentation/components/Layout';
import MemberListPage from './presentation/pages/MemberListPage';
import MemberDetailPage from './presentation/pages/MemberDetailPage';
import RegisterMemberPage from './presentation/pages/RegisterMemberPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<MemberListPage />} />
        <Route path="/register" element={<RegisterMemberPage />} />
        <Route path="/member/:memberId" element={<MemberDetailPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
