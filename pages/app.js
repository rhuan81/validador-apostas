import { useEffect, useState } from "react";

export default function AppApostas() {
  const [apostas, setApostas] = useState([]);

  useEffect(() => {
    fetch("/api/listar-apostas")
      .then(res => res.json())
      .then(data => {
        const hoje = new Date().toISOString().split("T")[0];
        const filtradas = data.filter(aposta => aposta.validado && aposta.data.startsWith(hoje));
        setApostas(filtradas);
      });
  }, []);

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
      <h1 className="text-2xl font-bold text-center mb-4">📲 Apostas do Dia</h1>

      {apostas.length === 0 ? (
        <p className="text-center text-gray-500">Nenhuma aposta validada hoje.</p>
      ) : (
        <div className="space-y-4">
          {apostas.map((jogo, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">🏆 {jogo.campeonato}</p>
              <h2 className="text-lg font-semibold">⚽ {jogo.time_casa} x {jogo.time_fora}</h2>
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
