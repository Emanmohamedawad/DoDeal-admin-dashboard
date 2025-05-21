import { useState, useEffect } from 'react';
import Button from './Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (form: any) => void;
  initialData?: any;
}

export default function Modal({ isOpen, onClose, onSubmit, initialData }: Props) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', gender: 'male' });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (form.name && form.email) {
      onSubmit(form);
      onClose();
    } else {
      alert("Name and Email are required.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{initialData ? 'Edit User' : 'Create User'}</h2>
        <input name="name" className="w-full p-2 mb-2 border" placeholder="Name" value={form.name} onChange={handleChange} />
        <input name="email" className="w-full p-2 mb-2 border" placeholder="Email" value={form.email} onChange={handleChange} />
        <input name="phone" className="w-full p-2 mb-2 border" placeholder="Phone" value={form.phone} onChange={handleChange} />
        <select name="gender" className="w-full p-2 mb-4 border" value={form.gender} onChange={handleChange}>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <div className="flex justify-end space-x-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </div>
      </div>
    </div>
  );
}
