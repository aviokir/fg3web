import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Home() {
  const [jugadores, setJugadores] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const nombresJuegos = [
    "Juego 1", "Juego 2", "Juego 3", "Juego 4", "Juego 5", "Juego 6",
    "Juego 7", "Juego 8", "Juego 9", "Juego 10", "Juego 11", "Juego 12"
  ];

  useEffect(() => {
    fetchJugadores();
    const channel = supabase.channel('main_live').on('postgres_changes', 
      { event: '*', schema: 'public', table: 'jugadoresfg3' }, () => fetchJugadores()
    ).subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  async function fetchJugadores() {
    const { data } = await supabase.from('jugadoresfg3').select('*').order('playernumber', { ascending: true });
    if (data) setJugadores(data);
  }

  // --- CLASIFICACIÓN POR ROLES Y ESTADOS ---
  const clasificacion = {
    ganador: jugadores.filter(j => j.ganador),
    jefe: jugadores.filter(j => j.boss && !j.ganador),
    guardias: jugadores.filter(j => j.guardia && !j.boss && !j.ganador),
    vips: jugadores.filter(j => j.vip && !j.boss && !j.guardia && !j.ganador),
    jugadores: jugadores.filter(j => !j.muerto && !j.boss && !j.guardia && !j.vip && !j.ganador),
    fallecidos: jugadores.filter(j => j.muerto && !j.ganador)
  };

  const getPlayerStyles = (player) => {
    if (player.ganador) return "text-white border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] animate-pulse";
    if (player.muerto) return "text-red-600 border-red-900/20";
    if (player.boss) return "text-amber-500 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]";
    if (player.guardia) return "text-blue-400 border-blue-500/30";
    if (player.vip) return "text-purple-400 border-purple-500/30";
    return "text-emerald-500 border-emerald-500/20";
  };

  const getJuegoMuerte = (player) => {
    for (let i = 1; i <= 12; i++) {
      if (player[`juego${i}`]) return { num: i, nombre: nombresJuegos[i - 1] };
    }
    return null;
  };

  const PlayerSection = ({ title, list, accentColor }) => {
    if (list.length === 0) return null;
    return (
      <div className="mb-16">
        <h2 className={`text-[10px] font-black uppercase tracking-[0.5em] mb-8 flex items-center gap-4 ${accentColor}`}>
          <span className="opacity-50">/</span> {title} <span className="text-[9px] bg-white/5 px-2 py-1 rounded-md ml-auto">{list.length}</span>
          <div className="h-[1px] flex-grow bg-stone-900"></div>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {list.map((j) => (
            <div 
              key={j.uuidplayer}
              onClick={() => setSelectedUser(j)}
              className={`group cursor-pointer bg-[#141414] border p-6 rounded-3xl transition-all hover:border-stone-400 ${j.muerto ? 'opacity-40 grayscale' : ''} ${getPlayerStyles(j).includes('border-') ? getPlayerStyles(j).split(' ').find(c => c.startsWith('border-')) : ''}`}
            >
              <div className="flex flex-col items-center text-center">
                <img src={`https://mc-heads.net/avatar/${j.nickname}/64`} className="w-16 h-16 [image-rendering:pixelated] mb-4 transition-transform group-hover:scale-110" alt={j.nickname} />
                <span className={`text-[10px] font-mono mb-1 ${j.muerto ? 'text-stone-700' : 'text-stone-500'}`}>#{j.playernumber}</span>
                <h2 className={`text-sm font-black uppercase truncate w-full ${getPlayerStyles(j).split(' ')[0]}`}>
                  {j.nickname} {j.ganador && "🏆"}
                </h2>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-stone-200 font-sans p-6 md:p-12">
      
      <header className="max-w-7xl mx-auto mb-16 flex justify-between items-end border-b border-stone-800/50 pb-8 pt-10">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">FG3 // <span className="text-emerald-500">PLAYERS</span></h1>
          <p className="text-[10px] text-stone-600 uppercase tracking-[0.4em] mt-2 font-bold">Monitorización de activos</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">● Jugadores Vivos</span>
          <p className="text-2xl font-mono text-white leading-none mt-1">{jugadores.filter(j => !j.muerto).length}</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <PlayerSection title="Ganador FG3" list={clasificacion.ganador} accentColor="text-white" />
        <PlayerSection title="Jefe" list={clasificacion.jefe} accentColor="text-amber-500" />
        <PlayerSection title="Guardias" list={clasificacion.guardias} accentColor="text-blue-500" />
        <PlayerSection title="Vips" list={clasificacion.vips} accentColor="text-purple-500" />
        <PlayerSection title="Jugadores" list={clasificacion.jugadores} accentColor="text-emerald-500" />
        <PlayerSection title="Fallecidos" list={clasificacion.fallecidos} accentColor="text-red-600" />
      </main>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-black/80 animate-in fade-in duration-300">
          <div className="bg-[#141414] border border-stone-700 w-full md:w-fit max-w-[95vw] rounded-[3rem] shadow-2xl overflow-hidden relative flex flex-col md:flex-row">
            
            <button onClick={() => setSelectedUser(null)} className="absolute top-8 right-8 text-stone-600 hover:text-white text-3xl z-20 transition-transform hover:rotate-90">✕</button>

            <div className="flex-none bg-[#0a0a0a] flex items-center justify-center p-12 md:p-16 border-b md:border-b-0 md:border-r border-stone-800">
              <img 
                src={`https://mc-heads.net/body/${selectedUser.nickname}/400`} 
                className={`h-[300px] md:h-[450px] [image-rendering:pixelated] drop-shadow-2xl transition-all ${selectedUser.muerto ? 'grayscale brightness-50' : ''}`}
                alt="Body"
              />
            </div>

            <div className="p-10 md:p-20 flex flex-col justify-center min-w-[350px]">
              <div className="mb-12">
                <h3 className={`text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-none whitespace-nowrap ${getPlayerStyles(selectedUser).split(' ')[0]}`}>
                  {selectedUser.nickname}
                </h3>
                <div className="mt-4 flex items-center gap-4">
                  <span className="text-3xl md:text-5xl font-mono text-stone-600 font-bold tracking-tighter">#{selectedUser.playernumber}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                {selectedUser.ganador && <span className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase rounded-xl tracking-widest shadow-lg">Ganador FG3</span>}
                {selectedUser.boss && <span className="px-8 py-3 bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-black uppercase rounded-xl tracking-widest">Jefe</span>}
                {selectedUser.guardia && <span className="px-8 py-3 bg-blue-600/10 text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase rounded-xl tracking-widest">Guardia</span>}
                {selectedUser.vip && <span className="px-8 py-3 bg-purple-600/10 text-purple-400 border border-purple-500/20 text-[10px] font-black uppercase rounded-xl tracking-widest">Vip</span>}
                <span className={`px-8 py-3 ${selectedUser.muerto ? 'bg-red-600/10 text-red-500 border-red-500/20' : 'bg-emerald-600/10 text-emerald-500 border-emerald-500/20'} text-[10px] font-black uppercase rounded-xl tracking-widest`}>
                  {selectedUser.muerto ? 'Fallecido' : 'Jugador'}
                </span>
              </div>

              {selectedUser.muerto && getJuegoMuerte(selectedUser) && (
                <div className="mt-8 bg-[#1a1111] border-l-4 border-red-600 p-6 rounded-r-2xl">
                  <p className="text-[10px] uppercase text-red-500/60 font-black mb-1">Este jugador fallecio en el juego:</p>
                  <p className="text-2xl font-black text-white italic uppercase">{getJuegoMuerte(selectedUser).nombre}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}