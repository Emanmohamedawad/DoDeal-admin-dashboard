import { useDispatch } from 'react-redux';
import { login } from '../store/authSlice';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (email === 'admin@example.com' && password === 'admin123') {
      const token = 'FAKE_TOKEN';
      dispatch(login(token));
      document.cookie = `token=${token}; path=/`; // optional for middleware
      router.push('/dashboard');
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="bg-gray-100 p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl mb-6 font-bold text-center">Login</h2>
        <input
          className="w-full mb-4 p-2 border rounded"
          placeholder="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="w-full mb-4 p-2 border rounded"
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        <button
          className="bg-primary w-full text-white p-2 rounded"
          onClick={handleLogin}
        >
          Login
        </button>
      </div>
    </div>
  );
}
