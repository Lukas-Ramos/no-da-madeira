/* =====================================================================
   Funcionamento do site. Não precisa mexer aqui para trocar textos,
   preços ou fotos: isso fica em js/configuracao.js
   ===================================================================== */

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const linkZap = (msg) => `https://wa.me/${LOJA.whatsapp}?text=${encodeURIComponent(msg)}`;
const reais = (v) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const semMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;
const coresDe = (nome) => (MADEIRAS.find((m) => m.nome === nome) || MADEIRAS[0]).cores;

/* ---------- Desenhos de madeira (aparecem enquanto não há foto) ---------- */

// Gerador de números "aleatórios" que sempre dá o mesmo resultado para a mesma semente
function sorteio(semente) {
  let s = semente * 9301 + 49297;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
}

// Veio visto de lado: linhas onduladas
function linhasVeio(cores, semente, w, h) {
  const r = sorteio(semente);
  let linhas = "";
  for (let y = -10; y < h + 20; y += 7 + r() * 9) {
    const a = 4 + r() * 10, f = 0.006 + r() * 0.01, fase = r() * 6;
    let d = `M0 ${y}`;
    for (let x = 0; x <= w; x += 20) d += ` L${x} ${(y + Math.sin(x * f + fase) * a + Math.sin(x * f * 3) * 2).toFixed(1)}`;
    linhas += `<path d="${d}" stroke="${cores[1]}" stroke-opacity="${(0.25 + r() * 0.45).toFixed(2)}" stroke-width="${(0.8 + r() * 2).toFixed(1)}" fill="none"/>`;
  }
  return `<rect width="${w}" height="${h}" fill="${cores[0]}"/>${linhas}`;
}
function veio(cores, semente, w = 400, h = 300) {
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${linhasVeio(cores, semente, w, h)}</svg>`;
}

// Tábua marchetada: madeiras de cores diferentes encaixadas.
// estilo: "losangos", "xadrez" ou "listras" (vem do nome do produto: se tiver "xadrez" ou "listras" no nome)
function marchetaria(estilo, semente, w = 400, h = 300) {
  const claro = coresDe("Freijó"), escuras = [coresDe("Ipê")[0], coresDe("Jatobá")[0]];
  // veio escuro e transparente por cima, para as peças parecerem madeira
  const veioPorCima = `<g opacity=".28">${linhasVeio(["none", "#000"], semente, w, h)}</g>`;
  let desenho = "";

  if (estilo === "xadrez") {
    const lado = 50;
    for (let y = 0, l = 0; y < h; y += lado, l++)
      for (let x = 0, c = 0; x < w; x += lado, c++)
        desenho += `<rect x="${x}" y="${y}" width="${lado}" height="${lado}" fill="${(l + c) % 2 ? escuras[(l >> 1) % 2] : claro[0]}"/>`;
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${desenho}${veioPorCima}</svg>`;
  }

  if (estilo === "listras") {
    // ripas coladas lado a lado, com larguras diferentes
    const madeiras = [claro[0], escuras[0], coresDe("Cumaru")[0], escuras[1], coresDe("Tauari")[0]];
    const larguras = [34, 12, 26, 8, 40, 14, 22, 10, 34, 12, 26, 8, 40];
    for (let y = 0, k = 0; y < h; y += larguras[k % larguras.length], k++)
      desenho += `<rect x="0" y="${y}" width="${w}" height="${larguras[k % larguras.length]}" fill="${madeiras[k % madeiras.length]}"/>`;
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${desenho}${veioPorCima}</svg>`;
  }

  for (let x = 60, k = 0; x <= w - 60; x += 40, k++)
    desenho += `<path d="M${x} ${h / 2 - 24} L${x + 20} ${h / 2} L${x} ${h / 2 + 24} L${x - 20} ${h / 2} Z" fill="${escuras[k % 2]}"/>`;
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    ${linhasVeio(claro, semente, w, h)}
    <rect x="26" y="26" width="${w - 52}" height="${h - 52}" fill="none" stroke="${escuras[0]}" stroke-width="5"/>
    <rect x="36" y="36" width="${w - 72}" height="${h - 72}" fill="none" stroke="${escuras[1]}" stroke-width="2"/>
    <line x1="36" y1="${h / 2 - 30}" x2="${w - 36}" y2="${h / 2 - 30}" stroke="${escuras[0]}" stroke-width="2"/>
    <line x1="36" y1="${h / 2 + 30}" x2="${w - 36}" y2="${h / 2 + 30}" stroke="${escuras[0]}" stroke-width="2"/>
    ${desenho}
  </svg>`;
}
const estiloMarchetaria = (nome) => (/xadrez/i.test(nome) ? "xadrez" : /listra|listrad/i.test(nome) ? "listras" : "losangos");

// Um anel de crescimento: forma fechada levemente irregular
function caminhoAnel(cx, cy, raio, r, irregular = 0.06, forma) {
  const pts = [], n = 64, ond = forma || [r() * 6, r() * 6, r() * 6];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const k = 1 + irregular * (Math.sin(t * 2 + ond[0]) * 0.6 + Math.sin(t * 3 + ond[1]) * 0.3 + Math.sin(t * 5 + ond[2]) * 0.15);
    pts.push([cx + Math.cos(t) * raio * k, cy + Math.sin(t) * raio * k * 0.94]);
  }
  return "M" + pts.map((p) => p.map((v) => v.toFixed(1)).join(" ")).join(" L") + " Z";
}

// Madeira vista de topo: anéis
function topo(cores, semente, w = 400, h = 300) {
  const r = sorteio(semente);
  const forma = [r() * 6, r() * 6, r() * 6];
  let aneis = "";
  for (let raio = 6; raio < 260; raio += 5 + r() * 8)
    aneis += `<path d="${caminhoAnel(w * 0.45, h * 0.55, raio, r, 0.06, forma.map((f) => f + r() * 0.3))}" stroke="${cores[1]}" stroke-opacity="${(0.3 + r() * 0.4).toFixed(2)}" stroke-width="${(1 + r() * 2).toFixed(1)}" fill="none"/>`;
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="${w}" height="${h}" fill="${cores[0]}"/>${aneis}</svg>`;
}

// Foto por cima do desenho. Se a foto não existir, o desenho continua aparecendo.
function comFoto(src, alt, desenho) {
  return `<div class="midia">${desenho}${src ? `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy">` : ""}</div>`;
}
document.addEventListener("error", (e) => {
  if (e.target.matches?.(".midia img")) {
    console.warn("Foto não encontrada. Confira o nome e a pasta:", e.target.getAttribute("src"));
    e.target.remove();
  }
}, true);

/* ---------- Dados gerais ---------- */

document.title = `${LOJA.nome} | Marcenaria artesanal`;
$$("[data-nome-loja]").forEach((el) => (el.textContent = LOJA.nome));
$("[data-selo]").textContent = `FEITO À MÃO ✦ ${LOJA.nome.toUpperCase()} ✦ `;
$("#ano").textContent = new Date().getFullYear();
$("#atendimento").textContent = LOJA.atendimento;
$("#local").textContent = LOJA.local;
if (LOJA.instagram) {
  $("#instagram").href = LOJA.instagram;
  $("#instagram").hidden = false;
}
$$("[data-zap]").forEach((a) => {
  a.href = linkZap(a.dataset.zap);
  a.target = "_blank";
  a.rel = "noopener";
});

/* ---------- Menu no celular ---------- */

const menuBotao = $(".menu-botao"), links = $("#links");
menuBotao.addEventListener("click", () => {
  const aberto = links.classList.toggle("aberto");
  menuBotao.setAttribute("aria-expanded", aberto);
});
links.addEventListener("click", (e) => {
  if (e.target.matches("a")) {
    links.classList.remove("aberto");
    menuBotao.setAttribute("aria-expanded", false);
  }
});

/* ---------- Anéis da abertura ---------- */

(function () {
  const svg = $("#aneis");
  const r = sorteio(7);
  const cx = 205, cy = 196;
  const forma = [r() * 6, r() * 6, r() * 6];
  const partes = [];
  let raio = 5;
  while (raio < 185) {
    partes.push({ d: caminhoAnel(cx, cy, raio, r, 0.035 + raio / 3000, forma.map((f) => f + r() * 0.25)), w: raio > 176 ? 5 : 1 + r() * 2.2 });
    raio += 6 + r() * 10;
  }
  svg.innerHTML =
    `<path d="${caminhoAnel(cx, cy, raio + 2, r, 0.035 + raio / 3000, forma)}" fill="${coresDe("Freijó")[0]}" opacity=".55"/>` +
    partes.map((p) => `<path class="anel" d="${p.d}" stroke-width="${p.w.toFixed(1)}"/>`).join("") +
    `<path class="anel" d="M${cx} ${cy} L${cx + 120} ${cy - 95}" stroke-width="1.4" style="stroke:#6E5A48"/>`;
  $$(".anel", svg).forEach((el, k) => {
    el.style.setProperty("--len", Math.ceil(el.getTotalLength()));
    el.style.setProperty("--d", `${k * 0.07}s`);
  });
})();

/* ---------- Catálogo ---------- */

// Tipos que têm seção própria não aparecem na grade geral
const SECOES_PROPRIAS = { "Tábuas": "#grade-tabuas", "Utensílios": "#grade-utensilios" };
const pareceTopo = (nome) => /topo|cumbuca|gamela/i.test(nome);

function cartaoPeca(p, i) {
  const cores = coresDe(p.madeira);
  const desenho = /marchet/i.test(p.nome) ? marchetaria(estiloMarchetaria(p.nome), i + 3) : pareceTopo(p.nome) ? topo(cores, i + 3) : veio(cores, i + 3);
  const msg = `Olá! Tenho interesse na peça "${p.nome}" (a partir de ${reais(p.preco)}). Pode me passar mais detalhes?`;
  return `
  <article class="peca">
    ${comFoto(p.foto, p.nome, desenho)}
    <h3>${esc(p.nome)}</h3>
    <p>${esc(p.texto)} Em ${esc(String(p.madeira).toLowerCase())}.</p>
    <div class="rodape">
      <span class="preco"><small>a partir de</small>${reais(p.preco)}</span>
      <a class="btn btn-zap" target="_blank" rel="noopener" href="${linkZap(msg)}">
        <svg aria-hidden="true"><use href="#i-zap"/></svg>Pedir
      </a>
    </div>
  </article>`;
}

const grade = $("#grade"), filtros = $(".filtros");
const geral = PRODUTOS.map((p, i) => ({ p, i })).filter(({ p }) => !SECOES_PROPRIAS[p.tipo]);
const tipos = ["Tudo", ...new Set(geral.map(({ p }) => p.tipo))];

function mostrarPecas(tipo) {
  grade.innerHTML = geral.filter(({ p }) => tipo === "Tudo" || p.tipo === tipo).map(({ p, i }) => cartaoPeca(p, i)).join("");
  $$("button", filtros).forEach((b) => b.setAttribute("aria-pressed", b.textContent === tipo));
}
filtros.innerHTML = tipos.map((t) => `<button type="button">${esc(t)}</button>`).join("");
filtros.addEventListener("click", (e) => { if (e.target.matches("button")) mostrarPecas(e.target.textContent); });
mostrarPecas("Tudo");

for (const [tipo, alvo] of Object.entries(SECOES_PROPRIAS)) {
  $(alvo).innerHTML = PRODUTOS.map((p, i) => ({ p, i })).filter(({ p }) => p.tipo === tipo).map(({ p, i }) => cartaoPeca(p, i)).join("");
}

/* ---------- Tábua de topo: passe a faca ---------- */

const SVG_NS = "http://www.w3.org/2000/svg";
const tabuaSvg = $("#tabua-demo");
const TABUA = { x: 34, y: 24, lado: 56, cols: 6, linhas: 4 };
TABUA.w = TABUA.lado * TABUA.cols;
TABUA.h = TABUA.lado * TABUA.linhas;

(function montarTabua() {
  const { x, y, lado, cols, linhas, w, h } = TABUA;
  const r = sorteio(11);
  const claro = coresDe("Freijó"), escuro = coresDe("Ipê");
  let defs = `<clipPath id="tabua-borda"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10"/></clipPath>`;
  let blocos = "", emendas = "";
  for (let l = 0; l < linhas; l++) {
    for (let c = 0; c < cols; c++) {
      const bx = x + c * lado, by = y + l * lado, cor = (l + c) % 2 ? escuro : claro;
      defs += `<clipPath id="bloco-${l}-${c}"><rect x="${bx}" y="${by}" width="${lado}" height="${lado}"/></clipPath>`;
      // o centro do tronco fica fora do bloco, então só aparecem arcos dos anéis
      const cx = bx + lado * (r() * 1.8 - 0.4);
      const cy = by + lado * (r() < 0.5 ? -0.4 - r() * 0.6 : 1.4 + r() * 0.6);
      let aneis = "";
      for (let raio = 4; raio < lado * 2.8; raio += 3 + r() * 4)
        aneis += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${raio.toFixed(1)}" fill="none" stroke="${cor[1]}" stroke-opacity="${(0.3 + r() * 0.35).toFixed(2)}" stroke-width="${(0.7 + r()).toFixed(1)}"/>`;
      blocos += `<g clip-path="url(#bloco-${l}-${c})"><rect x="${bx}" y="${by}" width="${lado}" height="${lado}" fill="${cor[0]}"/>${aneis}</g>`;
    }
  }
  for (let c = 1; c < cols; c++) emendas += `<line x1="${x + c * lado}" y1="${y}" x2="${x + c * lado}" y2="${y + h}"/>`;
  for (let l = 1; l < linhas; l++) emendas += `<line x1="${x}" y1="${y + l * lado}" x2="${x + w}" y2="${y + l * lado}"/>`;

  tabuaSvg.innerHTML = `
    <defs>${defs}</defs>
    <ellipse cx="${x + w / 2}" cy="${y + h + 24}" rx="${w / 2 + 6}" ry="10" fill="#2B1D14" opacity=".14"/>
    <rect x="${x}" y="${y + 12}" width="${w}" height="${h + 6}" rx="10" fill="#4A3322"/>
    <g clip-path="url(#tabua-borda)">${blocos}<g stroke="#000" stroke-opacity=".14" stroke-width="1">${emendas}</g></g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="none" stroke="#2B1D14" stroke-opacity=".35"/>
    <g class="cortes" clip-path="url(#tabua-borda)"></g>
    <g class="faca" opacity="0">
      <path d="M0 0 C-30 -4 -80 -13 -112 -13 L-112 4 C-72 4 -30 3 0 0 Z" fill="#CDD2D5" stroke="#7D858A" stroke-width="1"/>
      <path d="M-112 -1 C-80 -3 -40 -2 -6 0" stroke="#fff" stroke-opacity=".6" stroke-width="1" fill="none"/>
      <rect x="-176" y="-14" width="66" height="19" rx="6" fill="#4E3522"/>
      <circle cx="-160" cy="-4.5" r="2.2" fill="#CDD2D5"/><circle cx="-128" cy="-4.5" r="2.2" fill="#CDD2D5"/>
    </g>`;
})();

const cortesEl = $(".cortes", tabuaSvg), facaEl = $(".faca", tabuaSvg);

function pontoSvg(e) {
  return new DOMPoint(e.clientX, e.clientY).matrixTransform(tabuaSvg.getScreenCTM().inverse());
}
function dentroDaTabua(p) {
  return p.x > TABUA.x && p.x < TABUA.x + TABUA.w && p.y > TABUA.y && p.y < TABUA.y + TABUA.h;
}
function novoCorte() {
  const el = document.createElementNS(SVG_NS, "path");
  el.setAttribute("class", "corte");
  cortesEl.append(el);
  return el;
}
function fecharCorte(el) {
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("fecha")));
  setTimeout(() => el.remove(), 3000);
}

// A pessoa corta arrastando
let corte = null, pontos = [];
tabuaSvg.addEventListener("pointerdown", (e) => {
  const p = pontoSvg(e);
  if (!dentroDaTabua(p)) return;
  corte = novoCorte();
  pontos = [p];
  tabuaSvg.setPointerCapture(e.pointerId);
});
tabuaSvg.addEventListener("pointermove", (e) => {
  if (!corte) return;
  const p = pontoSvg(e), u = pontos[pontos.length - 1];
  if (Math.hypot(p.x - u.x, p.y - u.y) < 3) return;
  pontos.push(p);
  corte.setAttribute("d", "M" + pontos.map((q) => `${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(" L"));
});
const terminarCorte = () => { if (corte) { fecharCorte(corte); corte = null; } };
tabuaSvg.addEventListener("pointerup", terminarCorte);
tabuaSvg.addEventListener("pointercancel", terminarCorte);

// Ajudantes de animação
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const suave = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
function animar(duracao, cada) {
  return new Promise((fim) => {
    const inicio = performance.now();
    (function passo(agora) {
      const t = Math.min((agora - inicio) / duracao, 1);
      cada(suave(t));
      t < 1 ? requestAnimationFrame(passo) : fim();
    })(inicio);
  });
}
const posicionar = (el, x, y, ang) => el.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang})`);

// A tábua em uso: uma picanha é fatiada, as fatias se separam e saem
const BIFE = "M104 128 C104 92 150 80 204 82 C258 84 300 96 298 132 C296 168 262 190 204 190 C146 190 104 170 104 128 Z";
const CORTES_BIFE = [142, 172, 202, 232, 262];
const bifeEl = document.createElementNS(SVG_NS, "g");
bifeEl.setAttribute("class", "bife");
bifeEl.style.opacity = 0;
(function montarBife() {
  const faixas = [104, ...CORTES_BIFE, 300];
  let defs = `<clipPath id="bife-forma"><path d="${BIFE}"/></clipPath>
    <g id="bife-desenho">
      <path d="${BIFE}" fill="#A53B2E"/>
      <g clip-path="url(#bife-forma)">
        <path d="M100 70 C150 104 250 104 304 72 L304 60 L100 60 Z" fill="#F1E2C4"/>
        <path d="M100 99 C150 112 250 112 304 98" stroke="#E7C9A4" stroke-width="3" fill="none"/>
        <path d="M130 140 C160 132 180 150 210 142 M160 165 C190 158 220 172 250 160 M230 125 C250 120 262 132 280 128" stroke="#D98A7A" stroke-opacity=".6" stroke-width="2" fill="none"/>
      </g>
      <path d="${BIFE}" fill="none" stroke="#7A2A20" stroke-width="1.5"/>
    </g>`;
  let fatias = "";
  for (let k = 0; k < faixas.length - 1; k++) {
    defs += `<clipPath id="fatia-${k}"><rect x="${faixas[k]}" y="60" width="${faixas[k + 1] - faixas[k]}" height="150"/></clipPath>`;
    fatias += `<g class="fatia"><g clip-path="url(#fatia-${k})"><use href="#bife-desenho"/></g></g>`;
  }
  bifeEl.innerHTML = `<defs>${defs}</defs><ellipse cx="204" cy="194" rx="100" ry="8" fill="#2B1D14" opacity=".15"/>${fatias}`;
  tabuaSvg.insertBefore(bifeEl, facaEl);
})();

let tabuaNaTela = false, tabuaRodando = false;
async function usarTabua() {
  if (tabuaRodando || semMovimento) return;
  tabuaRodando = true;
  const fatias = $$(".fatia", bifeEl);
  while (tabuaNaTela) {
    // a carne chega na tábua
    fatias.forEach((f) => (f.style.transform = ""));
    await animar(500, (s) => { bifeEl.style.opacity = s; bifeEl.style.transform = `translate(${(-40 * (1 - s)).toFixed(1)}px, 0)`; });
    await espera(300);
    facaEl.setAttribute("opacity", 1);
    const marcas = [];
    for (let k = 0; k < CORTES_BIFE.length; k++) {
      const x = CORTES_BIFE[k] + k * 5;
      const marca = novoCorte();
      marcas.push(marca);
      await animar(160, (s) => posicionar(facaEl, x, 40 + 20 * s, 90));
      await animar(380, (s) => {
        const y = 60 + 160 * s;
        posicionar(facaEl, x, y, 90);
        marca.setAttribute("d", `M${x} 64 L${x} ${y.toFixed(1)}`);
      });
      // as fatias da direita se afastam um pouco
      fatias.forEach((f, i) => { if (i > k) f.style.transform = `translate(${(k + 1) * 5}px, 0)`; });
      await animar(160, (s) => posicionar(facaEl, x, 220 - 180 * s, 90));
    }
    facaEl.setAttribute("opacity", 0);
    await espera(700);
    // as fatias vão para o prato e as marcas da faca se fecham
    await animar(600, (s) => { bifeEl.style.opacity = 1 - s; bifeEl.style.transform = `translate(${(60 * s).toFixed(1)}px, 0)`; });
    marcas.forEach(fecharCorte);
    await espera(2600);
  }
  tabuaRodando = false;
}
new IntersectionObserver(([e]) => {
  tabuaNaTela = e.isIntersecting;
  if (tabuaNaTela) setTimeout(usarTabua, 400);
}, { threshold: 0.5 }).observe(tabuaSvg);

/* ---------- Carrossel de peças entalhadas com formão ---------- */

// Cada peça: a forma final, o bloco de onde ela sai e os detalhes que aparecem no fim.
const PECAS_ENTALHE = [
  {
    nome: "Colher", madeira: "Cumaru",
    bloco: { x: 44, y: 98, w: 324, h: 106 },
    forma: "M60 150 C60 118 90 108 122 108 C160 108 178 132 192 141 C232 145 300 139 346 143 C358 144 359 157 346 158 C300 161 232 156 192 159 C178 168 160 192 122 192 C90 192 60 182 60 150 Z",
    sombra: { cy: 212, rx: 140 },
    detalhes: (c) => `
      <ellipse cx="120" cy="150" rx="46" ry="30" fill="url(#concha)"/>
      <path d="M200 147 C250 148 300 146 340 147" stroke="#fff" stroke-opacity=".3" stroke-width="1.4" fill="none"/>`,
  },
  {
    nome: "Gamela", madeira: "Jatobá",
    bloco: { x: 72, y: 98, w: 268, h: 108 },
    forma: "M84 152 C84 118 140 106 206 106 C272 106 328 118 328 152 C328 186 272 198 206 198 C140 198 84 186 84 152 Z",
    sombra: { cy: 210, rx: 126 },
    detalhes: (c) => `
      <ellipse cx="206" cy="152" rx="104" ry="32" fill="url(#concha)"/>
      <ellipse cx="206" cy="152" rx="108" ry="36" fill="none" stroke="${c[1]}" stroke-opacity=".6" stroke-width="1.2"/>`,
  },
  {
    nome: "Cumbuca", madeira: "Freijó",
    bloco: { x: 100, y: 94, w: 212, h: 112 },
    forma: "M112 112 A94 12 0 0 1 300 112 C300 160 262 196 206 196 C150 196 112 160 112 112 Z",
    sombra: { cy: 204, rx: 92 },
    detalhes: (c) => `
      <ellipse cx="206" cy="112" rx="88" ry="9" fill="#2B1D14" opacity=".35"/>
      <path d="M128 132 C134 162 160 184 192 190" stroke="#fff" stroke-opacity=".3" stroke-width="2" fill="none"/>
      <path d="M182 195 H230" stroke="${c[1]}" stroke-width="2"/>`,
  },
  {
    nome: "Copinho", madeira: "Ipê",
    bloco: { x: 150, y: 92, w: 132, h: 112 },
    forma: "M170 104 A36 7 0 0 1 242 104 L236 190 C236 197 176 197 176 190 Z",
    alca: "M240 122 C268 122 270 170 238 170",
    sombra: { cy: 202, rx: 46 },
    detalhes: (c) => `
      <ellipse cx="206" cy="104" rx="32" ry="5.5" fill="#2B1D14" opacity=".4"/>
      <path d="M173 128 H239 M176 172 H236" stroke="${c[1]}" stroke-width="1.6" fill="none"/>
      <path d="M182 110 L184 186" stroke="#fff" stroke-opacity=".25" stroke-width="3" fill="none"/>`,
  },
];

const colherSvg = $("#colher-demo"), abasEntalhe = $("#abas-entalhe");
let formaoEl, aparasColher;

// Espessuras (em volta da forma) que sobram depois de cada passada do formão.
// A primeira passada desbasta o bloco de uma ponta à outra; as outras contornam a peça.
const PASSADAS = [null, 84, 46, 22, 8, 0];

function desenharPeca(p) {
  const c = coresDe(p.madeira), b = p.bloco;
  const alca = (largura, extra = "") => (p.alca ? `<path d="${p.alca}" fill="none" stroke="#fff" stroke-width="${9 + largura}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>` : "");

  colherSvg.setAttribute("aria-label", `Animação: ${p.nome.toLowerCase()} sendo entalhada com formão a partir de um bloco de madeira`);
  colherSvg.innerHTML = `
    <defs>
      <pattern id="veio-entalhe" patternUnits="userSpaceOnUse" width="400" height="300">${linhasVeio(c, 9, 400, 300)}</pattern>
      <clipPath id="bloco-clip"><rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="3"/></clipPath>
      <clipPath id="forma-clip"><path d="${p.forma}"/>${p.alca ? `<path d="${p.alca}" fill="none"/>` : ""}</clipPath>
      <mask id="entalhe-mascara" maskUnits="userSpaceOnUse" x="0" y="0" width="400" height="300">
        <rect class="m-bloco" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="#fff"/>
        <path class="m-nova" d="${p.forma}" fill="#fff" stroke="#fff" stroke-width="${PASSADAS[1]}" stroke-linejoin="round"/>
        <path class="m-velha" d="${p.forma}" pathLength="1" fill="none" stroke="#fff" stroke-width="0" stroke-linejoin="round"/>
        <g class="m-alca">${alca(PASSADAS[1])}</g>
      </mask>
      <filter id="sombra-peca" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#2B1D14" flood-opacity=".28"/></filter>
      <radialGradient id="concha" cx=".45" cy=".45"><stop offset="0" stop-color="#2B1D14" stop-opacity=".5"/><stop offset="1" stop-color="#2B1D14" stop-opacity="0"/></radialGradient>
      <linearGradient id="aco" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EEF1F3"/><stop offset=".5" stop-color="#A3AAAF"/><stop offset="1" stop-color="#C9CED1"/></linearGradient>
      <linearGradient id="cabo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A8744A"/><stop offset=".6" stop-color="#7A4E2C"/><stop offset="1" stop-color="#5E3B20"/></linearGradient>
      <linearGradient id="brilho-lixa" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#FFF8E6" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    </defs>
    <path class="guia" d="${p.forma}" fill="none" stroke="none"/>
    <g class="peca-palco">
      <g class="acabamento"><ellipse cx="206" cy="${p.sombra.cy}" rx="${p.sombra.rx}" ry="7" fill="#2B1D14" opacity=".12"/></g>
      <g filter="url(#sombra-peca)">
        <g clip-path="url(#bloco-clip)" mask="url(#entalhe-mascara)">
          <rect width="400" height="300" fill="url(#veio-entalhe)"/>
          <g class="acabamento">
            <rect width="400" height="300" fill="#4A2410" opacity=".16"/>
            ${p.detalhes(c)}
            <path d="${p.forma}" fill="none" stroke="${c[1]}" stroke-width="1.6"/>
          </g>
        </g>
      </g>
      <g clip-path="url(#forma-clip)"><rect class="lixa" x="-140" y="0" width="90" height="300" fill="url(#brilho-lixa)" opacity="0"/></g>
      <g class="aparas-colher"></g>
      <g class="formao" opacity="0">
        <path d="M0 0 L-11 -6.5 H-64 V6 H-1 Z" fill="url(#aco)" stroke="#6F777C" stroke-width=".8"/>
        <path d="M-11 -6.5 L0 0" stroke="#fff" stroke-opacity=".8" stroke-width="1"/>
        <path d="M-60 -2 H-16" stroke="#fff" stroke-opacity=".45" stroke-width="1"/>
        <rect x="-73" y="-7.5" width="10" height="15" rx="2" fill="#B08D57"/>
        <rect x="-73" y="-7.5" width="10" height="4" rx="2" fill="#E1C48E" opacity=".7"/>
        <path d="M-73 -8.5 C-96 -10.5 -128 -10.5 -140 -6.5 C-146 -3 -146 3 -140 6.5 C-128 10.5 -96 10.5 -73 8.5 Z" fill="url(#cabo)"/>
        <path d="M-80 -4.5 C-100 -6 -122 -5.5 -136 -3.5 M-84 3 C-104 4.5 -120 4 -134 2.5" stroke="#4A2E18" stroke-opacity=".45" stroke-width=".9" fill="none"/>
      </g>
    </g>`;
  colherSvg.classList.remove("entalhado");
  formaoEl = $(".formao", colherSvg);
  aparasColher = $(".aparas-colher", colherSvg);
}

// Apara enrolada ou lasca que sai de onde o formão passou
function soltarAparaColher(x, y, nx, ny, cor) {
  const el = document.createElementNS(SVG_NS, "path");
  const lasca = Math.random() < 0.45;
  el.setAttribute("d", lasca
    ? `M${x.toFixed(0)} ${y.toFixed(0)} l7 -3 l-1 6 z`
    : `M${x.toFixed(0)} ${y.toFixed(0)} c4 -8 14 -6 12 2 c-2 6 -9 4 -7 -1`);
  el.setAttribute("class", "apara-voa sai");
  if (lasca) el.setAttribute("fill", "url(#veio-entalhe)");
  else {
    el.setAttribute("fill", "none");
    el.setAttribute("stroke", cor);
    el.setAttribute("stroke-width", "2");
    el.setAttribute("stroke-linecap", "round");
  }
  const forca = 40 + Math.random() * 50;
  el.style.setProperty("--dx", `${(nx * forca + (Math.random() - 0.5) * 30).toFixed(0)}px`);
  el.style.setProperty("--dy", `${(ny * forca - 25 - Math.random() * 25).toFixed(0)}px`);
  el.addEventListener("animationend", () => el.remove());
  aparasColher.append(el);
}

// Em cada passada o formão contorna a peça; atrás dele a madeira fica mais fina.
let vezDoCarrossel = 0;
async function entalhar(minha) {
  const p = PECAS_ENTALHE[pecaAtual], cor = coresDe(p.madeira)[0], b = p.bloco;
  const nova = $(".m-nova", colherSvg), velha = $(".m-velha", colherSvg), mAlca = $(".m-alca", colherSvg), mBloco = $(".m-bloco", colherSvg);
  const guia = $(".guia", colherSvg), total = guia.getTotalLength(), caixa = guia.getBBox();
  const centro = { x: caixa.x + caixa.width / 2, y: caixa.y + caixa.height / 2 };
  const larguraAlca = (w) => $$("path", mAlca).forEach((a) => a.setAttribute("stroke-width", 9 + w));

  if (semMovimento) {
    mBloco.setAttribute("width", 0);
    nova.setAttribute("stroke-width", 0);
    larguraAlca(0);
    return colherSvg.classList.add("entalhado");
  }

  formaoEl.setAttribute("opacity", 1);
  let ultimaApara = 0;

  // 1ª passada: desbaste grosso, da esquerda para a direita, pelo alto do bloco
  await animar(1300, (s) => {
    if (minha !== vezDoCarrossel) return;
    const x = b.x + b.w * s;
    mBloco.setAttribute("x", x.toFixed(1));
    mBloco.setAttribute("width", Math.max(b.x + b.w - x, 0).toFixed(1));
    posicionar(formaoEl, x, b.y + 10 + Math.sin(s * Math.PI * 6) * 4, 24);
    const agora = performance.now();
    if (agora - ultimaApara > 80) { ultimaApara = agora; soltarAparaColher(x, b.y + 6, 0.4, -1, cor); }
  });
  mBloco.setAttribute("width", 0);

  for (let k = 2; k < PASSADAS.length; k++) {
    if (minha !== vezDoCarrossel) return;
    const antes = PASSADAS[k - 1], depois = PASSADAS[k];
    nova.setAttribute("stroke-width", depois);
    larguraAlca(depois);
    velha.setAttribute("stroke-width", Math.min(antes, 260));
    const duracao = k === 1 ? 900 : 760 + k * 40;
    await animar(duracao, (s) => {
      if (minha !== vezDoCarrossel) return;
      // a parte ainda não desbastada fica só à frente do formão
      velha.setAttribute("stroke-dasharray", `0 ${s.toFixed(4)} ${(1 - s).toFixed(4)} 1`);
      const d = s * total, a = guia.getPointAtLength(d), q = guia.getPointAtLength(Math.min(d + 2, total));
      let tx = q.x - a.x, ty = q.y - a.y;
      const n = Math.hypot(tx, ty) || 1; tx /= n; ty /= n;
      let nx = -ty, ny = tx;
      if (nx * (a.x - centro.x) + ny * (a.y - centro.y) < 0) { nx = -nx; ny = -ny; }
      const afasta = depois / 2 + 1.5;
      const x = Math.min(Math.max(a.x + nx * afasta, b.x + 2), b.x + b.w - 2);
      const y = Math.min(Math.max(a.y + ny * afasta, b.y + 2), b.y + b.h - 2);
      // o formão anda junto com o contorno, inclinado para dentro da madeira
      const ang = Math.atan2(ty, tx) * 180 / Math.PI + (nx * -ty + ny * tx > 0 ? -28 : 28);
      posicionar(formaoEl, x, y, ang.toFixed(1));
      const agora = performance.now();
      if (agora - ultimaApara > 95 && antes > 0) { ultimaApara = agora; soltarAparaColher(x, y, nx, ny, cor); }
    });
    velha.setAttribute("stroke-width", 0);
  }
  if (minha !== vezDoCarrossel) return;
  await animar(300, (s) => formaoEl.setAttribute("opacity", 1 - s));
  colherSvg.classList.add("entalhado");
  // acabamento: óleo escurece a madeira e a lixa deixa um brilho passando
  const lixa = $(".lixa", colherSvg);
  await espera(500);
  lixa.setAttribute("opacity", 1);
  await animar(900, (s) => lixa.setAttribute("x", (-140 + 560 * s).toFixed(1)));
  lixa.setAttribute("opacity", 0);
}

let pecaAtual = 0, carrosselAutomatico = !semMovimento, colherNaTela = false, carrosselParado = true;

abasEntalhe.innerHTML = PECAS_ENTALHE.map((p, i) => `<button type="button" data-peca="${i}">${esc(p.nome)}</button>`).join("");

async function irParaPeca(i, { deslizar = true } = {}) {
  const minha = ++vezDoCarrossel;
  carrosselParado = false;
  const anterior = pecaAtual;
  pecaAtual = (i + PECAS_ENTALHE.length) % PECAS_ENTALHE.length;
  $$("button", abasEntalhe).forEach((b, k) => b.setAttribute("aria-pressed", k === pecaAtual));

  const sentido = pecaAtual >= anterior || (anterior === PECAS_ENTALHE.length - 1 && pecaAtual === 0) ? 1 : -1;
  const palco = () => $(".peca-palco", colherSvg);
  if (deslizar && !semMovimento && palco()) {
    await animar(280, (s) => { palco().style.opacity = 1 - s; palco().style.transform = `translate(${(-60 * sentido * s).toFixed(1)}px, 0)`; });
    if (minha !== vezDoCarrossel) return;
  }
  desenharPeca(PECAS_ENTALHE[pecaAtual]);
  if (deslizar && !semMovimento) {
    await animar(320, (s) => { palco().style.opacity = s; palco().style.transform = `translate(${(60 * sentido * (1 - s)).toFixed(1)}px, 0)`; });
  }
  if (minha !== vezDoCarrossel) return;
  await espera(250);
  await entalhar(minha);
  if (minha !== vezDoCarrossel) return;

  // passa sozinho para a próxima peça enquanto a pessoa está olhando
  await espera(2600);
  if (minha !== vezDoCarrossel) return;
  if (carrosselAutomatico && colherNaTela) irParaPeca(pecaAtual + 1);
  else carrosselParado = true;
}

// Quem escolhe uma peça assume o controle: o carrossel para de avançar sozinho
const escolher = (i) => { carrosselAutomatico = false; irParaPeca(i); };
abasEntalhe.addEventListener("click", (e) => { const b = e.target.closest("[data-peca]"); if (b) escolher(+b.dataset.peca); });
$("#entalhe-ant").addEventListener("click", () => escolher(pecaAtual - 1));
$("#entalhe-prox").addEventListener("click", () => escolher(pecaAtual + 1));
$("#entalhar").addEventListener("click", () => escolher(pecaAtual));

desenharPeca(PECAS_ENTALHE[0]);
$$("button", abasEntalhe).forEach((b, k) => b.setAttribute("aria-pressed", k === 0));
let carrosselComecou = false;
new IntersectionObserver(([e]) => {
  colherNaTela = e.isIntersecting;
  if (!colherNaTela) return;
  if (!carrosselComecou) { carrosselComecou = true; irParaPeca(0, { deslizar: false }); }
  else if (carrosselParado && carrosselAutomatico) irParaPeca(pecaAtual + 1);
}, { threshold: 0.5 }).observe(colherSvg);

/* ---------- Luminárias ---------- */

// Desenho de cada tipo de luminária. "b" é onde fica a lâmpada (centro do brilho).
function desenhoLuminaria(estilo, cores, id) {
  const [clara, escura] = cores, ferro = "#2E2823";
  const tipos = {
    pendente: {
      b: [200, 190],
      forma: `
        <line x1="200" y1="0" x2="200" y2="96" stroke="#6B5A48" stroke-width="2"/>
        <rect x="190" y="88" width="20" height="10" rx="2" fill="${ferro}"/>
        <path d="M162 97 H238 L276 172 H124 Z" fill="${clara}" stroke="${escura}" stroke-width="2"/>
        <path d="M168 112 Q200 120 232 112 M152 138 Q200 149 248 138 M138 160 Q200 170 262 160" stroke="${escura}" stroke-opacity=".55" fill="none" stroke-width="1.5"/>`,
    },
    mesa: {
      b: [200, 100],
      forma: `
        <ellipse cx="200" cy="272" rx="52" ry="12" fill="${escura}"/>
        <rect x="148" y="152" width="104" height="120" fill="${escura}"/>
        <path d="M152 170 C160 200 150 230 158 268 M246 160 C238 200 250 236 240 268 M196 178 C192 214 204 240 198 270" stroke="#000" stroke-opacity=".25" fill="none" stroke-width="2"/>
        <ellipse cx="200" cy="152" rx="52" ry="13" fill="${clara}"/>
        <ellipse cx="201" cy="152" rx="34" ry="8" fill="none" stroke="${escura}" stroke-opacity=".6"/>
        <ellipse cx="202" cy="152" rx="16" ry="4" fill="none" stroke="${escura}" stroke-opacity=".6"/>
        <rect x="191" y="122" width="18" height="26" rx="2" fill="${ferro}"/>
        <ellipse class="lamp-bulbo" cx="200" cy="100" rx="19" ry="25"/>
        <path class="lamp-fil" d="M193 116 V100 L197 92 L200 100 L203 92 L207 100 V116" fill="none" stroke-width="1.4"/>`,
    },
    arandela: {
      b: [262, 176],
      forma: `
        <path d="M110 34 H172 C166 70 180 110 170 150 C164 190 178 228 172 266 H110 Z" fill="${clara}" stroke="${escura}" stroke-width="2"/>
        <path d="M122 50 C128 110 118 170 126 250 M146 44 C152 120 140 180 150 258" stroke="${escura}" stroke-opacity=".45" fill="none" stroke-width="1.5"/>
        <circle cx="141" cy="112" r="4" fill="${ferro}"/>
        <path d="M150 112 H250 Q262 112 262 124 V140" fill="none" stroke="${ferro}" stroke-width="6" stroke-linecap="round"/>
        <rect x="253" y="138" width="18" height="18" rx="2" fill="${ferro}"/>`,
    },
    toco: {
      b: [200, 126],
      forma: `
        <path d="M150 270 C156 240 154 200 156 170 H244 C246 200 244 240 250 270 C236 264 228 276 214 264 C204 274 194 274 184 264 C172 276 164 264 150 270 Z" fill="${escura}"/>
        <path d="M150 270 C136 272 124 268 112 274 M250 270 C266 272 276 266 290 274 M184 264 C182 272 176 276 168 280" stroke="${escura}" stroke-width="5" stroke-linecap="round" fill="none"/>
        <ellipse cx="200" cy="170" rx="44" ry="11" fill="${clara}"/>
        <ellipse cx="201" cy="170" rx="28" ry="6.5" fill="none" stroke="${escura}" stroke-opacity=".6"/>
        <ellipse cx="202" cy="170" rx="12" ry="3" fill="none" stroke="${escura}" stroke-opacity=".6"/>
        <rect x="191" y="150" width="18" height="18" rx="2" fill="${ferro}"/>
        <path d="M178 150 C172 120 180 98 200 96 C220 98 228 120 222 150 M189 150 C186 120 190 100 200 96 M211 150 C214 120 210 100 200 96" fill="none" stroke="${ferro}" stroke-width="2"/>`,
    },
  };
  const t = tipos[estilo] || tipos.pendente;
  const [bx, by] = t.b;
  const bulbo = estilo === "mesa" ? "" : `
    <circle class="lamp-bulbo" cx="${bx}" cy="${by}" r="17"/>
    <path class="lamp-fil" d="M${bx - 6} ${by + 8} L${bx - 3} ${by - 4} L${bx} ${by + 3} L${bx + 3} ${by - 4} L${bx + 6} ${by + 8}" fill="none" stroke-width="1.4"/>`;
  return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><radialGradient id="luz-${id}">
      <stop offset="0" stop-color="#FFE0A0" stop-opacity=".8"/>
      <stop offset=".3" stop-color="#E3B23C" stop-opacity=".28"/>
      <stop offset="1" stop-color="#E3B23C" stop-opacity="0"/>
    </radialGradient></defs>
    <rect width="400" height="300" fill="#140D08"/>
    <circle class="lamp-brilho" cx="${bx}" cy="${by}" r="190" fill="url(#luz-${id})"/>
    ${t.forma}${bulbo}
  </svg>`;
}

const secaoLuz = $("#luminarias"), interruptor = $("#interruptor");

$("#grade-luz").innerHTML = LUMINARIAS.map((l, i) => {
  const msg = `Olá! Tenho interesse na luminária "${l.nome}" (a partir de ${reais(l.preco)}). Pode me passar mais detalhes?`;
  return `
  <article class="peca" style="--atraso: ${(i * 0.22).toFixed(2)}s">
    ${comFoto(l.foto, l.nome, desenhoLuminaria(l.estilo, coresDe(l.madeira), i))}
    <h3>${esc(l.nome)}</h3>
    <p>${esc(l.texto)} Em ${esc(String(l.madeira).toLowerCase())}.</p>
    <div class="rodape">
      <span class="preco"><small>a partir de</small>${reais(l.preco)}</span>
      <a class="btn btn-zap" target="_blank" rel="noopener" href="${linkZap(msg)}">
        <svg aria-hidden="true"><use href="#i-zap"/></svg>Pedir
      </a>
    </div>
  </article>`;
}).join("");

function luzes(acesas) {
  secaoLuz.classList.toggle("acesas", acesas);
  interruptor.setAttribute("aria-pressed", acesas);
  $(".interruptor-texto", interruptor).textContent = acesas ? "Apagar as luzes" : "Acender as luzes";
}
interruptor.addEventListener("click", () => luzes(!secaoLuz.classList.contains("acesas")));

// Acende sozinho na primeira vez que a pessoa chega na seção
new IntersectionObserver(([e], obs) => {
  if (e.isIntersecting) {
    setTimeout(() => luzes(true), 400);
    obs.disconnect();
  }
}, { threshold: 0.3 }).observe(secaoLuz);

/* ---------- Projetos (galeria + visualizador) ---------- */

const desenhoProjeto = (p, i) => veio(coresDe(p.madeira), i + 40, 600, 450);

$("#galeria").innerHTML = PROJETOS.map((p, i) => {
  const fotos = p.fotos || [];
  return `
  <figure class="projeto">
    <button type="button" class="abrir" data-projeto="${i}" aria-label="Ver fotos: ${esc(p.titulo)}">
      ${comFoto(fotos[0], p.titulo, desenhoProjeto(p, i))}
      ${fotos.length > 1 ? `<span class="qtd">${fotos.length} fotos</span>` : ""}
    </button>
    <figcaption><strong>${esc(p.titulo)}</strong>${p.descricao ? `<span>${esc(p.descricao)}</span>` : ""}</figcaption>
  </figure>`;
}).join("");

const visor = $("#visor");
let aberto = { projeto: 0, foto: 0 };

function mostrarFotoVisor() {
  const p = PROJETOS[aberto.projeto], fotos = p.fotos || [];
  const total = Math.max(fotos.length, 1);
  $("#visor-foto").innerHTML = comFoto(fotos[aberto.foto], `${p.titulo}, foto ${aberto.foto + 1}`, desenhoProjeto(p, aberto.projeto));
  $("#visor-titulo").textContent = p.titulo;
  $("#visor-contagem").textContent = total > 1 ? `${aberto.foto + 1} de ${total}` : "";
  $("#visor-ant").hidden = $("#visor-prox").hidden = total < 2;
}
function passarFoto(passo) {
  const total = Math.max((PROJETOS[aberto.projeto].fotos || []).length, 1);
  aberto.foto = (aberto.foto + passo + total) % total;
  mostrarFotoVisor();
}
$("#galeria").addEventListener("click", (e) => {
  const botao = e.target.closest("[data-projeto]");
  if (!botao) return;
  aberto = { projeto: Number(botao.dataset.projeto), foto: 0 };
  mostrarFotoVisor();
  visor.showModal();
});
$("#visor-ant").addEventListener("click", () => passarFoto(-1));
$("#visor-prox").addEventListener("click", () => passarFoto(1));
$("#visor-fechar").addEventListener("click", () => visor.close());
visor.addEventListener("click", (e) => { if (e.target === visor) visor.close(); });
visor.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") passarFoto(-1);
  if (e.key === "ArrowRight") passarFoto(1);
});

/* ---------- Restauração (antes e depois) ---------- */

const CORES_RESTAURO = {
  "Móvel":      { antes: ["#8C8577", "#5E574B"], depois: ["#9C7342", "#664624"] },
  "Ferramenta": { antes: ["#8A5A3C", "#5A3520"], depois: ["#A9AFB3", "#6F777C"] },
};

$("#comparacoes").innerHTML = RESTAURACOES.map((r, i) => {
  const c = CORES_RESTAURO[r.tipo] || CORES_RESTAURO["Móvel"];
  return `
  <figure class="comparar">
    <div class="comparar-area">
      <div class="lado depois">${comFoto(r.depois, `${r.titulo}, depois`, veio(c.depois, i + 60))}</div>
      <div class="lado antes">${comFoto(r.antes, `${r.titulo}, antes`, veio(c.antes, i + 60))}</div>
      <span class="tag tag-antes">Antes</span>
      <span class="tag tag-depois">Depois</span>
      <div class="divisa" aria-hidden="true"></div>
      <input type="range" min="0" max="100" value="50" aria-label="Arraste para comparar o antes e o depois: ${esc(r.titulo)}">
    </div>
    <figcaption>
      <strong>${esc(r.titulo)}</strong><span class="tipo">${esc(r.tipo)}</span>
      ${r.descricao ? `<p>${esc(r.descricao)}</p>` : ""}
    </figcaption>
  </figure>`;
}).join("");

$("#comparacoes").addEventListener("input", (e) => {
  if (e.target.matches('input[type="range"]'))
    e.target.parentElement.style.setProperty("--pos", `${e.target.value}%`);
});

/* ---------- Madeiras ---------- */

$("#lista-madeiras").innerHTML = MADEIRAS.map((m, i) => `
  <div class="madeira">
    <div class="amostra">${veio(m.cores, i + 20, 300, 120)}</div>
    <h3>${esc(m.nome)}</h3>
    <p>${esc(m.texto)}</p>
  </div>`).join("");
$("#f-madeira").insertAdjacentHTML("beforeend", MADEIRAS.map((m) => `<option>${esc(m.nome)}</option>`).join(""));

/* ---------- Formulário de encomenda → WhatsApp ---------- */

$("#pedido").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.target, erro = $("#erro");
  const v = (n) => f.elements[n].value.trim();
  if (!v("nome")) { erro.textContent = "Preencha seu nome para a gente saber com quem está falando."; f.elements.nome.focus(); return; }
  if (!v("ideia")) { erro.textContent = "Descreva a ideia da peça em poucas palavras."; f.elements.ideia.focus(); return; }
  erro.textContent = "";
  const linhas = [
    `Olá! Meu nome é ${v("nome")} e quero fazer uma encomenda.`,
    ``,
    `Pedido: ${v("tipo")}`,
    v("medidas") ? `Medidas: ${v("medidas")}` : null,
    `Madeira: ${v("madeira")}`,
    v("gravacao") ? `Personalização: ${v("gravacao")}` : null,
    `Ideia: ${v("ideia")}`,
  ].filter((l) => l !== null);
  window.open(linkZap(linhas.join("\n")), "_blank", "noopener");
});

/* ---------- Animações ligadas à rolagem ---------- */

const topoEl = $(".topo"), selo = $(".selo"), trilho = $(".plaina-trilho");

// Desenha a tábua do cabeçalho: bruta (torta, escura, com nós) e lisa (reta, clara)
(function montarPlaina() {
  const r = sorteio(3), W = 1000, H = 24, LISA = 10;
  let borda = `M0 ${H} L0 3`;
  for (let x = 0; x <= W; x += 8) {
    const torta = Math.sin((x / W) * Math.PI * 2.3 + 1) * 3;          // empenada
    const lasca = (r() - 0.5) * 3 + (r() < 0.06 ? -2.5 : 0);          // imperfeições
    borda += ` L${x} ${Math.min(Math.max(0, 4 + torta + lasca), LISA - 1.5).toFixed(1)}`;
  }
  borda += ` L${W} ${H} Z`;
  let veioBruto = "", nos = "", veioLiso = "";
  for (let i = 0; i < 5; i++) {
    let d = `M0 ${(7 + i * 3.4).toFixed(1)}`;
    for (let x = 0; x <= W; x += 40) d += ` L${x} ${(7 + i * 3.4 + Math.sin(x * 0.02 + i) * 0.9 + (r() - 0.5) * 0.8).toFixed(1)}`;
    veioBruto += `<path d="${d}" stroke="#4A3524" stroke-opacity="${(0.3 + r() * 0.3).toFixed(2)}" stroke-width="1" fill="none" vector-effect="non-scaling-stroke"/>`;
  }
  for (let i = 0; i < 9; i++) {
    const nx = 60 + r() * 880, ny = 10 + r() * 9;
    nos += `<ellipse cx="${nx.toFixed(0)}" cy="${ny.toFixed(1)}" rx="7" ry="2.6" fill="#3E2A1B" opacity=".55"/>`;
  }
  for (let i = 0; i < 4; i++) {
    const y = LISA + 3 + i * 3;
    veioLiso += `<path d="M0 ${y} C250 ${y - 0.6} 500 ${y + 0.6} 1000 ${y}" stroke="#B08A5C" stroke-opacity=".5" stroke-width="1" fill="none" vector-effect="non-scaling-stroke"/>`;
  }
  trilho.innerHTML = `
    <svg class="tabua-bruta" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
      <path d="${borda}" fill="#8C7358"/>${veioBruto}${nos}
    </svg>
    <svg class="tabua-lisa" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
      <rect y="${LISA}" width="${W}" height="${H - LISA}" fill="#D9BC8C"/>${veioLiso}
      <rect y="${LISA}" width="${W}" height="1.2" fill="#F4E4C2"/>
    </svg>
    <svg class="plaina" viewBox="0 0 48 28">
      <path class="apara" d="M24 5 C27 -4 38 -3 36 5 C34 11 27 9 29 3" fill="none" stroke="#E8CFA0" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M3 28 L6 18 H42 L46 28 Z" fill="#6B4A2E"/>
      <rect x="3" y="26" width="43" height="2" fill="#3E2A1B"/>
      <path d="M8 18 C7 9 13 5 18 8 C19 12 18 15 18 18 Z" fill="#8A5A34"/>
      <ellipse cx="38" cy="14" rx="3.5" ry="4.2" fill="#8A5A34"/>
      <path d="M25 18 L21 4 L24.5 3 L28.5 18 Z" fill="#A3AAAF"/>
    </svg>`;
})();

// Aparas que saem da plaina, voam e caem
let ultimaApara = 0, ultimoY = scrollY;
function soltarApara() {
  if (semMovimento || trilho.childElementCount > 16) return;
  const plaina = $(".plaina", trilho).getBoundingClientRect(), caixa = trilho.getBoundingClientRect();
  const el = document.createElementNS(SVG_NS, "svg");
  el.setAttribute("viewBox", "0 0 18 14");
  el.setAttribute("class", "apara-solta");
  el.innerHTML = `<path d="M2 12 C3 3 14 1 15 7 C16 12 8 12 9 7" fill="none" stroke="${Math.random() < 0.5 ? "#E8CFA0" : "#D9BC8C"}" stroke-width="2" stroke-linecap="round"/>`;
  el.style.left = `${plaina.left - caixa.left + plaina.width * 0.45}px`;
  el.style.setProperty("--dx", `${(-20 - Math.random() * 60).toFixed(0)}px`);
  el.style.setProperty("--giro", `${(300 + Math.random() * 360).toFixed(0)}deg`);
  el.addEventListener("animationend", () => el.remove());
  trilho.append(el);
}

let pedindo = false, paradaPlaina;
function aoRolar() {
  pedindo = false;
  const max = document.documentElement.scrollHeight - innerHeight;
  const feito = max > 0 ? Math.min(Math.max(scrollY / max, 0), 1) : 0;
  trilho.style.setProperty("--p", feito.toFixed(4));
  if (!semMovimento) selo.style.setProperty("--giro", `${(scrollY * 0.12).toFixed(1)}deg`);
}
addEventListener("scroll", () => {
  if (!pedindo) { pedindo = true; requestAnimationFrame(aoRolar); }
  // Só solta apara quando a plaina anda para a frente (descendo a página)
  const agora = performance.now();
  if (scrollY > ultimoY && agora - ultimaApara > 70) { ultimaApara = agora; soltarApara(); }
  ultimoY = scrollY;
  topoEl.classList.add("andando");
  clearTimeout(paradaPlaina);
  paradaPlaina = setTimeout(() => topoEl.classList.remove("andando"), 180);
}, { passive: true });
aoRolar();

// Ornamento dos títulos "entalhado" quando aparece na tela
const vigiaTitulos = new IntersectionObserver((entradas) => {
  entradas.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visto"); vigiaTitulos.unobserve(e.target); } });
}, { threshold: 0.6 });
$$(".secao h2, footer h2").forEach((h) => vigiaTitulos.observe(h));

// Antes e depois: mexe a divisória uma vez sozinho, para mostrar que dá para arrastar
if (!semMovimento) {
  const vigiaComparar = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (!e.isIntersecting) return;
      vigiaComparar.unobserve(e.target);
      const area = e.target, input = $("input", area);
      const quadros = [50, 22, 78, 50], duracao = 2200, inicio = performance.now() + 300;
      let mexeu = false;
      input.addEventListener("pointerdown", () => (mexeu = true), { once: true });
      input.addEventListener("keydown", () => (mexeu = true), { once: true });
      (function passo(agora) {
        if (mexeu) return;
        const t = Math.max(0, Math.min((agora - inicio) / duracao, 1));
        const trecho = Math.min(Math.floor(t * 3), 2), local = t * 3 - trecho;
        const suave = local < 0.5 ? 2 * local * local : 1 - (-2 * local + 2) ** 2 / 2;
        const pos = quadros[trecho] + (quadros[trecho + 1] - quadros[trecho]) * suave;
        area.style.setProperty("--pos", `${pos}%`);
        input.value = pos;
        if (t < 1) requestAnimationFrame(passo);
      })(performance.now());
    });
  }, { threshold: 0.6 });
  $$(".comparar-area").forEach((a) => vigiaComparar.observe(a));
}

/* ---------- Cuidados: passe o óleo na tábua ---------- */

const oleoSvg = $("#oleo-demo");
const TABUA_OLEO = "M58 56 H296 C309 56 318 66 320 79 L322 108 C352 108 368 122 368 142 C368 162 352 176 322 176 L320 205 C318 218 309 228 296 228 H58 C46 228 38 219 38 207 V77 C38 65 46 56 58 56 Z M346 142 m-8 0 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0";
const PASSADA_PANO = "M62 78 C130 70 210 88 318 76 C220 110 130 100 62 118 C150 128 230 124 340 132 C230 160 140 150 62 162 C150 176 230 168 318 180 C220 204 130 198 62 210";
(function montarOleo() {
  oleoSvg.innerHTML = `
    <defs>
      <pattern id="veio-seco" patternUnits="userSpaceOnUse" width="400" height="290">${linhasVeio(["#D6C6AA", "#B3A184"], 31, 400, 290)}</pattern>
      <pattern id="veio-oleado" patternUnits="userSpaceOnUse" width="400" height="290">${linhasVeio(["#A8693A", "#5E361A"], 31, 400, 290)}</pattern>
      <linearGradient id="brilho-oleo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset=".7" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <clipPath id="tabua-oleo-forma"><path d="${TABUA_OLEO}" clip-rule="evenodd"/></clipPath>
      <mask id="oleo-mascara" maskUnits="userSpaceOnUse" x="0" y="0" width="400" height="290">
        <rect width="400" height="290" fill="#000"/>
        <path class="oleo-auto" d="${PASSADA_PANO}" pathLength="1" fill="none" stroke="#fff" stroke-width="46" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 1" stroke-dashoffset="1"/>
        <g class="oleo-pinceladas"></g>
      </mask>
    </defs>
    <ellipse cx="203" cy="244" rx="165" ry="9" fill="#2B1D14" opacity=".13"/>
    <path d="${TABUA_OLEO}" transform="translate(0 8)" fill="#8C7358" fill-rule="evenodd"/>
    <g clip-path="url(#tabua-oleo-forma)">
      <rect width="400" height="290" fill="url(#veio-seco)"/>
      <g mask="url(#oleo-mascara)">
        <rect width="400" height="290" fill="url(#veio-oleado)"/>
        <rect width="400" height="290" fill="url(#brilho-oleo)"/>
      </g>
    </g>
    <path d="${TABUA_OLEO}" fill="none" stroke="#2B1D14" stroke-opacity=".3" fill-rule="evenodd"/>
    <path class="oleo-guia" d="${PASSADA_PANO}" fill="none" stroke="none"/>
    <g class="pano" opacity="0">
      <path d="M-22 -14 C-8 -20 12 -18 22 -12 C26 -2 24 10 18 16 C4 20 -12 20 -22 14 C-27 4 -27 -6 -22 -14 Z" fill="#EDE3CF" stroke="#B9A98C" stroke-width="1.2"/>
      <path d="M-14 -8 C-4 -4 6 -6 14 -2 M-16 4 C-4 8 8 6 16 10" stroke="#B9A98C" stroke-width="1" fill="none"/>
      <path d="M-6 -2 C0 4 8 4 14 0" stroke="#C99B5E" stroke-opacity=".6" stroke-width="3" fill="none"/>
    </g>`;
})();

const panoEl = $(".pano", oleoSvg), pinceladas = $(".oleo-pinceladas", oleoSvg), oleoAuto = $(".oleo-auto", oleoSvg);
const pontoOleo = (e) => new DOMPoint(e.clientX, e.clientY).matrixTransform(oleoSvg.getScreenCTM().inverse());
let pincelada = null, pontosOleo = [];

oleoSvg.addEventListener("pointerdown", (e) => {
  const p = pontoOleo(e);
  pincelada = document.createElementNS(SVG_NS, "path");
  pincelada.setAttribute("fill", "none");
  pincelada.setAttribute("stroke", "#fff");
  pincelada.setAttribute("stroke-width", "42");
  pincelada.setAttribute("stroke-linecap", "round");
  pincelada.setAttribute("stroke-linejoin", "round");
  pontosOleo = [p];
  pincelada.setAttribute("d", `M${p.x.toFixed(1)} ${p.y.toFixed(1)} l0.1 0`);
  pinceladas.append(pincelada);
  panoEl.setAttribute("opacity", 1);
  posicionar(panoEl, p.x, p.y, 0);
  oleoSvg.setPointerCapture(e.pointerId);
});
oleoSvg.addEventListener("pointermove", (e) => {
  if (!pincelada) return;
  const p = pontoOleo(e), u = pontosOleo[pontosOleo.length - 1];
  if (Math.hypot(p.x - u.x, p.y - u.y) < 3) return;
  pontosOleo.push(p);
  pincelada.setAttribute("d", "M" + pontosOleo.map((q) => `${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(" L"));
  posicionar(panoEl, p.x, p.y, ((p.x - u.x) * 0.6).toFixed(1));
});
const soltarPano = () => { if (pincelada) { pincelada = null; panoEl.setAttribute("opacity", 0); } };
oleoSvg.addEventListener("pointerup", soltarPano);
oleoSvg.addEventListener("pointercancel", soltarPano);

// Na primeira vez que aparece, um pano passa óleo sozinho em zigue-zague
let vezDoOleo = 0;
async function passarOleo() {
  const minha = ++vezDoOleo;
  if (semMovimento) return oleoAuto.setAttribute("stroke-dashoffset", 0);
  const guia = $(".oleo-guia", oleoSvg), total = guia.getTotalLength();
  panoEl.setAttribute("opacity", 1);
  await animar(3600, (s) => {
    if (minha !== vezDoOleo) return;
    oleoAuto.setAttribute("stroke-dashoffset", (1 - s).toFixed(4));
    const a = guia.getPointAtLength(s * total), b = guia.getPointAtLength(Math.min(s * total + 3, total));
    posicionar(panoEl, a.x, a.y, ((b.x - a.x) * 3).toFixed(1));
  });
  if (minha === vezDoOleo) panoEl.setAttribute("opacity", 0);
}
$("#secar").addEventListener("click", () => {
  vezDoOleo++;
  pinceladas.innerHTML = "";
  oleoAuto.setAttribute("stroke-dashoffset", 1);
  panoEl.setAttribute("opacity", 0);
});
new IntersectionObserver(([e], obs) => {
  if (e.isIntersecting) { setTimeout(passarOleo, 400); obs.disconnect(); }
}, { threshold: 0.5 }).observe(oleoSvg);

/* ---------- Voltar ao topo: o arco atira uma flecha num alvo lá em cima ---------- */

const botaoTopo = $("#voltar-topo"), flechaArco = $(".arco-flecha", botaoTopo);
const sobeArco = $(".arco-sobe", botaoTopo), pegadaArco = $(".arco-pegada", botaoTopo), madeiraArco = $$(".arco-madeira", botaoTopo), cordaInteira = $(".corda-inteira", botaoTopo);
const cordaFiapo = $(".corda-fiapo", botaoTopo), cordaPonta = $(".corda-ponta", botaoTopo), fibrasCorda = $(".corda-fibras", botaoTopo);

// Quanto mais a pessoa desce a página, mais o arco é puxado (puxao, de 0 a 1)
// e mais a corda se desfia (desgaste, de 0 a 1), até sobrar só um fiapo segurando.
let desgasteCorda = 0;
function desenharArco(puxao, desgaste) {
  const p = Math.min(Math.max(puxao, 0), 1.3);
  // puxão exagerado: as pontas dobram muito e a corda vai lá embaixo
  const ponta = { x: 4 + 5 * p, y: 17 + 8 * p };          // as pontas do arco vêm para trás e para dentro
  const pontaD = { x: 40 - ponta.x, y: ponta.y };
  const centro = { x: 20, y: 17 + 24 * p };                // onde a flecha encosta na corda
  const d = `M${ponta.x.toFixed(1)} ${ponta.y.toFixed(1)} C${(10 - p).toFixed(1)} ${(3 + 2 * p).toFixed(1)} ${(30 + p).toFixed(1)} ${(3 + 2 * p).toFixed(1)} ${pontaD.x.toFixed(1)} ${pontaD.y.toFixed(1)}`;
  madeiraArco.forEach((el) => el.setAttribute("d", d));
  pegadaArco.setAttribute("transform", `translate(0 ${(3.5 * p).toFixed(1)})`);   // a pegada acompanha o meio do arco

  // o trecho que desfia fica no lado direito, entre 30% e 70% do caminho do centro até a ponta
  const ponto = (f) => ({ x: centro.x + (pontaD.x - centro.x) * f, y: centro.y + (pontaD.y - centro.y) * f });
  const a = ponto(0.3), b = ponto(0.7);
  const f = (n) => n.toFixed(2);
  cordaInteira.setAttribute("points", `${f(ponta.x)},${f(ponta.y)} ${f(centro.x)},${f(centro.y)} ${f(a.x)},${f(a.y)}`);
  cordaFiapo.setAttribute("x1", f(a.x)); cordaFiapo.setAttribute("y1", f(a.y));
  cordaFiapo.setAttribute("x2", f(b.x)); cordaFiapo.setAttribute("y2", f(b.y));
  cordaFiapo.setAttribute("stroke-width", f(1 - 0.8 * desgaste));
  cordaPonta.setAttribute("x1", f(b.x)); cordaPonta.setAttribute("y1", f(b.y));
  cordaPonta.setAttribute("x2", f(pontaD.x)); cordaPonta.setAttribute("y2", f(pontaD.y));

  // fibras rompidas saindo das duas pontas do trecho gasto, cada vez mais compridas e enroladas
  const abre = 0.8 + 3 * desgaste;
  fibrasCorda.setAttribute("opacity", f(Math.min(desgaste * 2, 1)));
  fibrasCorda.innerHTML = [
    [a, 1, -1, 1], [a, 0.7, 1, 0.8], [a, 1.2, -0.3, 0.6],
    [b, -1, -1, 1], [b, -0.8, 1, 0.7], [b, -1.1, 0.4, 0.5],
  ].map(([o, dx, dy, k]) => {
    const fx = o.x + dx * abre * k, fy = o.y + dy * abre * k * 0.9;
    return `<path d="M${f(o.x)} ${f(o.y)} Q${f(o.x + dx * abre * 0.8)} ${f(o.y)} ${f(fx)} ${f(fy)}"/>`;
  }).join("");

  flechaArco.setAttribute("transform", `translate(0 ${centro.y.toFixed(1)})`);   // o encaixe da flecha fica na corda
  sobeArco.setAttribute("transform", `translate(0 ${(-20 * p).toFixed(1)})`);   // sobe para a flecha não sair da tela
  botaoTopo.classList.toggle("quase-arrebentando", desgaste > 0.85);
}

function tensaoPelaRolagem() {
  const total = document.documentElement.scrollHeight - innerHeight;
  const progresso = total > 0 ? Math.min(scrollY / total, 1) : 0;
  desgasteCorda = Math.max(0, (progresso - 0.35) / 0.65);   // a corda só começa a desfiar depois de um terço da página
  if (!atirando) desenharArco(progresso, desgasteCorda);
}

addEventListener("scroll", () => {
  botaoTopo.classList.toggle("visivel", scrollY > 600);
  tensaoPelaRolagem();
}, { passive: true });
addEventListener("resize", tensaoPelaRolagem);

const ALVO_SVG = `<svg viewBox="0 0 84 84" aria-hidden="true">
  <circle cx="42" cy="42" r="39" fill="#C9A777" stroke="#4E3522" stroke-width="5"/>
  <circle cx="42" cy="42" r="30" fill="#9A4A2E"/>
  <circle cx="42" cy="42" r="22" fill="#ECE8DC"/>
  <circle cx="42" cy="42" r="14" fill="#9A4A2E"/>
  <circle cx="42" cy="42" r="6.5" fill="#E3B23C"/>
  <g fill="none" stroke="#2B1D14" stroke-opacity=".18"><circle cx="43" cy="41" r="34"/><circle cx="43" cy="41" r="26"/><circle cx="42" cy="42" r="18"/><circle cx="42" cy="42" r="10"/></g>
</svg>`;
const FLECHA_SVG = `<svg viewBox="0 0 64 12" aria-hidden="true">
  <line x1="8" y1="6" x2="56" y2="6" stroke="#6E5A48" stroke-width="2"/>
  <path d="M64 6 L55 1.5 V10.5 Z" fill="#7D858A"/>
  <path d="M0 1 L10 6 L0 11 L4 6 Z M6 1 L16 6 L6 11 L10 6 Z" fill="#9A4A2E"/>
</svg>`;

let atirando = false;
botaoTopo.addEventListener("click", async () => {
  if (semMovimento) return scrollTo({ top: 0, behavior: "auto" });
  if (atirando) return;
  atirando = true;

  // 1. puxa a corda até o fim (a partir de onde a rolagem já tinha deixado)
  const total = document.documentElement.scrollHeight - innerHeight;
  const puxaoInicial = total > 0 ? Math.min(scrollY / total, 1) : 0;
  await animar(260, (s) => desenharArco(puxaoInicial + (1.25 - puxaoInicial) * s, desgasteCorda));
  await espera(120);
  desenharArco(0, 0);   // soltou: a corda volta reta (e "nova") de uma vez
  botaoTopo.classList.add("sem-flecha");

  // 2. o alvo aparece no topo e a flecha voa em curva até ele, enquanto a página sobe
  const alvo = document.createElement("div");
  alvo.className = "alvo";
  alvo.innerHTML = ALVO_SVG;
  const destino = { x: Math.min(innerWidth - 80, Math.max(innerWidth / 2, 100)), y: 120 + 58 };
  alvo.style.left = `${destino.x}px`;
  document.body.append(alvo);
  requestAnimationFrame(() => alvo.classList.add("aparece"));

  const flecha = document.createElement("div");
  flecha.className = "flecha-voando";
  flecha.innerHTML = FLECHA_SVG;
  document.body.append(flecha);

  const caixa = botaoTopo.getBoundingClientRect();
  const saida = { x: caixa.left + caixa.width / 2, y: caixa.top + 8 };
  const chegada = { x: destino.x - 6, y: destino.y };
  const curva = { x: saida.x + (chegada.x - saida.x) * 0.15, y: Math.min(saida.y, chegada.y) - 60 };
  const rolagemInicial = scrollY;
  const html = document.documentElement, rolagemCss = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";

  await animar(950, (s) => {
    const u = 1 - s;
    const x = u * u * saida.x + 2 * u * s * curva.x + s * s * chegada.x;
    const y = u * u * saida.y + 2 * u * s * curva.y + s * s * chegada.y;
    const dx = 2 * u * (curva.x - saida.x) + 2 * s * (chegada.x - curva.x);
    const dy = 2 * u * (curva.y - saida.y) + 2 * s * (chegada.y - curva.y);
    const ang = Math.atan2(dy, dx) * 180 / Math.PI;
    flecha.style.transform = `translate(${(x - 100).toFixed(1)}px, ${(y - 9.5).toFixed(1)}px) rotate(${ang.toFixed(1)}deg)`;
    scrollTo(0, rolagemInicial * u);
  });
  html.style.scrollBehavior = rolagemCss;

  // 3. acerta: o alvo treme, a flecha fica cravada um tempo e os dois somem
  alvo.classList.add("acertou");
  await espera(1300);
  alvo.classList.add("some");
  flecha.classList.add("some");
  await espera(650);
  alvo.remove();
  flecha.remove();
  botaoTopo.classList.remove("sem-flecha");
  atirando = false;
  tensaoPelaRolagem();
});
tensaoPelaRolagem();
