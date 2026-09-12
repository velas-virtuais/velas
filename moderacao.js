/**
 * Moderação local (sem API, sem custo) para o Vela Virtual.
 * ------------------------------------------------------------
 * 1. normalizar(texto): remove acentos, "leetspeak" (p0rr4, c@ralho),
 *    espaçamento entre letras (p a l a v r a) e repetição de letras
 *    (caaaralho -> caralho).
 * 2. Um autômato Aho-Corasick faz a busca de TODAS as palavras da
 *    lista em UMA ÚNICA passada pelo texto (rápido mesmo com listas
 *    grandes, ao contrário de rodar .includes() palavra por palavra).
 * 3. validarTexto(texto) devolve { flagged, termo } — pronto pra
 *    plugar no lugar da chamada ao Worker em acenderVela().
 */

// ---------- 1. Lista de termos bloqueados ----------
// Ajuste/expanda livremente. Use sempre a forma "raiz" (sem acento,
// minúscula) — a normalização cuida das variações.
const TERMOS_BLOQUEADOS = [
  // Baixo calão / vulgaridades gerais
  "porra", "caralho", "merda", "bosta", "cacete", "cassete", "carai",
  "fdp", "pqp", "krl", "kct", "vsf", "vtnc", "tnc", "vtmnc", "vsfd",
  "arrombado", "arrombada", "desgracado", "desgracada", "cuzao", "cuzona",
  "cacete", "porcaria", "droga",
  // Sexual / xingamentos com conotação sexual
  "puta", "putaria", "putinha", "vagabunda", "vagabundo", "piranha",
  "vadia", "safada", "safado", "punheta", "pau no cu", "pau no seu cu",
  "vai se fuder", "vai se foder", "vai tomar no cu", "vai a merda",
  "toma no cu", "chupa", "chupador", "meu pau", "seu cu", "no seu cu",
  "buceta", "xoxota", "pentelho", "corno", "corna", "cornao", "chifrudo",
  "pau duro", "trisca", "boquete",
  // Escatológico
  "bosta", "cocô", "cagar", "cagao", "cagona", "peido", "peidar",
  // Xingamentos / ofensas pessoais e capacitismo
  "idiota", "imbecil", "estupido", "estupida", "retardado", "retardada",
  "mongoloide", "debil mental", "burro demais", "burra demais",
  "otario", "otaria", "babaca", "escroto", "escrota", "verme",
  "lixo humano", "inutil", "cretino", "cretina", "energumeno",
  "trouxa", "panaca", "molambo", "aberracao", "monstro",
  // Ameaças / incitação à violência
  "morre", "morra", "vou te matar", "quero te matar", "vou te achar",
  "vou te machucar", "voce vai morrer", "se mata", "se mate",
  "va se matar", "deveria morrer",
  // Ódio / discriminação (raça, orientação sexual, religião, etc.)
  "macaco", "macaca", "crioulo", "criola", "negro fedido", "negra fedida",
  "viado", "veado", "bicha", "biba", "sapatao", "sapatilha", "traveco",
  "boiola", "gayzao", "nazista", "hitler tinha razao", "judeu safado",
  "cigano ladrao", "japa metido", "china virus", "terrorista muçulmano",
  "seita do capeta", "macumbeiro nojento", "crente hipocrita",
  // Assédio / conteúdo predatório (bloqueio preventivo)
  "manda nudes", "me manda foto pelada", "quero ver voce pelada",
  "menor gostosa", "adolescente gostosa",
  // Spam / abuso do formulário (palavras — padrões de URL vão à parte)
  "clique aqui", "compre agora", "promocao imperdivel", "ganhe dinheiro",
  "whatsapp:", "chama no zap", "chama no privado",
];

// ---------- 2. Normalização ----------
const MAPA_LEET = {
  "0": "o", "1": "i", "3": "e", "4": "a", "5": "s",
  "7": "t", "8": "b", "@": "a", "$": "s", "!": "i",
};

function normalizar(texto) {
  let t = texto.toLowerCase();

  // remove acentos (café -> cafe)
  t = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // decodifica leetspeak (c@r4lh0 -> caralho)
  t = t.replace(/[013457896@$!]/g, (ch) => MAPA_LEET[ch] ?? ch);

  // colapsa letras repetidas 3+ vezes (caaaaralho -> caralho)
  t = t.replace(/([a-z])\1{2,}/g, "$1");

  // versão "compacta": remove espaços/pontuação, útil para pegar
  // tentativas de burlar o filtro tipo "p o r r a" ou "p.o.r.r.a"
  const compacta = t.replace(/[^a-z]/g, "");

  return { espacada: t, compacta };
}

// ---------- 3. Autômato Aho-Corasick ----------
class NoTrie {
  constructor() {
    this.filhos = new Map();
    this.falha = null;
    this.saida = []; // termos que terminam neste nó
  }
}

class AhoCorasick {
  constructor(termos) {
    this.raiz = new NoTrie();
    for (const termo of termos) this._inserir(termo);
    this._construirFalhas();
  }

  _inserir(termo) {
    let no = this.raiz;
    for (const ch of termo) {
      if (!no.filhos.has(ch)) no.filhos.set(ch, new NoTrie());
      no = no.filhos.get(ch);
    }
    no.saida.push(termo);
  }

  _construirFalhas() {
    const fila = [];
    for (const filho of this.raiz.filhos.values()) {
      filho.falha = this.raiz;
      fila.push(filho);
    }
    while (fila.length) {
      const atual = fila.shift();
      for (const [ch, filho] of atual.filhos) {
        let f = atual.falha;
        while (f && !f.filhos.has(ch)) f = f.falha;
        filho.falha = f ? f.filhos.get(ch) : this.raiz;
        filho.saida = filho.saida.concat(filho.falha.saida);
        fila.push(filho);
      }
    }
  }

  // devolve o primeiro termo encontrado, ou null
  buscar(texto) {
    let no = this.raiz;
    for (const ch of texto) {
      while (no && !no.filhos.has(ch)) no = no.falha;
      no = no ? no.filhos.get(ch) : this.raiz;
      if (no.saida.length) return no.saida[0];
    }
    return null;
  }
}

const automato = new AhoCorasick(
  TERMOS_BLOQUEADOS.map((t) => normalizar(t).compacta)
);
// para termos com espaço (ex.: "vai se fuder") mantemos uma checagem
// extra na versão "espaçada", já que a compacta perde a separação
const automatoComEspaco = new AhoCorasick(
  TERMOS_BLOQUEADOS.filter((t) => t.includes(" ")).map((t) => normalizar(t).espacada)
);

// ---------- 4. Função pública ----------
/**
 * @param {string} texto - texto digitado pelo usuário (prece, nome etc.)
 * @returns {{flagged: boolean, termo: string|null}}
 */
// Links/URLs são tratados à parte por regex (não entram na lista de
// palavras porque padrões como "www." colapsariam com a regra de
// letra repetida e causariam falso positivo)
const REGEX_LINK = /(https?:\/\/|www\.|bit\.ly|wa\.me|t\.me)/i;

function validarTexto(texto) {
  if (!texto || !texto.trim()) return { flagged: false, termo: null };

  if (REGEX_LINK.test(texto)) {
    return { flagged: true, termo: "link/url" };
  }

  const { espacada, compacta } = normalizar(texto);

  const achadoCompacto = automato.buscar(compacta);
  if (achadoCompacto) return { flagged: true, termo: achadoCompacto };

  const achadoEspacado = automatoComEspaco.buscar(espacada);
  if (achadoEspacado) return { flagged: true, termo: achadoEspacado };

  return { flagged: false, termo: null };
}

// Disponibiliza globalmente para uso no index.html
window.validarTexto = validarTexto;
