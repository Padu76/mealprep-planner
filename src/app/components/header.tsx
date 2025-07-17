'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-gray-900/90 backdrop-blur-md shadow-lg border-b border-gray-700 relative">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <img src="/images/icon-192x192.png" alt="Meal Prep Logo" className="w-10 h-10 rounded-full" />
            <h1 className="text-xl md:text-2xl font-bold text-white">Meal Prep Planner</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-white hover:text-green-400 transition-colors font-medium">
              🏠 Home
            </Link>
            <Link
              href="/dashboard"
              className="text-white hover:text-green-400 transition-colors font-medium"
              onClick={(e) => {
                console.log('🎯 Dashboard link clicked');
              }}
            >
              📊 Dashboard
            </Link>
            <Link href="/analisi-grasso" className="text-white hover:text-green-400 transition-colors font-medium">
              📊 Analisi Grasso
            </Link>
            <Link href="/ricette" className="text-white hover:text-green-400 transition-colors font-medium">
              🍽️ Ricette
            </Link>
            <Link href="/admin" className="text-white hover:text-green-400 transition-colors font-medium">
              👨‍💼 Admin
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden text-white hover:text-green-400 transition-colors p-2"
            aria-label="Toggle mobile menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-gray-900/95 backdrop-blur-md border-b border-gray-700 shadow-lg z-50">
            <nav className="px-4 py-4 space-y-4">
              <Link
                href="/"
                className="block text-white hover:text-green-400 transition-colors font-medium py-2 px-3 rounded-lg hover:bg-gray-800"
                onClick={closeMobileMenu}
              >
                🏠 Home
              </Link>
              <Link
                href="/dashboard"
                className="block text-white hover:text-green-400 transition-colors font-medium py-2 px-3 rounded-lg hover:bg-gray-800"
                onClick={(e) => {
                  console.log('🎯 Mobile Dashboard link clicked');
                  closeMobileMenu();
                }}
              >
                📊 Dashboard
              </Link>
              <Link
                href="/analisi-grasso"
                className="block text-white hover:text-green-400 transition-colors font-medium py-2 px-3 rounded-lg hover:bg-gray-800"
                onClick={closeMobileMenu}
              >
                📊 Analisi Grasso
              </Link>
              <Link
                href="/ricette"
                className="block text-white hover:text-green-400 transition-colors font-medium py-2 px-3 rounded-lg hover:bg-gray-800"
                onClick={closeMobileMenu}
              >
                🍽️ Ricette
              </Link>
              <Link
                href="/admin"
                className="block text-white hover:text-green-400 transition-colors font-medium py-2 px-3 rounded-lg hover:bg-gray-800"
                onClick={closeMobileMenu}
              >
                👨‍💼 Admin
              </Link>
              
              {/* Mobile Quick Actions */}
              <div className="pt-4 border-t border-gray-700">
                <div className="text-gray-400 text-sm font-medium mb-3">⚡ Azioni Rapide</div>
                <Link
                  href="/#meal-form"
                  className="block text-green-400 hover:text-green-300 transition-colors font-medium py-2 px-3 rounded-lg hover:bg-gray-800 text-sm"
                  onClick={closeMobileMenu}
                >
                  🚀 Crea Piano Veloce
                </Link>
                <button
                  onClick={() => {
                    // Scroll to form section
                    document.getElementById('meal-form')?.scrollIntoView({ behavior: 'smooth' });
                    closeMobileMenu();
                  }}
                  className="block w-full text-left text-blue-400 hover:text-blue-300 transition-colors font-medium py-2 px-3 rounded-lg hover:bg-gray-800 text-sm"
                >
                  📋 Vai al Form
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={closeMobileMenu}
        />
      )}
    </header>
  );
}