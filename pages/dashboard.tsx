import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../store'; // Adjusted to match the correct path if 'store.ts' is in the 'store' folder
import { fetchUsers } from '../store/userSlice';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function Dashboard() {
  const dispatch: AppDispatch = useDispatch();
  const users = useSelector((state: any) => state.users.list);
  const loading = useSelector((state: any) => state.users.loading);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  return (
    <div className="flex">
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex-1 md:ml-64">
        <Header onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="p-6 bg-white min-h-screen">
          <h2 className="text-2xl font-bold mb-4">User List</h2>
          {loading ? <p>Loading...</p> : (
            <ul className="space-y-2">
              {users.map(user => (
                <li key={user.id} className="border p-4 rounded shadow">{user.name} ({user.email})</li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
};

