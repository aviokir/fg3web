import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; 

export default function SuperAdminPanel() {
  const [jugadores, setJugadores] = useState([]);
  const [search, setSearch] = useState("");
  const [nuevoJugador, setNuevoJugador] = useState({
    nickname: '', playernumber: '', uuidplayer: '', vip: false, guardia: false, boss: false, ganador: false
  });

  useEffect(() => {
    fetchJugadores();
  }, []);

  async function fetchJugadores() {
    const { data } = await supabase.from('jugadoresfg3').select('*').order('playernumber', { ascending: true });
    if (data) setJugadores(data);
  }

  async function updatePlayer(id, updates) {
    if (updates.muerto === false) {
      for (let i = 1; i <= 12; i++) updates[`juego${i}`] = false;
    }
    
    const { error } = await supabase.from('jugadoresfg3').update(updates).eq('id', id);
    if (!error) fetchJugadores();
  }

  async function setJuegoMuerte(id, juegoNum) {
    const updates = { muerto: true, ganador: false };
    for (let i = 1; i <= 12; i++) {
      updates[`juego${i}`] = (i === juegoNum);
    }
    updatePlayer(id, updates);
  }

  async function eliminarSujeto(id) {
    if (confirm("¿ELIMINAR DEFINITIVAMENTE A ESTE ACTIVO?")) {
      const { error } = await supabase.from('jugadoresfg3').delete().eq('id', id);
      if (!error) fetchJugadores();
    }
  }

  async function agregarJugador(e) {
    e.preventDefault();
    const { error } = await supabase.from('jugadoresfg3').insert([nuevoJugador]);
    if (!error) {
      setNuevoJugador({ nickname: '', playernumber: '', uuidplayer: '', vip: false, guardia: false, boss: false, ganador: false });
      fetchJugadores();
    }
  }

  const filteredPlayers = jugadores.filter(j => 
    j.nickname.toLowerCase().includes(search.toLowerCase()) || j.playernumber.includes(search)
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-stone-300 font-sans p-6 md:p-12">
      
      <header className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-center gap-8 border-b border-stone-800 pb-10">
        <div>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Terminal / <span className="text-emerald-500">Control_Panel</span></h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-stone-600 mt-2 font-bold italic">Gestión de Roles, Estados y Ganadores</p>
        </div>

        <div className="relative w-full md:w-96">
          <input 
            type="text" 
            placeholder="BUSCAR NICK O NÚMERO..." 
            className="w-full bg-stone-900/50 border-2 border-stone-800 p-4 rounded-2xl text-sm outline-none focus:border-emerald-500 text-white shadow-2xl transition-all font-bold"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* PANEL DE REGISTRO */}
        <div className="lg:col-span-3">
          <div className="bg-[#141414] p-8 rounded-[2rem] border border-stone-800 shadow-2xl sticky top-12">
            <h2 className="text-white text-md font-black uppercase mb-6 border-l-4 border-emerald-500 pl-4 italic">Nuevo Activo</h2>
            <form onSubmit={agregarJugador} className="space-y-4">
              <input 
                type="text" placeholder="NICKNAME" required
                className="w-full bg-black border border-stone-800 p-4 rounded-xl text-xs outline-none focus:border-white text-white uppercase font-bold"
                value={nuevoJugador.nickname} onChange={e => setNuevoJugador({...nuevoJugador, nickname: e.target.value})}
              />
              <input 
                type="text" placeholder="Nº JUGADOR" required
                className="w-full bg-black border border-stone-800 p-4 rounded-xl text-xs outline-none focus:border-white text-white font-bold"
                value={nuevoJugador.playernumber} onChange={e => setNuevoJugador({...nuevoJugador, playernumber: e.target.value})}
              />
              <textarea 
                placeholder="UUID PLAYER" required
                className="w-full bg-black border border-stone-800 p-4 rounded-xl text-[10px] outline-none focus:border-white text-stone-400 h-20 font-mono"
                value={nuevoJugador.uuidplayer} onChange={e => setNuevoJugador({...nuevoJugador, uuidplayer: e.target.value})}
              />
              <button className="w-full bg-white text-black font-black py-4 rounded-xl text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-lg">Inscribir Sujeto</button>
            </form>
          </div>
        </div>

        {/* TABLA DE GESTIÓN */}
        <div className="lg:col-span-9">
          <div className="bg-[#141414] rounded-[2.5rem] border border-stone-800 shadow-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-stone-900/50 text-[10px] uppercase tracking-widest text-stone-600 font-black italic">
                <tr>
                  <th className="p-8">Activo</th>
                  <th className="p-8 text-center">Gestión de Status</th>
                  <th className="p-8">Muerte</th>
                  <th className="p-8 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/50">
                {filteredPlayers.map(j => (
                  <tr key={j.id} className={`hover:bg-white/[0.02] transition-all ${j.ganador ? 'bg-white/[0.01]' : ''}`}>
                    <td className="p-8">
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <img src={`https://mc-heads.net/avatar/${j.nickname}/64`} className="w-14 h-14 [image-rendering:pixelated] drop-shadow-md" alt="head" />
                          {j.boss && <span className="absolute -top-2 -right-2 bg-amber-500 text-black text-[8px] font-black px-1 rounded border border-black shadow-lg animate-bounce">BOSS</span>}
                        </div>
                        <div>
                          <p className={`font-black text-lg uppercase tracking-tighter leading-none ${j.boss ? 'text-amber-500' : 'text-white'}`}>
                            {j.nickname} {j.ganador && "🏆"}
                          </p>
                          <p className="text-[10px] font-mono text-stone-600 mt-1 uppercase italic font-bold">#{j.playernumber}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-8">
                      <div className="grid grid-cols-2 gap-2 w-72 mx-auto">
                        <button 
                          onClick={() => updatePlayer(j.id, { muerto: false, ganador: false })}
                          className={`text-[9px] py-2 px-3 rounded-lg font-black border transition-all ${!j.muerto && !j.ganador ? 'bg-emerald-600/20 text-emerald-500 border-emerald-500/40' : 'text-stone-700 border-stone-900 opacity-40 hover:opacity-100'}`}
                        > VIVO </button>
                        
                        <button 
                          onClick={() => updatePlayer(j.id, { muerto: true, ganador: false })}
                          className={`text-[9px] py-2 px-3 rounded-lg font-black border transition-all ${j.muerto ? 'bg-red-600/20 text-red-500 border-red-500/40' : 'text-stone-700 border-stone-900 opacity-40 hover:opacity-100'}`}
                        > MUERTO </button>
                        
                        {/* BOTONES DE ROL (3 COLUMNAS) */}
                        <div className="col-span-2 grid grid-cols-3 gap-2 mt-1">
                          <button 
                            onClick={() => updatePlayer(j.id, { boss: !j.boss })}
                            className={`text-[8px] py-2 px-1 rounded-lg font-black border transition-all ${j.boss ? 'bg-amber-600/20 text-amber-500 border-amber-500/40' : 'text-stone-700 border-stone-900 opacity-40 hover:opacity-100'}`}
                          > BOSS </button>
                          
                          <button 
                            onClick={() => updatePlayer(j.id, { vip: !j.vip })}
                            className={`text-[8px] py-2 px-1 rounded-lg font-black border transition-all ${j.vip ? 'bg-purple-600/20 text-purple-400 border-purple-500/40' : 'text-stone-700 border-stone-900 opacity-40 hover:opacity-100'}`}
                          > VIP </button>
                          
                          <button 
                            onClick={() => updatePlayer(j.id, { guardia: !j.guardia })}
                            className={`text-[8px] py-2 px-1 rounded-lg font-black border transition-all ${j.guardia ? 'bg-blue-600/20 text-blue-400 border-blue-500/40' : 'text-stone-700 border-stone-900 opacity-40 hover:opacity-100'}`}
                          > GUARDIA </button>
                        </div>

                        <button 
                          onClick={() => updatePlayer(j.id, { ganador: !j.ganador, muerto: false })}
                          className={`col-span-2 text-[9px] py-2 px-3 rounded-lg font-black border transition-all ${j.ganador ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'text-stone-700 border-stone-900 opacity-40 hover:opacity-100'}`}
                        > 🏆 GANADOR </button>
                      </div>
                    </td>

                    <td className="p-8">
                      <select 
                        disabled={!j.muerto}
                        className={`bg-black text-[10px] p-3 rounded-xl border border-stone-800 outline-none w-full text-stone-500 font-bold uppercase transition-all ${!j.muerto ? 'opacity-20 cursor-not-allowed' : 'hover:border-red-500 text-red-500'}`}
                        onChange={(e) => setJuegoMuerte(j.id, parseInt(e.target.value))}
                        value={Object.keys(j).find(k => k.startsWith('juego') && j[k] === true)?.replace('juego', '') || ""}
                      >
                        <option value="">Status: Activo</option>
                        {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>Murió en Juego {i+1}</option>)}
                      </select>
                    </td>

                    <td className="p-8 text-right">
                      <button onClick={() => eliminarSujeto(j.id)} className="text-stone-800 hover:text-red-600 transition-colors p-3 bg-black rounded-xl border border-stone-900 shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}