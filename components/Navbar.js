import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navbar() {
  const router = useRouter();

  const navLinks = [
    { name: 'Jugadores', path: '/' },
    { name: 'Directos', path: '/directos' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-black/50 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-black italic group-hover:rotate-12 transition-transform">
            FG
          </div>
          <span className="text-white font-black tracking-tighter text-xl italic uppercase">Fetu Games 3</span>
        </Link>

        {/* LINKS */}
        <div className="flex gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              href={link.path}
              className={`text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:text-emerald-500 ${
                router.pathname === link.path ? 'text-emerald-500' : 'text-stone-500'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* STATUS INDICATOR (Solo visual) */}
        <div className="hidden md:flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/5">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Powered by Encantia</span>
        </div>
      </div>
    </nav>
  );
}