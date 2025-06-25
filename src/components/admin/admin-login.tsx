
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onLogin: () => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState('admin@streamgoal.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Simple direct comparison for demo purposes
      // In a real app, we would use proper password hashing
      if (email === 'admin@streamgoal.com' && password === 'admin123') {
        // Store admin session in localStorage
        localStorage.setItem('streamgoal_admin', JSON.stringify({
          id: 'admin-id',
          email: email,
          loggedIn: true
        }));
        
        toast({
          title: "Login successful",
          description: "Welcome to the admin panel",
        });
        
        onLogin();
        return;
      }
      
      // If we get here, the login failed
      setError("Invalid email or password");
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Login error:', error);
      setError("An error occurred during login");
      toast({
        title: "Login failed",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto w-full max-w-md p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-gray-800 shadow-xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-green-400 bg-clip-text text-transparent">
            StreamGoal Admin
          </h1>
          <p className="text-gray-400 mt-2">Login to manage matches</p>
        </div>
        
        {error && (
          <div className="bg-red-900/50 border border-red-800 text-white p-4 rounded-md mb-6 animate-pulse">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-400" />
              <p>{error}</p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@streamgoal.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-gray-800 border-gray-700"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-gray-800 border-gray-700"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 transition-all duration-300"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
          
          <div className="text-center text-sm text-gray-400 mt-4">
            <p>Demo credentials:</p>
            <p>Email: admin@streamgoal.com</p>
            <p>Password: admin123</p>
          </div>
        </form>
      </div>
    </div>
  );
}