import { useDispatch } from 'react-redux';
import { login } from '../store/authSlice';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { t } = useTranslation();

  const handleLogin = () => {
    if (email === 'admin@example.com' && password === 'admin123') {
      dispatch(login('FAKE_TOKEN'));
      router.push('/dashboard');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="bg-gray-100 p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl mb-6 font-bold text-center">{t('login')}</h2>
        <input className="w-full mb-4 p-2 border rounded" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full mb-4 p-2 border rounded" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="bg-primary w-full text-white p-2 rounded" onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
}
