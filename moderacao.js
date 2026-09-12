// Lista expandida de palavras e expressões restritas
const palavrasProibidas = [
    "aidética", "aidético", "aleijada", "aleijado", "anã", "analfabeta", "analfabeto", "anão", "anus", 
    "apenada", "apenado", "arrombado", "babaca", "baba-ovo", "babaovo", "bacura", "bagos", "baianada", 
    "baitola", "bárbaro", "barbeiro", "barraco", "beata", "bêbado", "bêbedo", "bebum", "besta", "bicha", 
    "bisca", "bixa", "boazuda", "boçal", "boceta", "boco", "boiola", "bokete", "bolagato", "bolcat", 
    "boquete", "bosseta", "bosta", "bostana", "branquelo", "brecha", "brexa", "brioco", "bronha", "buca", 
    "buceta", "bugre", "bunda", "bunduda", "burra", "burro", "busseta", "caceta", "cacete", "cachorra", 
    "cachorro", "cadela", "caga", "cagado", "cagao", "cagão", "cagona", "caipira", "canalha", "canceroso", 
    "caralho", "casseta", "cassete", "ceguinho", "checheca", "chereca", "chibumba", "chibumbo", "chifruda", 
    "chifrudo", "chochota", "chota", "chupada", "chupado", "ciganos", "clitoris", "clitóris", "cocaina", 
    "cocaína", "coco", "cocô", "comunista", "corna", "cornagem", "cornão", "cornisse", "corno", "cornuda", 
    "cornudo", "corrupta", "corrupto", "coxo", "cretina", "cretino", "criolo", "crioulo", "cruz-credo", 
    "cu", "cú", "culhao", "culhão", "curalho", "cuzao", "cuzão", "cuzuda", "cuzudo", "debil", "débil", 
    "debiloide", "debilóide", "deficiente", "defunto", "demonio", "demônio", "denegrir", "denigrir", 
    "detento", "difunto", "doida", "doido", "egua", "égua", "elemento", "encostado", "esclerosado", 
    "escrota", "escroto", "esporrada", "esporrado", "esporro", "estupida", "estúpida", "estupidez", 
    "estupido", "estúpido", "facista", "fanatico", "fanático", "fascista", "fedida", "fedido", "fedor", 
    "fedorenta", "feia", "feio", "feiosa", "feioso", "feioza", "feiozo", "felacao", "felação", "fenda", 
    "foda", "fodao", "fodão", "fode", "fodi", "fodida", "fodido", "fornica", "fornição", "fudeção", 
    "fudendo", "fudida", "fudido", "furada", "furado", "furão", "furnica", "furnicar", "furo", "furona", 
    "gai", "gaiata", "gaiato", "gay", "gilete", "goianada", "gonorrea", "gonorreia", "gonorréia", 
    "gosmenta", "gosmento", "grelinho", "grelo", "gringo", "homo-sexual", "homosexual", "homosexualismo", 
    "homossexual", "homossexualismo", "idiota", "idiotice", "imbecil", "inculto", "iscrota", "iscroto", 
    "japa", "judiar", "ladra", "ladrao", "ladrão", "ladroeira", "ladrona", "lalau", "lazarento", "leprosa", 
    "leproso", "lesbica", "lésbica", "louco", "macaca", "macaco", "machona", "macumbeiro", "malandro", 
    "maluco", "maneta", "marginal", "masturba", "meleca", "meliante", "merda", "mija", "mijada", "mijado", 
    "mijo", "minorias", "mocrea", "mocreia", "mocréia", "moleca", "moleque", "mondronga", "mondrongo", 
    "mongol", "mongoloide", "mongolóide", "mulata", "mulato", "naba", "nadega", "nádega", "nazista", 
    "negro", "nhaca", "nojeira", "nojenta", "nojento", "nojo", "olhota", "otaria", "otária", "otario", 
    "otário", "paca", "palhaco", "palhaço", "paspalha", "paspalhao", "paspalho", "pau", "peão", "peia", 
    "peido", "pemba", "penis", "pênis", "pentelha", "pentelho", "perereca", "perneta", "peru", "pica", 
    "picao", "picão", "pilantra", "pinel", "pintão", "pinto", "pintudo", "piranha", "piroca", "piroco", 
    "piru", "pivete", "porra", "prega", "prequito", "preso", "priquito", "prostibulo", "prostituta", 
    "prostituto", "punheta", "punhetao", "punhetão", "pus", "pustula", "puta", "puto", "puxa-saco", 
    "puxasaco", "rabao", "rabão", "rabo", "rabuda", "rabudao", "rabudão", "rabudo", "rabudona", "racha", 
    "rachada", "rachadao", "rachadinha", "rachadinho", "rachado", "ramela", "remela", "retardada", 
    "retardado", "ridícula", "roceiro", "rola", "rolinha", "rosca", "sacana", "safada", "safado", 
    "sapatao", "sapatão", "sifilis", "sífilis", "siririca", "tarada", "tarado", "testuda", "tesuda", 
    "tesudo", "tezao", "tezuda", "tezudo", "traveco", "trocha", "trolha", "troucha", "trouxa", "troxa", 
    "tuberculoso", "tupiniquim", "turco", "vaca", "vadia", "vagabunda", "vagabundo", "vagal", "vagina", 
    "veada", "veadao", "veado", "viada", "viadagem", "viadao", "viadão", "viado", "víado", "xana", 
    "xaninha", "xavasca", "xerereca", "xexeca", "xibiu", "xibumba", "xiíta", "xochota", "xota", "xoxota"
];

// Função de validação inteligente (normaliza acentos e previne falsos positivos)
async function validarTexto(texto) {
    if (!texto || texto.trim() === "") return true;

    // Remove acentos e converte para minúsculo para comparação uniforme
    const textoLimpo = texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // Separa o texto em palavras individuais para checar termos muito curtos (ex: "cu", "pau")
    const palavrasTexto = textoLimpo.split(/\s+|[.,!?;:]+/);

    const contemPalavrao = palavrasProibidas.some(palavra => {
        const palavraNormalizada = palavra.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        // Termos de até 3 letras exigem correspondência exata de palavra (evita bloquear "desculpa" por causa de "cu")
        if (palavraNormalizada.length <= 3) {
            return palavrasTexto.includes(palavraNormalizada);
        }
        
        // Termos maiores checam se estão contidos no texto
        return textoLimpo.includes(palavraNormalizada);
    });

    if (contemPalavrao) {
        console.log("🛑 Bloqueado pelo filtro local.");
        return false;
    }

    return true; 
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

            await new Promise(resolve => setTimeout(resolve, 400));

            const eRespeitoso = await validarTexto(textoCompleto);

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
