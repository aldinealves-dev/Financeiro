# Histórico de Desenvolvimento — 03/08/2026

> Repositório: `https://github.com/aldinealves-dev/Financeiro`
> Deploy: `https://financeiro-alpha-blush.vercel.app`

---

## Sessão de 29/07/2026

### `2772bc8` · 12:08 — feat: adiciona seletor de empresa TC 01 (Opção A)

Criado o seletor de empresa no header do dashboard com dois botões: **ATRE** e **TC 01**.

- Botão "ATRE" exibe o sidebar e as páginas do dashboard principal
- Botão "TC 01" exibe o sidebar da empresa TC 01 (com seção "Resumo TC 01")
- Sidebar dinâmico: `#atre-nav` e `#tc01-nav` alternam via `switchCompany()`
- Flag `_tc01Loaded` evita re-carregamento dos dados ao trocar de empresa

---

### `a10f7ce` · 17:51 — feat: navegação por categoria e turma em Formações

Adicionados sub-botões de turma e categoria na seção DRE Formações, permitindo filtrar KPIs por:
- Todas as Formações (consolidado FL + FV)
- Formação de Líderes (2 turmas)
- Formação de Vendas (4 turmas)
- Turma individual (data no formato dd/mmm/aa)

### `f1562b7` · 18:38 — feat: move botões de categoria e turma para a página Formações

Botões de navegação por turma relocados para dentro da própria página, mantendo o sidebar limpo.

### `0c158f4` · 11:13 — feat: adiciona botão Todos em Formações

Botão "Todos" reseta o filtro de turma para o consolidado.

---

## Sessão de 30/07/2026

### `ec5de2e` · 14:27 — feat: popula TC01 com lançamentos hardcoded do Omie (24 entradas)

Dados lidos do arquivo `TC01 Controle.xlsx` (nov/25 a jul/26) e incorporados como constante `TC01_LANCAMENTOS` no JS, uma vez que TC 01 não possui planilha Google Sheets conectada.

**Campos por lançamento:** data, cliente/fornecedor, categoria, projeto, valor.

**24 transações registradas**, cobrindo:
- Aportes de sócios (Itaú Unibanco e A Trinca Mídia)
- Tarifas Bancárias (Itaú)
- Publicidade (Albuquerque & Borges)
- Sistemas (Real Contabilidade, Omiexperience)
- Transferências internas CDB/Itaú
- Adiantamentos e devoluções (Bracon)
- Impostos: ISS, PIS, COFINS
- Cartório (Andrade Minto Advogados)

---

### `9a9c725` · 14:47 — feat: TC01 resumo por categoria sem Adiantamento/Devolução

Tabela de lançamentos agrupa valores por categoria, ordenada do maior para o menor.

**Categorias excluídas do resumo e dos KPIs:**
- `Adiantamento de Clientes`
- `Devoluções de Vendas de Serviços`
- `Saída de Transferência`
- `Entrada de Transferência`

Motivo: operações de round-trip (R$ 500k Bracon + retorno) que distorciam os totais sem representar receita ou despesa real.

---

### `1ed615a` · 14:51 — fix: remove publicidade R$52.690 — valor em atraso, não recebido

Entrada de 16/07/2026 (Albuquerque & Borges, R$ 52.690,00, Publicidade) comentada na constante `TC01_LANCAMENTOS` pois o valor ainda não havia sido recebido.

```js
// { data:'16/07/2026', cli:'Albuquerque & Borges...', cat:'Publicidade', valor: 52690.00 }, // em atraso — não recebido
```

---

### `9af21b0` · 15:02 — feat: TC01 layout em duas colunas com gráfico donut por categoria

Layout da seção TC 01 reorganizado em `.grid-2`:
- **Coluna esquerda:** tabela "Lançamentos por Categoria"
- **Coluna direita:** gráfico donut "Distribuição por Categoria" (Chart.js, plugin datalabels)

Cores por categoria definidas em `CAT_COLORS`. Labels de % suprimidos quando fatia < 5%.

---

### `131b193` · 15:12 — fix: TC01 exclui Aporte do cálculo de Receitas

**Problema:** Aportes de sócios (R$ 10.000 + R$ 40.000) estavam sendo somados às Receitas operacionais, inflando o KPI de R$ 12.489 para R$ 62.489.

**Solução:** Lista `NAO_RECEITA = ['Aporte']` — Aportes permanecem visíveis na tabela e no gráfico (capital de sócios é informação relevante), mas não entram no cálculo de Receitas.

| KPI | Antes | Depois |
|-----|-------|--------|
| Receitas | R$ 62.489 | R$ 12.489 |
| Despesas | R$ 50.948 | R$ 50.948 |
| Resultado | R$ 11.540 | −R$ 38.458 |

---

## Sessão de 31/07/2026

### `04b964e` · 18:18 — fix: corrige saldo no Fluxo de Caixa Projetado

**Problema:** A seção "Saldo" do Fluxo de Caixa Projetado no Resumo exibia valores divergentes da planilha de origem.

**Causa raiz:** A API gviz truncava a aba `FC` em 29 linhas; as linhas 41 (Entradas), 42 (Saídas) e 43 (Saldo) — que contêm os totais corretos — não eram retornadas.

**Solução:** Segunda chamada `fetchSheet('FC', ..., { range: 'E41:P43' })` para buscar as três linhas com o range explícito.

---

### `cf6a604` · 18:23 — fix: FC busca entradas/saídas/saldo das linhas 41-43 da aba FC

Refatoração da correção anterior: `parseFC(raw, fcTotais)` aceita segundo parâmetro com os totais corretos e os aplica tanto nos arrays computados quanto nas entradas de `allRows` usadas pela tabela renderizada.

**Valores corretos do saldo projetado (ago/26 em diante):**

| Mês | Saldo |
|-----|-------|
| ago/26 | 236.535 |
| set/26 | 56.739 |
| out/26 | (166.084) |
| nov/26 | (314.736) |
| dez/26 | (466.386) |
| jan/27 | (680.611) |
| fev/27 | (859.970) |
| mar/27 | (1.086.348) |
| abr/27 | (1.330.463) |
| mai/27 | (1.569.171) |
| jun/27 | (1.808.202) |
| jul/27 | (2.051.646) |

---

### `5acd54a` · 19:00 — feat: remove card Total Pago no Ano da seção Contas Pagas

Card "Total Pago no Ano" (laranja, `id="cp-kpi-ano"`) removido da grade de KPIs da página Contas Pagas.

**KPIs restantes:**
- Total Pago no Mês (vermelho)
- Total Pago Geral (azul)

---

## Resumo Técnico

| Commit | Data | Tipo | Descrição |
|--------|------|------|-----------|
| `2772bc8` | 29/07 | feat | Seletor de empresa ATRE / TC 01 no header |
| `a10f7ce` | 29/07 | feat | Navegação por categoria e turma em DRE Formações |
| `f1562b7` | 29/07 | feat | Botões de turma relocados para a página |
| `0c158f4` | 30/07 | feat | Botão "Todos" em Formações |
| `ec5de2e` | 30/07 | feat | TC01 com 24 lançamentos hardcoded do Omie |
| `9a9c725` | 30/07 | feat | TC01 resumo por categoria (sem round-trips) |
| `1ed615a` | 30/07 | fix | Remove publicidade R$52.690 em atraso |
| `9af21b0` | 30/07 | feat | TC01 layout duas colunas + gráfico donut |
| `131b193` | 30/07 | fix | TC01 exclui Aporte do cálculo de Receitas |
| `04b964e` | 31/07 | fix | Saldo FC Projetado — busca range E41:P43 |
| `cf6a604` | 31/07 | fix | parseFC usa linhas 41-43 em allRows e arrays |
| `5acd54a` | 31/07 | feat | Remove card Total Pago no Ano (Contas Pagas) |
