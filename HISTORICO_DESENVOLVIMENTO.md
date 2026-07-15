# Histórico de Desenvolvimento — Controle Financeiro ATRE

> Período coberto: **26/06/2026 – 03/07/2026**
> Repositório: `https://github.com/aldinealves-dev/Financeiro`
> Deploy: `https://financeiro-alpha-blush.vercel.app`

---

## 26/06/2026 — Versão Inicial

### `20f3c7a` · 15:17 — feat: dashboard financeiro ATRE — versão inicial
Criação do arquivo principal `Controle_Financeiro_ATRE.html` com o dashboard financeiro single-page.
Lê dados do Google Sheets via API gviz JSONP. Abas cobertas: Resumo, Partners Ouro, Formações, DRE FL, DRE FV, Fluxo de Caixa, Contas Pagas, Comissões, Folha.

### `99f787c` · 15:22 — fix: add vercel.json to serve HTML at root
Adicionado `vercel.json` com rewrite `/ → /Controle_Financeiro_ATRE.html` para o Vercel servir o dashboard na URL raiz.

### `04d5106` · 16:01 — chore: trigger redeploy after vercel rename
Redeploy após renomeação do projeto no Vercel.

### `ccce30d` · 16:06 — chore: redeploy
Redeploy de rotina.

### `80b6144` · 19:10 — feat: remove Total Pago Geral e Antecipação de Resultados do Contas Pagas
Simplificação da aba Contas Pagas: removidos cards de Total Pago Geral e Antecipação de Resultados que não tinham dados confiáveis.

### `9becb37` · 19:14 — feat: remove botões Comissões e Folha
Removidos os botões de navegação "Comissões" e "Folha" do menu lateral enquanto as abas correspondentes não estão prontas.

### `ff24336` · 19:16 — chore: redeploy
Redeploy de rotina para confirmar publicação das mudanças acima.

---

## 01/07/2026 — Contas Pagas: KPIs e Migração para Matriz

### `3201c7b` · 09:50 — feat: adiciona filtro de período (2025/2026/Todos) e remove gráfico de Conciliação
Adicionados botões de filtro por ano (2025 / 2026 / Todos) na aba Contas Pagas.
Removido o gráfico de Conciliação que estava ocupando espaço sem agregar valor.

### `7091c9e` · 10:43 — feat: migra transações de CP para Matriz; período da col W e seletor de intervalo de data
Primeira tentativa de usar a aba `Matriz` como fonte de dados para Contas Pagas (transações mais completas).
Leitura do período mensal da coluna W. Adicionado seletor de intervalo de datas (De / Até).

### `73ceb3a` · 11:29 — feat: adiciona KPIs Total Pago no Mês, no Ano e Geral em Contas Pagas
Três KPIs numéricos no topo da aba Contas Pagas: **Total Pago no Mês**, **Total Pago no Ano** e **Total Pago Geral**.
Calculados a partir das datas das transações via `parseCPDate`.

### `9155c57` · 18:36 — debug: adiciona console.log em parseMatriz para diagnosticar origem
Logs de diagnóstico temporários para identificar em qual coluna da Matriz estava o campo "Conta Paga".

### `aa5f10f` · 18:51 — debug: busca coluna real de Conta Paga na Matriz
Diagnóstico adicional buscando a coluna correta com `indexOf('Conta Paga')` nas linhas brutas do gviz.

### `d7457f4` · 19:04 — fix: reverte fonte de dados para aba CP
Revertido para a aba `CP` após constatar que a aba `Matriz` não estava acessível pelo nome via gviz
(retornava a primeira aba da planilha por não encontrar "Matriz" pelo nome). Fonte de KPIs e transações voltou para CP.

---

## 02/07/2026 — Diagnóstico, Correção da Matriz e PWA

### `7fd715a` · 09:54 — debug: loga valores col F da aba CP para diagnosticar totais
Log temporário dos valores da coluna F (Valor) da aba CP para entender discrepâncias entre os totais
calculados e os valores esperados pelo usuário (~R$6M).

### `965e769` · 10:19 — feat: reimplementa Contas Pagas via Matriz com debug e 2 categorias excluídas
Nova tentativa de usar a aba `Matriz`. Duas categorias excluídas do cálculo:
- `Movimentação Financeira (-)` — transferências internas
- `Devoluções de Vendas de Serviços Prestados` — estornos

Logs de debug embutidos para rastrear a estrutura das colunas.

### `413b385` · 16:44 — fix: corrige fetch e parsing de datas na aba Matriz
**Correções importantes:**
- `fetchSheet()` passa a aceitar `opts.gid`: usa `&gid=346698554` (ID numérico) para acessar a aba Matriz diretamente, contornando a falha silenciosa de busca por nome.
- Criado helper `_dateParts()` que converte tanto o formato `Date(ano,mes,dia)` do gviz quanto serial Excel (ex: `45992`) em `[ano, mes, dia]`. Resolve discrepância de ~R$22K no Total Pago no Ano.
- Loop de `parseMatriz` inicia em `i=0` (com `headers=0` a linha de cabeçalho vem como dado comum).
- EXCL por `exact match` em vez de `startsWith` para não excluir `Movimentação Financeira (+)`.
- Debug com `console.table` temporário de breakdown de totais para validação.

### `fd558c3` · 17:24 — feat: adiciona suporte PWA (manifest, service worker, ícones)
Dashboard passa a ser instalável como **Progressive Web App (PWA)**:
- `manifest.json`: nome, cores (#0b4f63), `start_url`, ícone SVG
- `sw.js`: service worker com cache-first para CDN, network-first para app shell e Google Sheets
- `vercel.json`: headers `Cache-Control` e `Service-Worker-Allowed` para `sw.js`
- `icons/icon.svg`: ícone SVG com gráfico de barras + linha de tendência + texto "ATRE"
- HTML: meta tags PWA, `apple-touch-icon`, `rel=manifest`, registro do SW

### `dbe2ef0` · 19:04 — fix: simplifica service worker para evitar bloqueio de dados
O SW original fazia pre-cache de URLs do CDN (jsdelivr) no evento `install` usando `addAll()`.
Respostas opaque de cross-origin causavam falha silenciosa — o site parava de carregar dados.
**Solução:** SW simplificado para interceptar apenas requests do mesmo origin.
CDN (Chart.js) e Google Sheets passam direto pelo browser sem interferência do cache.

---

## 03/07/2026 — Fluxo de Caixa Projetado e Correção Final de Contas Pagas

### `9c5b413` · 09:00 — fix: remove debug console.table do parseMatriz e simplifica filtro EXCL
Remoção dos logs e `console.table` de debug adicionados durante a fase de diagnóstico.
`parseMatriz` limpo e pronto para produção.

### `9a26bea` · 17:34 — chore: força redeploy Vercel
Commit vazio para forçar novo deploy após mudanças não refletidas pelo Vercel.

### `c64a56f` · 17:48 — feat: exibe todas as linhas do Fluxo de Caixa Projetado como na planilha
**Seção "Fluxo de Caixa Projetado" no Resumo Consolidado reformulada.**
Antes: 3 linhas fixas hard-coded (Entradas, Saídas, Saldo).
Depois: leitura genérica de **todas as linhas** da seção FLUXO da aba Resumo com:
- Detecção automática da seção por keyword (`FLUXO`)
- Header de meses gerado dinamicamente a partir da linha de cabeçalho da planilha
- Classificação automática por regex: `isSaldo` (linhas começando com "Saldo" → rodapé), `isSecao` (Entradas/Saídas → negrito), `isTotal` (linhas com "Total")
- Cores dinâmicas: verde para valores positivos, vermelho para negativos
- Filtragem de linhas de rodapé sem valores numéricos (ex.: "Notas: ...")

### `a299c11` · 18:04 — fix: troca fonte de Contas Pagas de Matriz (filtrada) para aba CP
**Diagnóstico final:** a aba Matriz no Google Sheets tem um **filtro ativo** que limita o gviz a apenas 29 linhas (somente registros de RAISSA FRANCO OKADA). O gviz retorna exclusivamente as linhas visíveis no filtro — comportamento esperado da API, mas invisível no código.

**Solução aplicada:** volta para a aba `CP` como fonte de dados.
- **Antes:** 2 fornecedores únicos, 22 transações
- **Depois:** 125 fornecedores únicos, 134 transações

> **Pendência:** Para restaurar os ~R$6M completos da Matriz, remover o filtro ativo na aba Matriz do Google Sheets (Dados → Remover filtro) e avisar para trocar de volta para `&gid=346698554`.

---

## Resumo Técnico — Principais Decisões

| Tema | Decisão | Motivo |
|------|---------|--------|
| Fonte gviz para Matriz | `&gid=346698554` em vez de `&sheet=Matriz` | Nome não encontrado silenciosamente pelo gviz |
| Parsing de datas | Helper `_dateParts()` dual-format | gviz retorna `Date(y,m,d)` e serials Excel; ambos precisavam de suporte |
| EXCL de categorias | `Set` com exact match | `startsWith` excluía `Movimentação Financeira (+)` indevidamente |
| Service Worker | Cache apenas same-origin | Pre-cache de CDN cross-origin causava falha silenciosa de install |
| Fonte de Contas Pagas | Aba `CP` (temporário) | Filtro ativo na Matriz limita gviz a 29 linhas |
