import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

export default function UserDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      axios.get(`https://mini-admin-portal.vercel.app/api/users/${id}`)
        .then(res => {
          setUser(res.data);
          setLoading(false);
        }).catch(() => setLoading(false));
    }
  }, [id]);

  return (
    <div className="flex">
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex-1 md:ml-64">
        <Header onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="p-6 bg-white min-h-screen">
          <h2 className="text-2xl font-bold mb-4">User Details</h2>
          {loading ? <p>Loading...</p> : user ? (
            <div className="space-y-2">
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phone}</p>
              <p><strong>Gender:</strong> {user.gender}</p>
            </div>
          ) : <p>User not found</p>}
        </main>
      </div>
    </div>
  );
}
