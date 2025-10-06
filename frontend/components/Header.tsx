'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              ⚽ Football Predictions
            </h1>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button
                variant={isActive('/dashboard') ? 'default' : 'ghost'}
                className="font-medium"
              >
                Home
              </Button>
            </Link>
            <Link href="/tables">
              <Button
                variant={isActive('/tables') ? 'default' : 'ghost'}
                className="font-medium"
              >
                Tables
              </Button>
            </Link>
            <Link href="/predict">
              <Button
                variant={isActive('/predict') ? 'default' : 'ghost'}
                className="font-medium"
              >
                Predict
              </Button>
            </Link>
            <Link href="/group">
              <Button
                variant={isActive('/group') ? 'default' : 'ghost'}
                className="font-medium"
              >
                Group
              </Button>
            </Link>

            {/* User Profile Dropdown */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden md:inline">{user.username}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div>
                      <p className="font-semibold">{user.username}</p>
                      <p className="text-xs text-slate-500 font-normal">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
