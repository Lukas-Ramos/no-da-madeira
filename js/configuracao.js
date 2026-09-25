/* =====================================================================
   CONFIGURAÇÃO DO SITE — este é o único arquivo que você precisa editar
   ---------------------------------------------------------------------
   Regras para não quebrar o site:
   - Todo texto fica entre aspas: "assim"
   - Cada item da lista termina com vírgula
   - Nome de foto sem espaço e sem acento: "mesa-jatoba-1.jpg"
   - Se algo sumir do site depois de editar, provavelmente faltou uma
     aspa ou uma vírgula. Veja o arquivo COMO-EDITAR.txt
   ===================================================================== */

const LOJA = {
  nome: "Nó da Madeira",
  // 55 + DDD + número, só números
  whatsapp: "5561993668326",
  atendimento: "Atendimento pelo WhatsApp de segunda a sábado.",
  local: "Oficina no Distrito Federal. Para outras cidades, consulte o envio.",
  // Link do Instagram, ex.: "https://instagram.com/nodamadeira". Deixe "" para esconder o botão.
  instagram: "",
};

/* ---------------------------------------------------------------------
   MADEIRAS
   cores: [cor clara, cor escura], usadas no desenho quando não há foto
   --------------------------------------------------------------------- */
const MADEIRAS = [
  { nome: "Ipê",    texto: "Muito dura e durável. Ótima para tábuas.", cores: ["#7A5A3A", "#4E3522"] },
  { nome: "Cumaru", texto: "Resistente à água, tom dourado.",           cores: ["#9C7342", "#664624"] },
  { nome: "Jatobá", texto: "Avermelhada, bonita em móveis.",            cores: ["#9A4A2E", "#5E2A18"] },
  { nome: "Freijó", texto: "Clara e leve. Perfeita para caixas.",       cores: ["#C9A777", "#94764D"] },
  { nome: "Tauari", texto: "Quase branca, acabamento liso.",            cores: ["#DCC8A4", "#B09A74"] },
];

/* ---------------------------------------------------------------------
   PEÇAS À VENDA
   tipo: vira um botão de filtro (Caixas, Tábuas, Móveis, Utensílios...)
   madeira: um dos nomes da lista MADEIRAS acima
   foto: coloque a foto em fotos/produtos/ e escreva o caminho aqui.
         Deixe "" para mostrar o desenho de madeira no lugar.
   ATENÇÃO: os preços abaixo são EXEMPLOS. Troque pelos seus.
   --------------------------------------------------------------------- */
const PRODUTOS = [
  { nome: "Caixa de vinho com gravação",     tipo: "Caixas",     preco: 120, madeira: "Freijó", texto: "Para uma ou duas garrafas, com nome ou data gravados na tampa.", foto: "" },
  { nome: "Caixa de chá com divisórias",     tipo: "Caixas",     preco: 95,  madeira: "Tauari", texto: "Seis ou nove divisões, tampa com visor opcional.", foto: "" },
  { nome: "Porta-joias forrado",             tipo: "Caixas",     preco: 140, madeira: "Jatobá", texto: "Interior forrado em feltro, com bandeja removível.", foto: "" },
  { nome: "Porta-joias com gavetas",         tipo: "Caixas",     preco: 210, madeira: "Freijó", texto: "Duas gavetas para anéis e brincos e tampa com espelho.", foto: "" },
  { nome: "Deckbox de Magic (MTG)",          tipo: "Caixas",     preco: 150, madeira: "Ipê",    texto: "Para um deck de 100 cartas com sleeve, com espaço para dados e marcadores. Dá para gravar o nome do seu comandante.", foto: "" },
  { nome: "Tábua de topo para carne",        tipo: "Tábuas",     preco: 260, madeira: "Ipê",    texto: "Montada com a fibra de pé: não marca fácil e poupa o fio da faca.", foto: "" },
  { nome: "Tábua de churrasco com canaleta", tipo: "Tábuas",     preco: 180, madeira: "Cumaru", texto: "Canaleta que segura o caldo da carne. Várias medidas.", foto: "" },
  { nome: "Tábua marchetada em losangos",    tipo: "Tábuas",     preco: 290, madeira: "Freijó", texto: "Losangos de ipê e jatobá encaixados à mão na madeira clara. Para servir e para presentear.", foto: "" },
  { nome: "Tábua marchetada em xadrez",      tipo: "Tábuas",     preco: 320, madeira: "Freijó", texto: "Quadrados de madeira clara e escura intercalados, como um tabuleiro.", foto: "" },
  { nome: "Tábua marchetada em listras",     tipo: "Tábuas",     preco: 260, madeira: "Freijó", texto: "Ripas de freijó, ipê, cumaru, jatobá e tauari coladas lado a lado.", foto: "" },
  { nome: "Tábua de frios marchetada",       tipo: "Tábuas",     preco: 230, madeira: "Freijó", texto: "Filetes de madeira escura contornando a tábua, com alça.", foto: "" },
  { nome: "Tábua de frios com alça",         tipo: "Tábuas",     preco: 110, madeira: "Jatobá", texto: "Para servir queijos e frios na mesa.", foto: "" },
  { nome: "Banco de madeira maciça",         tipo: "Móveis",     preco: 450, madeira: "Jatobá", texto: "Encaixes aparentes, sem parafuso à vista.", foto: "" },
  { nome: "Mesa lateral",                    tipo: "Móveis",     preco: 680, madeira: "Cumaru", texto: "Tampo inteiriço, pés torneados à mão.", foto: "" },
  { nome: "Prateleira com mão-francesa",     tipo: "Móveis",     preco: 220, madeira: "Freijó", texto: "Feita no comprimento que você precisar.", foto: "" },
  { nome: "Kit de colheres de pau",          tipo: "Utensílios", preco: 75,  madeira: "Cumaru", texto: "Três colheres entalhadas à mão, acabadas com óleo mineral.", foto: "" },
  { nome: "Colher de servir entalhada",      tipo: "Utensílios", preco: 45,  madeira: "Ipê",    texto: "Concha funda e cabo longo, entalhada a partir de uma peça só.", foto: "" },
  { nome: "Espátula de cozinha",             tipo: "Utensílios", preco: 35,  madeira: "Jatobá", texto: "Ponta chanfrada, não risca panela antiaderente.", foto: "" },
  { nome: "Cumbuca torneada",                tipo: "Utensílios", preco: 90,  madeira: "Freijó", texto: "Para petiscos, castanhas ou frutas. Vários diâmetros.", foto: "" },
  { nome: "Copinho de madeira",              tipo: "Utensílios", preco: 70,  madeira: "Ipê",    texto: "Entalhado com alça, para café, cachaça ou para enfeitar.", foto: "" },
  { nome: "Gamela entalhada",                tipo: "Utensílios", preco: 220, madeira: "Cumaru", texto: "Escavada à mão num bloco inteiro. Serve salada, pão ou fruta.", foto: "" },
];

/* ---------------------------------------------------------------------
   LUMINÁRIAS RÚSTICAS
   estilo: escolhe o desenho que aparece enquanto não há foto
           "pendente", "mesa", "arandela" ou "toco"
   foto: coloque a foto em fotos/luminarias/
   ATENÇÃO: os preços abaixo são EXEMPLOS. Troque pelos seus.
   --------------------------------------------------------------------- */
const LUMINARIAS = [
  { nome: "Pendente de madeira torneada", estilo: "pendente", preco: 320, madeira: "Freijó", texto: "Cúpula torneada numa peça só, com fio de tecido trançado.", foto: "" },
  { nome: "Luminária de tronco",          estilo: "mesa",     preco: 240, madeira: "Cumaru", texto: "Pedaço de tronco com casca e lâmpada de filamento aparente.", foto: "" },
  { nome: "Arandela de tábua rústica",    estilo: "arandela", preco: 190, madeira: "Jatobá", texto: "Tábua com borda natural e braço de ferro para a parede.", foto: "" },
  { nome: "Luminária de toco com raiz",   estilo: "toco",     preco: 380, madeira: "Ipê",    texto: "Toco com as raízes aparentes. Não existem duas iguais.", foto: "" },
];

/* ---------------------------------------------------------------------
   PROJETOS JÁ ENTREGUES (galeria)
   Cada projeto pode ter várias fotos. A primeira aparece na galeria;
   as outras aparecem quando a pessoa toca na foto.
   Coloque as fotos em fotos/projetos/
   ATENÇÃO: os projetos abaixo são EXEMPLOS. Troque pelos seus.
   --------------------------------------------------------------------- */
const PROJETOS = [
  {
    titulo: "Mesa de jantar para 8 lugares",
    descricao: "Tampo de jatobá com 2,20 m, pés em cavalete.",
    madeira: "Jatobá",
    fotos: [
      // "fotos/projetos/mesa-jantar-1.jpg",
      // "fotos/projetos/mesa-jantar-2.jpg",
    ],
  },
  {
    titulo: "Caixas de padrinhos",
    descricao: "20 caixas com o nome de cada padrinho gravado.",
    madeira: "Freijó",
    fotos: [],
  },
  {
    titulo: "Kit de tábuas para churrasqueira",
    descricao: "Tábua grande de topo e duas de servir.",
    madeira: "Ipê",
    fotos: [],
  },
  {
    titulo: "Estante de sala",
    descricao: "Nichos abertos sob medida para a parede.",
    madeira: "Cumaru",
    fotos: [],
  },
  {
    titulo: "Tábua de frios personalizada",
    descricao: "Presente de casamento com as iniciais do casal.",
    madeira: "Tauari",
    fotos: [],
  },
];

/* ---------------------------------------------------------------------
   RESTAURAÇÕES (fotos de antes e depois)
   tipo: "Móvel" ou "Ferramenta"
   antes / depois: coloque as fotos em fotos/restauracao/
   Dica: tire as duas fotos do mesmo ângulo, fica muito melhor.
   ATENÇÃO: os itens abaixo são EXEMPLOS. Troque pelos seus.
   --------------------------------------------------------------------- */
const RESTAURACOES = [
  { titulo: "Cômoda antiga da família", tipo: "Móvel",      descricao: "Verniz removido, gavetas reajustadas e acabamento em cera.", antes: "", depois: "" },
  { titulo: "Plaina manual nº 5",       tipo: "Ferramenta", descricao: "Ferrugem removida, sola retificada e lâmina afiada.",        antes: "", depois: "" },
  { titulo: "Cadeira de palhinha",      tipo: "Móvel",      descricao: "Encaixes colados de novo e palhinha trocada.",              antes: "", depois: "" },
  { titulo: "Machado com cabo novo",    tipo: "Ferramenta", descricao: "Cabeça limpa e afiada, cabo novo em ipê.",                   antes: "", depois: "" },
];
