import { Link } from 'react-router-dom';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import { api } from '../../shared/api/axios';
import { useAuthStore } from '../../entities/user/model/store';
import { useState } from 'react';

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/register', { email, username, password });
      setAuth(data.accessToken, data.refreshToken, data.username, data.plan);
    } catch (error) {
      console.error('Registration failed', error);
      alert('Registration failed.');
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-zinc-950">
      {/* Left Side - Animated Gradient */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-zinc-900 justify-center items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
        
        {/* Animated decorative blobs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse" style={{ animationDelay: '4s' }}></div>

        <div className="relative z-10 text-center px-12">
          <div className="mb-8 inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold text-white mb-6 tracking-tight">
            Join MeDev
          </h1>
          <p className="text-lg text-indigo-100 font-medium max-w-md mx-auto leading-relaxed">
            Start your journey with the best developer platform today.
          </p>
        </div>
      </div>

      {/* Right Side - Glassmorphic Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-zinc-50 dark:bg-zinc-950 relative">
        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-xl border border-white/40 dark:border-zinc-800/50">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Create an account</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8">Enter your details to get started</p>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Email</label>
                <Input 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Username</label>
                <Input 
                  type="text" 
                  placeholder="johndoe" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Password</label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              <div className="pt-2">
                <Button type="submit" className="w-full">Sign Up</Button>
              </div>
            </form>

            <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-8">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-500 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
