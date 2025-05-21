import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../store"; // Adjusted to match the correct path if 'store.ts' is in the 'store' folder
import { fetchUsers, createUser, editUser } from "../store/userSlice";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Modal from "../components/Modal";
import Button from "../components/Button";
import type { User } from "../store/userSlice";

export default function Dashboard() {
  const dispatch: AppDispatch = useDispatch();
  const users = useSelector((state: any) => state.users.list);
  const loading = useSelector((state: any) => state.users.loading);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<User | null>(null);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleOpenCreate = () => {
    setEditData(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditData(user);
    setModalOpen(true);
  };

  const handleSubmit = (form: Omit<User, "id">) => {
    if (editData) {
      dispatch(editUser({ id: editData.id, data: form }));
    } else {
      dispatch(createUser(form));
    }
    setModalOpen(false);
  };

  return (
    <div className="flex">
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex-1 md:ml-64">
        <Header onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="p-6 bg-white min-h-screen">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">User List</h2>
            <Button onClick={handleOpenCreate}>+ Add User</Button>
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ul className="space-y-2">
              {users.map((user) => (
                <li
                  key={user.id}
                  className="border p-4 rounded shadow flex justify-between items-center"
                >
                  <span>
                    {user.name} ({user.email})
                  </span>
                  <Button onClick={() => handleOpenEdit(user)}>Edit</Button>
                </li>
              ))}
            </ul>
          )}
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onSubmit={handleSubmit}
            initialData={editData}
          />
        </main>
      </div>
    </div>
  );
}
