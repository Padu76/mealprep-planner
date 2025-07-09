'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  
  return (
    <header className="bg-gray-900/90 backdrop-blur-md shadow-lg border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="/images/icon-192x192.png" alt="Meal Prep Logo" className="w-10 h-10 rounded-full" />
          <h1 className="text-2xl font-bold text-white">Meal Prep Planner</h1>
        </div>
        
        <nav className="hidden md:flex gap-6">
          <Link 
            href="/" 
            className={`transition-colors ${
              pathname === '/' 
                ? 'text-green-400 font-medium border-b-2 border-green-400 pb-2' 
                : 'text-white hover:text-green-400'
            }`}
          >
            Home
          </Link>
          <Link 
            href="/dashboard" 
            className={`transition-colors ${
              pathname === '/dashboard' 
                ? 'text-green-400 font-medium border-b-2 border-green-400 pb-2' 
                : 'text-white hover:text-green-400'
            }`}
          >
            Dashboard
          </Link>
          <Link 
            href="/ricette" 
            className={`transition-colors ${
              pathname === '/ricette' 
                ? 'text-green-400 font-medium border-b-2 border-green-400 pb-2' 
                : 'text-white hover:text-green-400'
            }`}
          >
            Ricette
          </Link>
        </nav>
      </div>
    </header>
  );
}