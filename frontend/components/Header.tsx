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

export default function Header() {
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

  const isActive = (path: string) => pathname === path;

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <span className="hidden sm:inline">⚽ Football Predictions</span>
              <span className="sm:hidden">⚽ FP</span>
            </h1>
          </Link>

          {/* Desktop Navigation Links - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-2">
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

            {/* User Profile Dropdown - Desktop */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden lg:inline">{user.username}</span>
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

          {/* Mobile Menu Button - Visible only on mobile */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                <SheetHeader>
                  <SheetTitle className="text-left">Navigation</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-8">
                  {/* User Info at top of mobile menu */}
                  {user && (
                    <div className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{user.username}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      </div>
                    </div>
                  )}

                  {/* Navigation Links */}
                  <Link href="/dashboard" onClick={closeMobileMenu}>
                    <Button
                      variant={isActive('/dashboard') ? 'default' : 'ghost'}
                      className="w-full justify-start text-lg h-12"
                    >
                      🏠 Home
                    </Button>
                  </Link>
                  <Link href="/tables" onClick={closeMobileMenu}>
                    <Button
                      variant={isActive('/tables') ? 'default' : 'ghost'}
                      className="w-full justify-start text-lg h-12"
                    >
                      📊 Tables
                    </Button>
                  </Link>
                  <Link href="/predict" onClick={closeMobileMenu}>
                    <Button
                      variant={isActive('/predict') ? 'default' : 'ghost'}
                      className="w-full justify-start text-lg h-12"
                    >
                      🎯 Predict
                    </Button>
                  </Link>
                  <Link href="/group" onClick={closeMobileMenu}>
                    <Button
                      variant={isActive('/group') ? 'default' : 'ghost'}
                      className="w-full justify-start text-lg h-12"
                    >
                      👥 Group
                    </Button>
                  </Link>

                  <div className="border-t border-slate-200 dark:border-slate-700 my-4"></div>

                  {/* Profile and Logout */}
                  <Link href="/profile" onClick={closeMobileMenu}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-lg h-12"
                    >
                      👤 Profile
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start text-lg h-12 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
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
