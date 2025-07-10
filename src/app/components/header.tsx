'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Funzione per chiudere il menu mobile quando si clicca su un link
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-gray-900/90 backdrop-blur-md shadow-lg border-b border-gray-700 relative z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src="/images/icon-192x192.png" alt="Meal Prep Logo" className="w-10 h-10 rounded-full" />
            <h1 className="text-2xl font-bold text-white">Meal Prep Planner</h1>
          </div>
          
          {/* Desktop Navigation */}
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex flex-col gap-1 p-2 rounded-lg hover:bg-gray-800 transition-colors"
            aria-label="Toggle mobile menu"
          >
            <div className={`w-6 h-0.5 bg-white transition-all duration-300 ${
              isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''
            }`}></div>
            <div className={`w-6 h-0.5 bg-white transition-all duration-300 ${
              isMobileMenuOpen ? 'opacity-0' : ''
            }`}></div>
            <div className={`w-6 h-0.5 bg-white transition-all duration-300 ${
              isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
            }`}></div>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen 
            ? 'max-h-64 opacity-100 mt-4' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <nav className="flex flex-col gap-1 bg-gray-800 rounded-lg p-4 border border-gray-700">
            <Link 
              href="/"
              onClick={closeMobileMenu}
              className={`px-4 py-3 rounded-lg transition-all ${
                pathname === '/' 
                  ? 'bg-green-600 text-white font-medium' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🏠</span>
                <span>Home</span>
              </div>
            </Link>
            
            <Link 
              href="/dashboard"
              onClick={closeMobileMenu}
              className={`px-4 py-3 rounded-lg transition-all ${
                pathname === '/dashboard' 
                  ? 'bg-green-600 text-white font-medium' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">📊</span>
                <span>Dashboard</span>
                <span className="ml-auto text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                  I Tuoi Piani
                </span>
              </div>
            </Link>
            
            <Link 
              href="/ricette"
              onClick={closeMobileMenu}
              className={`px-4 py-3 rounded-lg transition-all ${
                pathname === '/ricette' 
                  ? 'bg-green-600 text-white font-medium' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🍳</span>
                <span>Ricette</span>
                <span className="ml-auto text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                  Database
                </span>
              </div>
            </Link>

            {/* Divider */}
            <div className="border-t border-gray-600 my-2"></div>

            {/* Additional Mobile Actions */}
            <button
              onClick={() => {
                document.getElementById('meal-form')?.scrollIntoView({ behavior: 'smooth' });
                closeMobileMenu();
              }}
              className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium text-center"
            >
              <div className="flex items-center justify-center gap-2">
                <span>🚀</span>
                <span>Crea Nuovo Piano</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
          onClick={closeMobileMenu}
        />
      )}
    </header>
  );
}