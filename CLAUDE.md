# Controle Financeiro ATRE — Documentação do Projeto

## Arquivo principal
`Controle_Financeiro_ATRE.html` — dashboard financeiro single-page que lê dados do Google Sheets via API gviz JSONP.

---

## Google Sheets

- **SHEET_ID:** `1J1vkl2SsxJU4W52x5-SeSoC0mzehliEo`
- **API:** `https://docs.google.com/spreadsheets/d/{SHEET_ID}/gviz/tq?tqx=out:json;responseHandler:{cb}&sheet={nome}&headers=0`
- `fetchSheet(name, cb)` usa `cell.v` (valor bruto JS), não `cell.f` (formatado)
- Datas retornam como serial Excel (ex: 45992) ou string `"Date(year,month0,day)"`
- Números retornam como JS number (ex: 1047000, -12015.50)
- Se o nome da aba não existir, gviz retorna silenciosamente a primeira aba da planilha

### Abas utilizadas

| Aba | Função |
|-----|--------|
| `Resumo` | KPIs globais, carteira, inadimplência, saldo bancário |
| `Partners Ouro` | Clientes do clube (ex-"Clube", renomeada) |
| `FC` | Fluxo de caixa |
| `Formações` | Inscritos nas formações |
| `DRE FL` | DRE Formação de Líderes (T1 dez/25, T2 jan/26) |
| `DRE FV` | DRE Formação de Vendas (T1-T4, mar-jun/26) |
| `CP` | Contas pagas / despesas |
| `CP.categorias` | Categorias de despesas |
| `Comissões` | Comissões por vendedor |
| `Folha` | Folha de pagamento |

---

## Estrutura do Dashboard

### Sidebar (menu lateral)
- **Principal:** Resumo
- **Carteiras:** Partners Ouro, Inadimplência, Formações
- **Financeiro:** Fluxo de Caixa, DRE Formações
- **Despesas:** Contas Pagas, Comissões, Folha

Mobile: sidebar off-canvas com botão ☰ (hamburguer) e overlay.

---

## Abas e componentes

### Resumo
- KPIs: Faturamento Total, Total Recebido, A Receber, Contas Pagas, Saldo Bancário
- Tabela: Carteira de Recebíveis (por produto)
- Gráfico: Carteira por Produto (donut)
- Seção: Inadimplência Críticos
- Seção: Contas Pagas – 3 Principais Categorias
- Seção: Headcount
- Saldo lido da linha "SALDO" da aba Resumo (não calculado)

### Partners Ouro (ex-Clube Mentoria)
- **Aba renomeada:** "Clube" → "Partners Ouro" na planilha
- **Estrutura das colunas (Partners Ouro):**
  - col0=# | col1=Nome | col2=TIPO | col3=Ano | col4=Início | col5=Fim
  - col6=Valor Contrato | col7=Ato Pago | col9=Saldo | col12=Status | col14=Col N (inadimplência)
- Stats: Total, Em Pagamento, Quitados, Inadimplentes, Valor Total
- Gráfico barras: Valor por Status (inadimplente usa soma col N dos inadimplentes)
- Tabela: colunas centralizadas em Valor Contrato, Ato, Saldo
- Datas formato dd/mm/yyyy via `fmtDateClube(v)`

### Inadimplência
- % lido da aba Resumo como decimal (ex: 0.03064 → exibir 3,06%)
- Gráfico donut: inadimplente vs adimplente
- Tabela sem coluna #
- Cabeçalho: "Saldo em Aberto / À Vencer"

### Formações
- KPIs: Total (Qt vendida), Faturamento
  - Faturamento lido da aba Resumo, linha "Formações", col2 (R$ 1.911.258)
- Tabela ordenada por data mais recente primeiro
- Colunas: Nome, Turma, Tipo, Valor Bruto, Desconto, Valor Líq., Forma Pgto, Status, Data/Mês Finalização
- Sem coluna # e sem card "Status dos Inscritos"

### DRE Formações
- Dados lidos de **duas abas separadas**: `DRE FL` e `DRE FV`
- **DRE FL** (Formação de Líderes): col1=rótulo, cols 3/6 = R$ por turma (col+1 = % receita)
  - Col3=T1(dez-25) | Col6=T2(jan-26)
- **DRE FV** (Formação de Vendas): col1=rótulo, cols 4/7/10/13 = R$ por turma (col+1 = % receita)
  - Col4=T1(02/mar-26) | Col7=T2(19/mar-26) | Col10=T3(20/abr-26) | Col13=T4(11/jun-26)
- `parseDreSheet(raw, valueCols, cat)` — parser genérico; MargemLíquida% = ll/rb
- Subtotais retornam direto do gviz para DRE FV (rows 6,9,15,18,20); DRE FL retorna valores absolutos e % lado a lado
- **KPIs topo** (3 cards): Receita Bruta Total, Margem Líquida %, Margem Líquida R$
  - Default "Todas as Formações": soma FL + FV (6 turmas)
  - Clicar "Formação de Líderes" → KPIs filtram para FL (2 turmas)
  - Clicar "Formação de Vendas" → KPIs filtram para FV (4 turmas)
  - "Todas as Formações" reseta para totais consolidados
- Sub-botões de turma usam formato dd/mmm/aa (`fmtPeriodFull`); clicar exibe tabela DRE individual

### Fluxo de Caixa
- Lido da aba `FC`
- KPIs e tabela por mês (Entradas, Saídas, Saldo)

---

## Helpers JavaScript principais

| Função | Descrição |
|--------|-----------|
| `parseBRL(s)` | Converte string/número BR para inteiro (Math.trunc) |
| `fmt(v)` | Formata número BR sem decimais (ex: "1.911.258") |
| `fmtCmp(v)` | Alias de fmt |
| `fmtDateClube(v)` | Serial Excel ou Date(...) → "dd/mm/yyyy" |
| `fmtPeriod(v)` | Serial Excel → "mmm/aa" (ex: "dez/25") |
| `fi(kw, from, anyCol)` | Busca linha por keyword na aba Resumo |
| `fetchSheet(name, cb)` | JSONP gviz, retorna array de arrays cell.v |
| `setText(id, val)` | document.getElementById(id).innerText = val |
| `parseDreFV(raw)` | Parseia aba DRE FV → DRE_FV_PARSED |
| `toggleSidebar()` | Abre/fecha sidebar no mobile |

---

## Responsividade Mobile

- **Breakpoint:** `max-width: 768px`
- Sidebar: off-canvas, `transform: translateX(-100%)` → `.open { transform: translateX(0) }`
- Overlay: `#sidebar-overlay` fecha ao clicar
- Sidebar fecha automaticamente ao navegar entre abas
- `.content { padding: 14px 18px }` no mobile
- `body { overflow-x: hidden }` no mobile
- Grids (.grid-2, .grid-3, .grid-1-2, .grid-2-1) → 1 coluna
- KPI grid → 2 colunas (≤480px → 1 coluna)

---

## Variáveis globais dinâmicas

```js
let CLUBE_DATA = [];
let _inadimData = { topRows: [], totalRow: [], pct: '—' };
let FORMACOES_DATA = [];
let DRE_FV_PARSED = { fl: [], fv: [], _currentCat: 'fl' };
let CP_DATA = { rows: [], totalPago: 0, totalGeral: 0 };
let CP_CATS = [];
let COM_DATA = [];
let FOLHA_DATA = { employees: [], totalCLT: 0, totalPJ: 0, totalGeral: 0, headcount: {} };
```

---

## Pendências / Notas

- **"PAGOS NA ÚLTIMA SEMANA" / "ÚLTIMOS RENEGOCIADOS":** não encontrados via gviz (possível célula mesclada na planilha). Aguarda localização da aba/coluna correta.
- **DRE_DATA estático:** mantido no código como referência mas não usado na renderização (substituído por DRE_FV_PARSED).
- **Aba CR:** não acessível via gviz. Faturamento de Formações agora lido da aba Resumo.
- **Atualização automática:** `setInterval(loadAll, 5 * 60 * 1000)` — recarrega dados a cada 5 minutos.

---

## Caminho do arquivo

```
G:\Meu Drive\FINANCEIRO\Controle Financeiro\Criação\Controle_Financeiro_ATRE.html
```

Preview server: Python HTTP Server na porta 8080 (`.claude/launch.json`)
