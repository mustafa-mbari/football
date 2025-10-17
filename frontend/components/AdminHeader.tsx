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

export default function AdminHeader() {
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

  const isActive = (path: string) => {
    if (path === '/admin' && pathname === '/admin') return true;
    if (path !== '/admin' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="bg-slate-800 dark:bg-slate-950 border-b border-slate-700 dark:border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/admin">
            <h1 className="text-2xl font-bold text-white cursor-pointer hover:text-blue-400 transition-colors">
              Admin Dashboard
            </h1>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            <Link href="/admin">
              <Button
                variant={isActive('/admin') && pathname === '/admin' ? 'secondary' : 'ghost'}
                size="sm"
                className={isActive('/admin') && pathname === '/admin' ? 'text-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-700'}
              >
                Dashboard
              </Button>
            </Link>
            <Link href="/admin/leagues">
              <Button
                variant={isActive('/admin/leagues') ? 'secondary' : 'ghost'}
                size="sm"
                className={isActive('/admin/leagues') ? 'text-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-700'}
              >
                Leagues
              </Button>
            </Link>
            <Link href="/admin/gameweeks">
              <Button
                variant={isActive('/admin/gameweeks') ? 'secondary' : 'ghost'}
                size="sm"
                className={isActive('/admin/gameweeks') ? 'text-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-700'}
              >
                GameWeeks
              </Button>
            </Link>
            <Link href="/admin/matches">
              <Button
                variant={isActive('/admin/matches') && !pathname.includes('bulk-import') ? 'secondary' : 'ghost'}
                size="sm"
                className={isActive('/admin/matches') && !pathname.includes('bulk-import') ? 'text-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-700'}
              >
                Matches
              </Button>
            </Link>
            <Link href="/admin/matches/bulk-import">
              <Button
                variant={pathname.includes('bulk-import') ? 'secondary' : 'ghost'}
                size="sm"
                className={pathname.includes('bulk-import') ? 'text-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-700'}
              >
                Bulk Import
              </Button>
            </Link>
            <Link href="/admin/standings">
              <Button
                variant={isActive('/admin/standings') ? 'secondary' : 'ghost'}
                size="sm"
                className={isActive('/admin/standings') ? 'text-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-700'}
              >
                Standings
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button
                variant={isActive('/admin/settings') ? 'secondary' : 'ghost'}
                size="sm"
                className={isActive('/admin/settings') ? 'text-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-700'}
              >
                Settings
              </Button>
            </Link>

            {/* Divider */}
            <div className="h-8 w-px bg-slate-600 mx-2"></div>

            {/* Back to Main */}
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-400 hover:text-blue-300 hover:bg-slate-700"
              >
                Back to Main
              </Button>
            </Link>

            {/* User Profile Dropdown */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-2 border-slate-600 bg-slate-700 text-white hover:bg-slate-600">
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
                      <p className="text-xs text-blue-600 font-semibold mt-1">{user.role}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                    User Dashboard
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
