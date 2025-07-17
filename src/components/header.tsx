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
    <header className="bg-gray-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            <span className="text-xl font-bold">Meal Prep Planner</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-white hover:text-green-400 transition-colors font-medium">
              🏠 Home
            </Link>
            <Link
              href="/dashboard"
              className="text-white hover:text-green-400 transition-colors font-medium"
            >
              📊 Dashboard
            </Link>
            <Link href="/pt-dashboard" className="text-white hover:text-green-400 transition-colors font-medium">
              🏋️‍♂️ PT Dashboard
            </Link>
            <Link
              href="/ricette"
              className="text-white hover:text-green-400 transition-colors font-medium"
            >
              🍽️ Ricette
            </Link>
            <Link
              href="/admin"
              className="text-white hover:text-green-400 transition-colors font-medium"
            >
              👨‍💼 Admin
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          >
            <span className="sr-only">Apri menu principale</span>
            {!isMobileMenuOpen ? (
              <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            ) : (
              <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-800">
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
              onClick={closeMobileMenu}
            >
              📊 Dashboard
            </Link>
            <Link
              href="/pt-dashboard"
              className="block text-white hover:text-green-400 transition-colors font-medium py-2 px-3 rounded-lg hover:bg-gray-800"
              onClick={closeMobileMenu}
            >
              🏋️‍♂️ PT Dashboard
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
          </div>
        </div>
      )}
    </header>
  );
}