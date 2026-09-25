# Nó da Madeira: site da marcenaria

Site estático (HTML + CSS + JavaScript puro, sem build, sem framework) de uma marcenaria artesanal
no **Distrito Federal**. Não tem pagamento: todo pedido vai para o **WhatsApp 5561993668326**
com a mensagem já escrita (`https://wa.me/<número>?text=...`).

O dono é iniciante em programação e fala português. Explique as coisas de forma simples, em português,
e mantenha tudo editável sem conhecimento técnico.

## Estrutura

```
index.html            estrutura e textos fixos das seções
css/estilo.css        aparência (tokens de cor em :root)
js/configuracao.js    ÚNICO arquivo que o dono edita: LOJA, MADEIRAS, PRODUTOS, LUMINARIAS, PROJETOS, RESTAURACOES
js/site.js            funcionamento e animações (gera as grades a partir do configuracao.js)
fotos/produtos | luminarias | projetos | restauracao   (vazias, com .gitkeep)
COMO-EDITAR.txt       guia para o dono: como editar, pôr fotos, publicar (Netlify / GitHub Pages)
```

`configuracao.js` é carregado antes do `site.js`, e as variáveis dele são globais.

## Seções (ordem na página)

1. Hero: título, anéis de tronco que se desenham, selo "FEITO À MÃO ✦ NÓ DA MADEIRA" que gira com a rolagem
2. **Caixas e móveis** (`#pecas`): grade com filtro. Tábuas e utensílios NÃO entram aqui (`SECOES_PROPRIAS`)
3. **Tábuas de corte** (`#tabuas`): tábua de topo interativa. Uma picanha é fatiada em loop enquanto a seção está visível, e o usuário pode "cortar" arrastando. As marcas somem.
4. **Utensílios** (`#utensilios`): carrossel Colher → Gamela → Cumbuca → Copinho (`PECAS_ENTALHE`). Formão desbasta o bloco (1ª passada varrendo da esquerda para a direita, depois contorna a peça com máscara SVG de stroke decrescente `PASSADAS`), depois vêm o acabamento em óleo e o brilho de lixa.
5. **Luminárias** (`#luminarias`): fundo escuro, acendem piscando ao entrar na tela, com interruptor
6. **Projetos** (`#projetos`): galeria com visualizador (`<dialog>`), várias fotos por projeto
7. **Restauração e afiação** (`#restauracao`): móveis, ferramentas de metal, afiação de formão e plaina, comparador antes/depois arrastável
8. **Cuidados** (`#cuidados`): tábua onde se passa óleo arrastando (máscara SVG) + `<details>` com os cuidados
9. **Encomendas** (`#encomendas`): formulário que monta a mensagem e abre o WhatsApp
10. **Madeiras** (`#madeiras`): ipê, cumaru, jatobá, freijó, tauari
11. Rodapé: local (DF), atendimento, Instagram (só aparece se `LOJA.instagram` estiver preenchido)

Elementos fixos: cabeçalho com uma **plaina** que anda conforme a rolagem (tábua bruta e torta à frente, lisa atrás,
aparas voando), botão do WhatsApp no canto direito, **arco e flecha** no canto esquerdo (voltar ao topo:
a flecha voa em curva até um alvo de tronco no topo). Conforme a rolagem desce, o arco é puxado de forma exagerada
(`desenharArco(puxao, desgaste)`) e a corda desfia até sobrar um fiapo, e aí o arco treme (`.quase-arrebentando`).

## Identidade visual

- Cores: papel `#DAD8CB`, serragem `#ECE8DC`, imbuia `#2B1D14`, musgo `#3F4A33`, amarelo ipê `#E3B23C`, casca `#6E5A48`, WhatsApp `#1F7A4D`
- Fontes: IM Fell English (títulos), Alegreya (serifada de apoio), Alegreya Sans (texto)
- Enquanto não há foto, cada item mostra um desenho de madeira gerado por SVG (`veio`, `topo`,
  `marchetaria(estilo)` com losangos, xadrez ou listras escolhido pelo nome, `desenhoLuminaria`)
- Todas as animações respeitam `prefers-reduced-motion`

## Situação atual (set/2026)

- Tudo pronto e funcionando. **Produtos, preços, projetos e restaurações são EXEMPLOS inventados**:
  o dono precisa trocar pelos reais e colocar as fotos.
- Publicado no GitHub Pages: https://lukas-ramos.github.io/no-da-madeira/ (repositório
  https://github.com/Lukas-Ramos/no-da-madeira, branch `main`, pasta raiz). Cada `git push` atualiza o site em ~1 min.
- Frase de envio "Para outras cidades, consulte o envio" é neutra: o dono não confirmou se envia pelos Correios.
- Ideias sugeridas e ainda não feitas: depoimentos de clientes, imagem `og:image` para a prévia do link no
  WhatsApp (depende do endereço final), domínio próprio (nodamadeira.com.br), Google Meu Negócio.

## Cuidados ao mexer / testar

- Para testar, sirva a pasta com `python -m http.server 8765` e abra `http://localhost:8765/`.
- **A aba de teste do Chrome costuma ficar em segundo plano** (`document.visibilityState === "hidden"`).
  Aí o `requestAnimationFrame` para e os timers ficam limitados a 1 por segundo. Medições com rAF "travam" e
  screenshots podem dar timeout: NÃO é travamento do site. Para testar animações, sobrescreva
  `requestAnimationFrame` / `performance.now` com um relógio falso, ou monte o estado manualmente.
- O navegador guarda cache de `js/` e `css/`. Depois de editar, peça ao dono **Ctrl+F5**. Nos testes, use
  `fetch(url, {cache: "reload"})` antes de `location.reload()`.
- Um `mix-blend-mode` em camada fixa de tela inteira (textura de papel) + `backdrop-filter` deixaram a página
  pesada. A textura atual é só uma imagem com opacidade: não reintroduza blend/backdrop.
- `[hidden] { display: none !important; }` existe porque `.btn` sobrescrevia o atributo `hidden`.
- Depois de editar JS, cheque a sintaxe:
  `node -e "const fs=require('fs');new Function(fs.readFileSync('js/site.js','utf8'))"`
