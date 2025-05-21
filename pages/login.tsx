import { useDispatch } from 'react-redux';
import { login } from '../store/authSlice';
import { useRouter } from 'next/router';
import { useState } from 'react';

const LoginPage: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleLogin = (): void => {
    if (email === 'admin@example.com' && password === 'admin123') {
      const token = 'FAKE_TOKEN';
      dispatch(login(token));
      document.cookie = `token=${token}; path=/`;
      router.push('/dashboard');
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ffffff]">
      <div className="bg-[#ffffff] p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all hover:scale-105">
        <h2 className="text-3xl font-extrabold text-center text-[#132a13] mb-6">Login</h2>
        <input
          className="w-full mb-4 p-3 border-2 border-[#132a13]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f772d] focus:border-transparent bg-[#ffffff] text-[#132a13] placeholder-[#132a13]/50"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        />
        <input
          className="w-full mb-4 p-3 border-2 border-[#132a13]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f772d] focus:border-transparent bg-[#ffffff] text-[#132a13] placeholder-[#132a13]/50"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}
        <button
          className="w-full bg-[#4f772d] text-[#ffffff] p-3 rounded-lg font-semibold hover:bg-[#132a13] transition-colors duration-300"
          onClick={handleLogin}
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default LoginPage;