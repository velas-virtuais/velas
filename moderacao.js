// Filtro local rápido para palavras óbvias
const palavrasProibidas = ["idiota", "merda", "lixo", "burro", "trouxa", "zueira", "kkkk"];

// URL do seu Cloudflare Worker (Ponte Segura)
const WORKER_URL = "https://tight-dream-bc5b.joaodelrei29.workers.dev";

async function validarTextoComIA(texto) {
    if (!texto || texto.trim() === "") return true;

    // 1. Checa primeiro a lista local
    const textoLimpo = texto.toLowerCase();
    const contemPalavraProibida = palavrasProibidas.some(palavra => textoLimpo.includes(palavra));
    
    if (contemPalavraProibida) {
        console.log("🛑 Bloqueado pelo filtro local.");
        return false;
    }

    // 2. Envia para a IA de Moderação da OpenAI via Cloudflare Worker
    try {
        const response = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: texto })
        });

        const data = await response.json();
        if (!data.safe) {
            console.log("🛑 Bloqueado pela Inteligência Artificial.");
        }
        return data.safe;
    } catch (error) {
        console.warn("⚠️ Servidor de moderação inacessível. Liberando vela:", error);
        return true; // Se falhar a conexão, permite a postagem para não travar o usuário
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const btnAcao = document.getElementById("btn-acao");
    
    if (btnAcao) {
        const funcaoOriginal = window.acenderVela;

        window.acenderVela = async function() {
            const intencaoElement = document.getElementById("intencao");
            const nomeElement = document.getElementById("nome");
            
            const intencao = intencaoElement ? intencaoElement.value.trim() : "";
            const nome = nomeElement ? nomeElement.value.trim() : "";
            const textoCompleto = `${nome} ${intencao}`;

            btnAcao.disabled = true;
            btnAcao.innerText = "Verificando intenção...";

            const eRespeitoso = await validarTextoComIA(textoCompleto);

            if (!eRespeitoso) {
                alert("Por favor, utilize apenas palavras respeitosas para manter a harmonia deste santuário.");
                btnAcao.disabled = false;
                btnAcao.innerText = "🕯️ Acender Esta Vela";
                return;
            }

            if (typeof funcaoOriginal === 'function') {
                funcaoOriginal();
            } else {
                btnAcao.disabled = false;
                btnAcao.innerText = "🕯️ Acender Esta Vela";
            }
        };
    }
});
