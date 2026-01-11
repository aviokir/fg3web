import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Directos() {
  const [streams, setStreams] = useState([]);
  const [domain, setDomain] = useState("");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDomain(window.location.hostname);
    }
    fetchStreams();
    const channel = supabase.channel('directos_realtime').on('postgres_changes', 
      { event: '*', schema: 'public', table: 'directosfg3' }, () => fetchStreams()
    ).subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  async function fetchStreams() {
    const { data } = await supabase.from('directosfg3').select('*');
    if (data) setStreams(data);
  }

  const getStreamInfo = (url) => {
    if (!url) return { name: "Desconocido", type: "link", color: "bg-stone-800" };
    if (url.includes("twitch.tv")) {
      const channel = url.split("twitch.tv/")[1]?.split("?")[0];
      return { name: channel, type: "twitch", color: "bg-purple-600" };
    }
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      return { name: "YouTube Live", type: "youtube", color: "bg-red-600" };
    }
    if (url.includes("kick.com")) {
      const channel = url.split("kick.com/")[1]?.split("?")[0];
      return { name: channel, type: "kick", color: "bg-emerald-500" };
    }
    if (url.includes("tiktok.com")) {
      return { name: "TikTok Live", type: "tiktok", color: "bg-pink-600" };
    }
    return { name: "Live Feed", type: "link", color: "bg-blue-600" };
  };

  // --- LÓGICA DE AGRUPACIÓN ---
  const groupedStreams = streams.reduce((acc, s) => {
    const info = getStreamInfo(s.link);
    const type = info.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push({ ...s, info });
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-stone-200 font-sans p-4 md:p-8">
      <header className="max-w-[1600px] mx-auto mb-10 border-b border-stone-800/50 pb-6">
        <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">
          FG3 // <span className="text-emerald-500">MULTIVERSE FEED</span>
        </h1>
        <p className="text-[9px] text-stone-600 uppercase tracking-[0.3em] mt-1 font-bold italic">
          Monitorización de plataformas externas
        </p>
      </header>

      <main className="max-w-[1600px] mx-auto space-y-12">
        {Object.keys(groupedStreams).length > 0 ? (
          Object.entries(groupedStreams).map(([platform, items]) => (
            <section key={platform} className="space-y-6">
              {/* Título de la Red Social */}
              <div className="flex items-center gap-4">
                <h2 className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest text-white ${items[0].info.color}`}>
                  {platform}
                </h2>
                <div className="h-[1px] flex-1 bg-stone-800/50"></div>
              </div>

              {/* Grid de la plataforma específica */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {items.map((s) => (
                  <a 
                    key={s.id} 
                    href={s.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group relative bg-[#111] border border-stone-800 rounded-2xl overflow-hidden shadow-2xl transition-all hover:border-emerald-500/50 hover:-translate-y-1 flex flex-col"
                  >
                    <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
                      {s.info.type === "twitch" && domain ? (
                        <iframe
                          src={`https://player.twitch.tv/?channel=${s.info.name}&parent=${domain}&autoplay=true&muted=true&controls=false&quality=low`}
                          height="100%" width="100%" className="absolute inset-0 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity"
                        ></iframe>
                      ) : (
                        <div className={`absolute inset-0 opacity-20 ${s.info.color} blur-3xl`}></div>
                      )}

                      <div className="relative z-10 flex flex-col items-center">
                        <div className={`w-12 h-12 ${s.info.color} rounded-full flex items-center justify-center mb-2 shadow-2xl`}>
                          <span className="text-white font-black text-xs uppercase">{s.info.type[0]}</span>
                        </div>
                        <span className="text-[10px] font-black text-white/50 uppercase tracking-widest group-hover:text-white transition-colors">
                          Abrir {s.info.type}
                        </span>
                      </div>

                      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-red-600 px-2 py-0.5 rounded text-[8px] font-black uppercase text-white">
                        <span className="w-1 h-1 bg-white rounded-full animate-pulse"></span>
                        Live
                      </div>
                    </div>

                    <div className="p-5 bg-[#111] border-t border-stone-800/50">
                      <h3 className="text-sm font-black text-white uppercase italic truncate">
                        {s.info.name}
                      </h3>
                      <div className="flex justify-between items-center mt-1">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${s.info.color} text-white`}>
                          {s.info.type}
                        </span>
                        <span className="text-[9px] text-stone-600 font-mono">#{s.id}</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="border-2 border-dashed border-stone-900 rounded-[2rem] p-20 text-center">
             <p className="text-stone-800 font-black uppercase tracking-[0.5em] text-xs italic">No hay señales vinculadas</p>
          </div>
        )}
      </main>
    </div>
  );
}