import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-gray-900/90 backdrop-blur-md shadow-lg border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="/images/icon-192x192.png" alt="Meal Prep Logo" className="w-10 h-10 rounded-full" />
          <h1 className="text-2xl font-bold text-white">Meal Prep Planner</h1>
        </div>
        
        <nav className="hidden md:flex gap-6">
          <Link href="/" className="text-white hover:text-green-400 transition-colors">Home</Link>
          <Link 
            href="/dashboard" 
            className="text-white hover:text-green-400 transition-colors"
            onClick={(e) => {
              console.log('🔍 Dashboard link clicked');
              // Test se il link funziona
            }}
          >
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}