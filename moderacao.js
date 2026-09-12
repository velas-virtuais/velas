async function validarTextoComTexto(texto) {
    const workerURL = "https://tight-dream-bc5b.joaodelrei29.workers.dev";

    try {
        const response = await fetch(workerURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text: texto })
        });

        if (!response.ok) {
            throw new Error("Erro na comunicação com o Worker");
        }

        const data = await response.json();
        // Retorna verdadeiro se a IA detectar conteúdo impróprio (flagged ou unsafe)
        return data.flagged === true || data.unsafe === true;
    } catch (err) {
        console.error("Erro na moderação:", err);
        return false; // Se houver falha técnica na API, não trava o site do usuário
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const btnAcao = document.getElementById("btn-acao");

    if (btnAcao) {
        window.acenderVela = async function () {
            const nomeElement = document.getElementById("nome");
            const intencaoElement = document.getElementById("intencao");
            const textoComentario = document.getElementById("comentario"); // ajuste para o ID correto do seu campo de texto da prece

            const nome = nomeElement ? nomeElement.value.trim() : "";
            const intencao = intencaoElement ? intencaoElement.value : "";
            const texto = textoComentario ? textoComentario.value.trim() : "";

            if (!texto) {
                alert("Por favor, escreva a sua prece ou pensamento.");
                return;
            }

            btnAcao.disabled = true;
            btnAcao.innerText = "Verificando intenção...";

            // Valida o texto diretamente na IA do Cloudflare/OpenAI
            const ehImproprio = await validarTextoComTexto(texto);

            if (ehImproprio) {
                btnAcao.disabled = false;
                btnAcao.innerText = "Acender Esta Vela";
                alert("Sua mensagem contém termos ofensivos ou inadequados e não pode ser publicada para manter a harmonia do santuário.");
                return;
            }

            // Se passou pela moderação, continua o código normal de salvar no Firebase...
            try {
                // ... seu código que adiciona a vela no banco de dados ...
                alert("Sua vela foi acesa no mural!");
            } catch (erro) {
                console.error("Erro ao salvar:", erro);
                alert("Erro ao acender a vela.");
            } finally {
                btnAcao.disabled = false;
                btnAcao.innerText = "Acender Esta Vela";
            }
        };
    }
});
