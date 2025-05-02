import { useEffect, useState } from "react";

export default function AppApostas() {
 const [intervalo, setIntervalo] = useState(60);

useEffect(() => {
  const salvo = localStorage.getItem("intervaloFiltroMinutos");
  if (salvo) setIntervalo(parseInt(salvo));
}, []);

  });
  const [apostas, setApostas] = useState([]);
  const [todasApostas, setTodasApostas] = useState([]);

  useEffect(() => {
    const agora = new Date();
    fetch("/api/listar-apostas")
      .then(res => res.json())
      .then(data => {
        const limite = new Date(agora.getTime() + intervalo * 60000);
        const filtradas = data.filter(aposta =>
          aposta.validado &&
          new Date(aposta.data) > agora &&
          new Date(aposta.data) <= limite
        );
        setApostas(filtradas);
        setTodasApostas(data.filter(a => a.validado));
      });
  }, [intervalo]);

  const gerarMensagem = () => {
    const texto = apostas.map(jogo => (
      `📢 APOSTA VALIDADA HT\n` +
      `🏆 ${jogo.campeonato}\n` +
      `⚽ ${jogo.time_casa} x ${jogo.time_fora}\n` +
      `📊 Gols HT: ${jogo.media_gols_ht.toFixed(2)}\n` +
      `🚩 Escanteios HT: ${jogo.media_escanteios_ht.toFixed(2)}\n` +
      `🎯 Resultado: ${jogo.resultado || 'PENDENTE'}\n`
    )).join("\n-------------------------\n");
    const link = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(link, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className='flex justify-end mb-2'>
        <button
          onClick={() => {
            localStorage.removeItem("intervaloFiltroMinutos");
            setIntervalo(1440); // mostrar todo o dia
          }}
          className='text-sm text-blue-600 underline hover:text-blue-800'
        >
          🔓 Ver todos os jogos do dia
        </button>
      </div>

      <h1 className="text-2xl font-bold text-center mb-4">📲 Apostas do Dia</h1>
      <div className='flex flex-wrap gap-2 justify-center mb-4'>
        <button
          onClick={() => window.location.reload()}
          className='bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm'
        >
          🔄 Atualizar apostas
        </button>
        <label className='text-sm font-medium self-center'>⏱ Mostrar jogos até:</label>
        <select
          value={intervalo}
          onChange={e => {
            const novo = parseInt(e.target.value);
            setIntervalo(novo);
            localStorage.setItem("intervaloFiltroMinutos", novo);
          }}
          className='border rounded px-2 py-1 text-sm'
        >
          <option value={15}>15 min</option>
          <option value={30}>30 min</option>
          <option value={60}>1 hora</option>
          <option value={120}>2 horas</option>
          <option value={180}>3 horas</option>
        </select>
        <button
          onClick={() => setApostas(todasApostas.filter(a => a.resultado === "GREEN"))}
          className='text-sm bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700'
        >
          ✅ Mostrar Greens
        </button>
        <button
          onClick={() => setApostas(todasApostas.filter(a => a.resultado === "RED"))}
          className='text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700'
        >
          ❌ Mostrar Reds
        </button>
      </div>

      {apostas.length === 0 ? (
        <p className="text-center text-gray-500">Nenhuma aposta validada encontrada nesse intervalo.</p>
      ) : (
        <div className="space-y-4">
          {apostas.map((jogo, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">🏆 {jogo.campeonato}</p>
              <h2 className="text-lg font-semibold">⚽ {jogo.time_casa} x {jogo.time_fora}</h2>
              <p className="text-sm text-gray-500">⏰ {new Date(jogo.data).toLocaleString()}</p>
              <p>📊 Gols HT: {jogo.media_gols_ht.toFixed(2)}</p>
              <p>🚩 Escanteios HT: {jogo.media_escanteios_ht.toFixed(2)}</p>
              <p className="mt-2">🎯 Resultado: <strong>{jogo.resultado || "PENDENTE"}</strong></p>
            </div>
          ))}
          <button
            onClick={gerarMensagem}
            className="w-full bg-green-600 text-white py-2 rounded mt-4 hover:bg-green-700"
          >
            📲 Enviar para WhatsApp
          </button>
        </div>
      )}
    </div>
  );
}
fix(app): proteger uso de localStorage para SSR e corrigir erro de build no Vercel
fix(app): corrigido useEffect incompleto que causava erro no Vercel
