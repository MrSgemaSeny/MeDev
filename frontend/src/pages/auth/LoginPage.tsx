import { Link } from 'react-router-dom';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import { api } from '../../shared/api/axios';
import { useAuthStore } from '../../entities/user/model/store';
import { useState } from 'react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.accessToken, data.refreshToken, data.username, data.plan);
    } catch (error) {
      console.error('Login failed', error);
      alert('Login failed. Check credentials.');
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-black">
      {/* Left Side - Solid Dark & Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-sm relative z-10">
          <div className="mb-12 flex justify-center">
            <svg className="w-12 h-12 text-zinc-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-extrabold text-zinc-100 mb-8 text-center tracking-tight">
            Log in to MeDev
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input 
                type="email" 
                placeholder="Email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div>
              <Input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            <div className="pt-2">
              <Button type="submit" className="w-full h-12">Log In</Button>
            </div>
          </form>

          <p className="text-center text-sm text-zinc-500 mt-8 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-zinc-300 font-semibold hover:text-white hover:underline transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Static Graphic Background */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-zinc-950 border-l border-zinc-900 justify-center items-center">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at center, #18181b 0%, #09090b 100%)' }}></div>
        {/* Subtle large watermark */}
        <div className="absolute flex justify-center items-center inset-0 opacity-10">
          <svg className="w-3/4 h-3/4 text-zinc-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
