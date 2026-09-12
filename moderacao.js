// Substitua pelo seu token do Hugging Face
const HF_TOKEN = "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";

// 1. Filtro Rápido Local (Adicione aqui as palavras óbvias e chacotas comuns)
const palavrasProibidas = ["idiota", "merda", "lixo", "burro", "trouxa", "zueira", "kkkk"];

async function validarTextoComIA(texto) {
    if (!texto || texto.trim() === "") return true;

    // Passo 1: Checa a lista local primeiro (rápido e não falha)
    const textoLimpo = texto.toLowerCase();
    const contemPalavrao = palavrasProibidas.some(palavra => textoLimpo.includes(palavra));
    
    if (contemPalavrao) {
        console.log("🛑 Bloqueado pelo filtro de lista local.");
        return false; // É tóxico
    }

    // Passo 2: Se passou na lista, pede para a IA analisar o contexto
    try {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/citizenlab/twitter-xlm-roberta-base-toxicity",
            {
                headers: { 
                    "Authorization": `Bearer ${HF_TOKEN}`,
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({ inputs: texto }),
            }
        );

        const result = await response.json();
        console.log("🤖 Resposta da IA:", result); // Mostra a pontuação no console (F12)

        if (Array.isArray(result) && result[0]) {
            // LABEL_1 significa tóxico neste modelo multilíngue
            const toxico = result[0].some(item => item.label === 'LABEL_1' && item.score > 0.65);
            if (toxico) console.log("🛑 Bloqueado pela Inteligência Artificial.");
            return !toxico;
        }

        return true; 
    } catch (error) {
        console.warn("⚠️ Servidor da IA demorou ou falhou. Liberando a vela:", error);
        return true; 
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const btnAcao = document.getElementById("btn-acao");
    
    if (btnAcao) {
        const funcaoOriginal = window.acenderVela;

        window.acenderVela = async function() {
            const intencao = document.getElementById("intencao").value.trim();
            const nome = document.getElementById("nome").value.trim();
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

            funcaoOriginal();
        };
    }
});
