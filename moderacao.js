// Substitua pelo seu token do Hugging Face
const HF_TOKEN = "Shf_rMlEUEFonloSDJwVkLWrwYIdQHwwTAkWcs";

// Função responsável por consultar a IA
async function validarTextoComIA(texto) {
    if (!texto || texto.trim() === "") return true;

    try {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/unitary/unbiased-toxic-roberta",
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

        // Se a API retornar um array de classificações
        if (Array.isArray(result) && result[0]) {
            // Procura por pontuações de toxicidade acima de 60% (0.6)
            const toxico = result[0].some(item => 
                ['toxic', 'insult', 'identity_attack'].includes(item.label) && item.score > 0.6
            );
            return !toxico; // Retorna false se for tóxico
        }

        return true; // Libera caso a IA não retorne o formato esperado
    } catch (error) {
        console.warn("IA indisponível no momento. Liberando publicação:", error);
        return true; // Se a IA falhar, não trava a vela do usuário
    }
}

// Sobrescreve suavemente o clique do botão sem destruir o HTML
document.addEventListener("DOMContentLoaded", () => {
    const btnAcao = document.getElementById("btn-acao");
    
    if (btnAcao) {
        // Guarda a função original acenderVela()
        const funcaoOriginal = window.acenderVela;

        // Intercepta a chamada para validar com a IA antes
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

            // Se for respeitoso, executa a função original do index.html
            funcaoOriginal();
        };
    }
});
