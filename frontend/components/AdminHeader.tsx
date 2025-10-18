'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

export default function AdminHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path: string) => {
    if (path === '/admin' && pathname === '/admin') return true;
    if (path !== '/admin' && pathname.startsWith(path)) return true;
    return false;
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="bg-slate-800 dark:bg-slate-950 border-b border-slate-700 dark:border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/admin">
            <h1 className="text-xl md:text-2xl font-bold text-white cursor-pointer hover:text-blue-400 transition-colors">
              <span className="hidden sm:inline">Admin Dashboard</span>
              <span className="sm:hidden">Admin</span>
            </h1>
          </Link>

          {/* Desktop Navigation Links - Hidden on mobile/tablet */}
          <div className="hidden lg:flex items-center gap-1">
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

            {/* User Profile Dropdown - Desktop */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-2 border-slate-600 bg-slate-700 text-white hover:bg-slate-600">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden xl:inline">{user.username}</span>
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

          {/* Mobile Menu Button - Visible on mobile/tablet */}
          <div className="lg:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 text-white hover:bg-slate-700">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open admin menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px] bg-slate-900 text-white border-slate-700">
                <SheetHeader>
                  <SheetTitle className="text-left text-white">Admin Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-3 mt-8">
                  {/* User Info at top of mobile menu */}
                  {user && (
                    <div className="flex items-center gap-3 p-4 bg-slate-800 rounded-lg mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{user.username}</p>
                        <p className="text-xs text-blue-400 truncate">{user.role}</p>
                      </div>
                    </div>
                  )}

                  {/* Navigation Links */}
                  <Link href="/admin" onClick={closeMobileMenu}>
                    <Button
                      variant={isActive('/admin') && pathname === '/admin' ? 'secondary' : 'ghost'}
                      className={`w-full justify-start h-11 ${isActive('/admin') && pathname === '/admin' ? 'text-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}
                    >
                      📊 Dashboard
                    </Button>
                  </Link>
                  <Link href="/admin/leagues" onClick={closeMobileMenu}>
                    <Button
                      variant={isActive('/admin/leagues') ? 'secondary' : 'ghost'}
                      className={`w-full justify-start h-11 ${isActive('/admin/leagues') ? 'text-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}
                    >
                      🏆 Leagues
                    </Button>
                  </Link>
                  <Link href="/admin/gameweeks" onClick={closeMobileMenu}>
                    <Button
                      variant={isActive('/admin/gameweeks') ? 'secondary' : 'ghost'}
                      className={`w-full justify-start h-11 ${isActive('/admin/gameweeks') ? 'text-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}
                    >
                      📅 GameWeeks
                    </Button>
                  </Link>
                  <Link href="/admin/matches" onClick={closeMobileMenu}>
                    <Button
                      variant={isActive('/admin/matches') && !pathname.includes('bulk-import') ? 'secondary' : 'ghost'}
                      className={`w-full justify-start h-11 ${isActive('/admin/matches') && !pathname.includes('bulk-import') ? 'text-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}
                    >
                      ⚽ Matches
                    </Button>
                  </Link>
                  <Link href="/admin/matches/bulk-import" onClick={closeMobileMenu}>
                    <Button
                      variant={pathname.includes('bulk-import') ? 'secondary' : 'ghost'}
                      className={`w-full justify-start h-11 ${pathname.includes('bulk-import') ? 'text-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}
                    >
                      📥 Bulk Import
                    </Button>
                  </Link>
                  <Link href="/admin/standings" onClick={closeMobileMenu}>
                    <Button
                      variant={isActive('/admin/standings') ? 'secondary' : 'ghost'}
                      className={`w-full justify-start h-11 ${isActive('/admin/standings') ? 'text-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}
                    >
                      📈 Standings
                    </Button>
                  </Link>
                  <Link href="/admin/settings" onClick={closeMobileMenu}>
                    <Button
                      variant={isActive('/admin/settings') ? 'secondary' : 'ghost'}
                      className={`w-full justify-start h-11 ${isActive('/admin/settings') ? 'text-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}
                    >
                      ⚙️ Settings
                    </Button>
                  </Link>

                  <div className="border-t border-slate-700 my-4"></div>

                  {/* Back to Main and User Actions */}
                  <Link href="/dashboard" onClick={closeMobileMenu}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-11 text-blue-400 hover:text-blue-300 hover:bg-slate-700"
                    >
                      ← Back to Main
                    </Button>
                  </Link>
                  <Link href="/profile" onClick={closeMobileMenu}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-11 text-slate-300 hover:text-white hover:bg-slate-700"
                    >
                      👤 Profile
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start h-11 text-red-400 hover:text-red-300 hover:bg-red-950/20"
                  >
                    🚪 Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
