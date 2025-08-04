export default function Header() {
  return (
    <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-brand-blue rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">OI</span>
        </div>
        <span className="font-semibold text-brand-dark text-xl">ObjectionIQ</span>
      </div>
      <nav className="hidden md:flex items-center gap-6 text-sm text-gray-700">
        <a href="#" className="hover:text-brand-blue">Products</a>
        <a href="#" className="hover:text-brand-blue">Pricing</a>
        <a href="#" className="hover:text-brand-blue">About</a>
        <a href="#" className="hover:text-brand-blue">Contact</a>
        <button className="bg-brand-blue text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition">
          Request Access
        </button>
      </nav>
    </header>
  );
} 