/* ============================================================================
   Devolução B2B — busca de pedidos por CNPJ + carrossel + preenchimento
   ----------------------------------------------------------------------------
   No formulário de solicitação (new_request_page.hbs), quando o formulário tem
   um campo "CNPJ":
     1. O cliente digita o CNPJ e clica em "Buscar pedidos" (ou Enter).
     2. A API (FASE 1: mock neste arquivo) devolve os itens de pedido do CNPJ.
     3. Os itens aparecem num carrossel de cards.
     4. Ao selecionar um card, são preenchidos os campos nativos:
        Número do pedido, Número da NF de venda, Data da NF de venda,
        Produto / SKU e o Assunto padrão
        "Devolução {organização} - Pedido {numero_pedido}".

   Os campos continuam sendo os campos nativos do Zendesk (fonte real do
   ticket). Este módulo só os preenche. Os campos são localizados pelo RÓTULO
   (CONFIG.labels), então nenhum ID fica fixo no código; se preferir IDs,
   preencha CONFIG.fieldIds.

   O formulário é renderizado em React. Por isso os valores são escritos com o
   "setter" nativo + evento "input" (o React só registra a mudança assim).
   ========================================================================== */

// ----------------------------- CONFIG ---------------------------------------
const CONFIG = {
  // Restringe a formulários específicos (ticket_form_id). Vazio = qualquer
  // formulário que tenha um campo CNPJ.
  ticketFormIds: [],

  // Rótulos dos campos (comparação sem acento/maiúsculas/espaços extras).
  labels: {
    cnpj: ["cnpj"],
    pedido: ["numero do pedido"],
    nf: ["numero da nf de venda"],
    dataNf: ["data da nf de venda"],
    sku: ["produto / sku", "produto/sku"],
  },

  // Opcional: IDs dos campos, se preferir não depender do rótulo.
  // Ex.: { cnpj: 123456789, pedido: 987654321 }
  fieldIds: {},

  subjectTemplate: "Devolução {{organizacao}} - Pedido {{numero_pedido}}",

  // Anexos obrigatórios: o envio é bloqueado até haver `minImages` imagens.
  // Arquivos que não são imagem (ex.: PDF da NF) são aceitos, mas não contam.
  attachments: {
    minImages: 4,
    hint: "Anexe imagens do produto e a Nota Fiscal de compra",
    imageExtensions: ["jpg", "jpeg", "png", "gif", "webp", "heic", "heif", "bmp", "tif", "tiff"],
  },

  // FASE 2: URL do proxy/back-end que consulta a API real.
  // Enquanto `useMock` for true, a URL não é usada.
  useMock: true,
  apiUrl: "",
};

// ------------------------------ MOCK ----------------------------------------
// Formato de resposta esperado da API (o mesmo que o proxy deve devolver):
// {
//   cnpj, razao_social,
//   pedidos: [{ numero_pedido, nf_numero, nf_data: "AAAA-MM-DD",
//               itens: [{ sku, descricao, quantidade, valor_unitario }] }]
// }
const MOCK_DB = {
  "11222333000181": {
    razao_social: "Tech Soluções Corporativas Ltda",
    pedidos: [
      {
        numero_pedido: "B2B-104582",
        nf_numero: "000187452",
        nf_data: "2026-10-14",
        itens: [
          { sku: "MBA13-M3-256-MDN", descricao: "MacBook Air 13\" M3 256GB Meia-noite", quantidade: 10, valor_unitario: 9499.0 },
          { sku: "MGN-KBD-PT-BR", descricao: "Magic Keyboard com Touch ID PT-BR", quantidade: 10, valor_unitario: 1299.0 },
        ],
      },
      {
        numero_pedido: "B2B-104977",
        nf_numero: "000188031",
        nf_data: "2026-10-22",
        itens: [
          { sku: "IPH16-128-PRT", descricao: "iPhone 16 128GB Preto", quantidade: 25, valor_unitario: 6299.0 },
        ],
      },
      {
        numero_pedido: "B2B-105310",
        nf_numero: "000189377",
        nf_data: "2026-11-03",
        itens: [
          { sku: "IPAD-AIR11-M2-128", descricao: "iPad Air 11\" M2 128GB Cinza-espacial", quantidade: 8, valor_unitario: 5799.0 },
          { sku: "APNCL-PRO", descricao: "Apple Pencil Pro", quantidade: 8, valor_unitario: 1199.0 },
        ],
      },
    ],
  },
  "44555666000181": {
    razao_social: "Distribuidora Horizonte S.A.",
    pedidos: [
      {
        numero_pedido: "B2B-099871",
        nf_numero: "000179920",
        nf_data: "2026-09-30",
        itens: [
          { sku: "AIRPODS-PRO2-USBC", descricao: "AirPods Pro (2ª geração) USB-C", quantidade: 40, valor_unitario: 2199.0 },
        ],
      },
    ],
  },

  // ---- Empresas fictícias para a simulação em HML ----
  // Cadastrar no Zendesk uma organização com o mesmo nome para cada uma,
  // vinculando os usuários de teste (o assunto usa o nome da organização).
  "28471935000175": {
    razao_social: "Atlântica Tecnologia Corporativa Ltda",
    pedidos: [
      {
        numero_pedido: "B2B-210341",
        nf_numero: "000301122",
        nf_data: "2026-09-18",
        itens: [
          { sku: "MBP14-M4P-512-PRT", descricao: "MacBook Pro 14\" M4 Pro 512GB Preto-espacial", quantidade: 12, valor_unitario: 18999.0 },
          { sku: "STUDIO-DISPLAY-27", descricao: "Studio Display 27\" vidro padrão", quantidade: 12, valor_unitario: 12499.0 },
        ],
      },
      {
        numero_pedido: "B2B-211087",
        nf_numero: "000302410",
        nf_data: "2026-10-27",
        itens: [
          { sku: "MAGIC-MOUSE-USBC-BCO", descricao: "Magic Mouse USB-C Branco", quantidade: 20, valor_unitario: 899.0 },
        ],
      },
    ],
  },
  "51983027000182": {
    razao_social: "Nova Rota Logística S.A.",
    pedidos: [
      {
        numero_pedido: "B2B-208764",
        nf_numero: "000298875",
        nf_data: "2026-08-29",
        itens: [
          { sku: "IPH16E-128-BCO", descricao: "iPhone 16e 128GB Branco", quantidade: 60, valor_unitario: 4599.0 },
        ],
      },
      {
        numero_pedido: "B2B-210955",
        nf_numero: "000302088",
        nf_data: "2026-10-21",
        itens: [
          { sku: "IPAD-A16-128-AZL", descricao: "iPad (A16) 128GB Azul", quantidade: 35, valor_unitario: 3999.0 },
          { sku: "CAPA-SMARTFOLIO-IPAD", descricao: "Capa Smart Folio para iPad Azul-céu", quantidade: 35, valor_unitario: 699.0 },
        ],
      },
      {
        numero_pedido: "B2B-211402",
        nf_numero: "000303016",
        nf_data: "2026-11-04",
        itens: [
          { sku: "CABO-USBC-1M", descricao: "Cabo de carregamento USB-C (1 m)", quantidade: 100, valor_unitario: 229.0 },
        ],
      },
    ],
  },
  "73620458000117": {
    razao_social: "Instituto Educacional Saber Mais Ltda",
    pedidos: [
      {
        numero_pedido: "B2B-209630",
        nf_numero: "000300154",
        nf_data: "2026-09-08",
        itens: [
          { sku: "MBA13-M4-256-PRT", descricao: "MacBook Air 13\" M4 256GB Prateado", quantidade: 30, valor_unitario: 9999.0 },
          { sku: "ADAPT-USBC-35W-DUO", descricao: "Adaptador de energia USB-C duplo de 35 W", quantidade: 30, valor_unitario: 649.0 },
        ],
      },
    ],
  },
  "40295816000104": {
    razao_social: "Clínica Vida Plena Serviços Médicos Ltda",
    pedidos: [
      {
        numero_pedido: "B2B-210118",
        nf_numero: "000301563",
        nf_data: "2026-09-30",
        itens: [
          { sku: "IPAD-AIR13-M3-256-CZE", descricao: "iPad Air 13\" M3 256GB Cinza-espacial", quantidade: 15, valor_unitario: 9299.0 },
          { sku: "APNCL-PRO", descricao: "Apple Pencil Pro", quantidade: 15, valor_unitario: 1199.0 },
        ],
      },
      {
        numero_pedido: "B2B-211230",
        nf_numero: "000302755",
        nf_data: "2026-10-31",
        itens: [
          { sku: "IPH16PRO-256-NAT", descricao: "iPhone 16 Pro 256GB Titânio natural", quantidade: 8, valor_unitario: 10499.0 },
        ],
      },
    ],
  },
  "61384729000101": {
    razao_social: "Pampa Agro Insumos Ltda",
    pedidos: [
      {
        numero_pedido: "B2B-209211",
        nf_numero: "000299630",
        nf_data: "2026-09-02",
        itens: [
          { sku: "IMAC24-M4-256-AZL", descricao: "iMac 24\" M4 256GB Azul", quantidade: 6, valor_unitario: 14999.0 },
        ],
      },
      {
        numero_pedido: "B2B-210702",
        nf_numero: "000301990",
        nf_data: "2026-10-15",
        itens: [
          { sku: "WATCH-S10-46-PRT", descricao: "Apple Watch Series 10 GPS 46 mm Preto-brilhante", quantidade: 10, valor_unitario: 4999.0 },
          { sku: "AIRTAG-4PACK", descricao: "AirTag (pacote com 4)", quantidade: 10, valor_unitario: 999.0 },
        ],
      },
    ],
  },
  // ----------------------------------------------------

  // CNPJ válido, sem pedidos -> estado vazio
  "77888999000181": { razao_social: "Comercial Sem Pedidos Ltda", pedidos: [] },
};
// CNPJ válido que simula falha da API -> estado de erro
const MOCK_ERROR_CNPJ = "12312312000110";

function mockRequest(cnpj) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (cnpj === MOCK_ERROR_CNPJ) {
        reject(new Error("Serviço de pedidos indisponível (simulado)."));
        return;
      }
      const data = MOCK_DB[cnpj];
      resolve(data ? { cnpj, ...data } : { cnpj, razao_social: null, pedidos: [] });
    }, 700);
  });
}

// Única função que conhece a origem dos dados. Na FASE 2, só ela muda.
async function buscarPedidos(cnpj) {
  if (CONFIG.useMock || !CONFIG.apiUrl) return mockRequest(cnpj);
  const url = `${CONFIG.apiUrl}?cnpj=${encodeURIComponent(cnpj)}`;
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Falha na consulta (${response.status}).`);
  return response.json();
}

// ----------------------------- HELPERS --------------------------------------
const normalize = (text) =>
  String(text || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\*/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const onlyDigits = (text) => String(text || "").replace(/\D/g, "");

function isValidCnpj(value) {
  const cnpj = onlyDigits(value);
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
  const digit = (base) => {
    const weights = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = base.split("").reduce((acc, n, i) => acc + Number(n) * weights[i], 0) % 11;
    return sum < 2 ? 0 : 11 - sum;
  };
  const d1 = digit(cnpj.slice(0, 12));
  const d2 = digit(cnpj.slice(0, 12) + d1);
  return cnpj.endsWith(`${d1}${d2}`);
}

// Máscara progressiva: "11222" -> "11.222", 14 dígitos -> "11.222.333/0001-81"
function maskCnpj(value) {
  const d = onlyDigits(value).slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

// Posição no texto formatado logo depois do n-ésimo dígito
function caretAfterDigits(formatted, n) {
  if (n <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < formatted.length; i += 1) {
    if (/\d/.test(formatted[i])) seen += 1;
    if (seen === n) return i + 1;
  }
  return formatted.length;
}

const formatCnpj =(cnpj) => onlyDigits(cnpj).replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");

// "2026-10-14" -> "14/10/2026" (sem passar por Date para evitar fuso)
const isoToBr = (iso) => {
  const [y, m, d] = String(iso).split("-");
  return `${d}/${m}/${y}`;
};

// "2026-10-14" -> "10/14/2026" (formato que o Datepicker do Garden entende)
const isoToUs = (iso) => {
  const [y, m, d] = String(iso).split("-");
  return `${m}/${d}/${y}`;
};

// Escrever no Datepicker abre o calendário; Escape fecha e faz o campo exibir
// a data já formatada no idioma da Central de Ajuda.
const closeDatepicker = (el) =>
  el.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", keyCode: 27, bubbles: true }));

const formatMoney =(value) =>
  Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const escapeHtml = (text) =>
  String(text ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Escreve num input/textarea controlado pelo React.
function setReactValue(el, value) {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value").set.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

const fieldName = (id) => `request[custom_fields][${id}]`;

// --------------------------- FIELD LOOKUP -----------------------------------
function resolveFieldIds(requestForm) {
  const ticketFields = (requestForm && requestForm.ticket_fields) || [];
  const ids = {};
  const types = {};
  Object.keys(CONFIG.labels).forEach((key) => {
    const wanted = CONFIG.labels[key].map(normalize);
    const field = CONFIG.fieldIds[key]
      ? ticketFields.find((f) => String(f.id) === String(CONFIG.fieldIds[key]))
      : ticketFields.find((f) => wanted.includes(normalize(f.label)));
    if (field) {
      ids[key] = field.id;
      types[key] = field.type;
    }
  });
  return { ids, types };
}

// Localiza o elemento editável de um campo customizado no DOM atual.
// Campos de data: o valor enviado fica num input hidden; o editável é o
// input visível do Datepicker, no mesmo container.
function findInput(form, id) {
  const named = form.querySelector(`[name="${fieldName(id)}"]`);
  if (!named) return null;
  if (named.type !== "hidden") return named;
  const container = named.parentElement;
  return container ? container.querySelector("input:not([type=hidden]), textarea") : null;
}

// ------------------------------ UI ------------------------------------------
const ICON_BOX =
  '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5v-9Z"/><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" d="M3.5 7.5 12 12l8.5-4.5M12 12v9"/></svg>';
const ICON_CHEVRON = (dir) =>
  `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="${dir === "prev" ? "M10 3 5 8l5 5" : "M6 3l5 5-5 5"}"/></svg>`;

function buildPanel() {
  const panel = document.createElement("div");
  panel.className = "dvp";
  panel.innerHTML = `
    <button type="button" class="dvp-search">Buscar pedidos</button>
    <div class="dvp-hint" id="dvp-cnpj-hint">Digite os 14 números do CNPJ e clique em <strong>Buscar pedidos</strong> para escolher o produto da devolução.</div>
    <div class="dvp-status" role="status" aria-live="polite"></div>
    <div class="dvp-results" hidden>
      <div class="dvp-results-head">
        <div class="dvp-results-title"></div>
        <div class="dvp-nav">
          <button type="button" class="dvp-nav-btn" data-dir="prev" aria-label="Pedidos anteriores">${ICON_CHEVRON("prev")}</button>
          <button type="button" class="dvp-nav-btn" data-dir="next" aria-label="Próximos pedidos">${ICON_CHEVRON("next")}</button>
        </div>
      </div>
      <ul class="dvp-track" role="list"></ul>
    </div>
    <div class="dvp-selected" hidden>
      <span class="dvp-selected-text"></span>
      <button type="button" class="dvp-clear">Limpar seleção</button>
    </div>`;
  return panel;
}

function cardHtml(item, index) {
  return `
    <li class="dvp-card-item">
      <button type="button" class="dvp-card" data-index="${index}" aria-pressed="false">
        <span class="dvp-card-top">
          <span class="dvp-card-icon">${ICON_BOX}</span>
          <span class="dvp-badge">Selecionado</span>
        </span>
        <span class="dvp-card-name">${escapeHtml(item.descricao)}</span>
        <span class="dvp-card-sku">SKU ${escapeHtml(item.sku)}</span>
        <dl class="dvp-card-meta">
          <div><dt>Pedido</dt><dd>${escapeHtml(item.numero_pedido)}</dd></div>
          <div><dt>NF</dt><dd>${escapeHtml(item.nf_numero)}</dd></div>
          <div><dt>Data NF</dt><dd>${escapeHtml(isoToBr(item.nf_data))}</dd></div>
          <div><dt>Quantidade</dt><dd>${escapeHtml(item.quantidade)} ${Number(item.quantidade) === 1 ? "unidade" : "unidades"}</dd></div>
          <div class="dvp-card-total">
            <dt>Valor da compra</dt>
            <dd>${escapeHtml(formatMoney(Number(item.quantidade) * Number(item.valor_unitario)))}<small>${escapeHtml(formatMoney(item.valor_unitario))} cada</small></dd>
          </div>
        </dl>
      </button>
    </li>`;
}

const SKELETON = '<li class="dvp-card-item"><div class="dvp-card dvp-card--skeleton" aria-hidden="true"><span></span><span></span><span></span><span></span></div></li>';

// ------------------------------ MAIN ----------------------------------------
export function initDevolucaoPedidos({ container, requestForm, organizations }) {
  if (!container || !requestForm) return;

  if (CONFIG.ticketFormIds.length) {
    const formId = requestForm.ticket_form_field && requestForm.ticket_form_field.value;
    if (!CONFIG.ticketFormIds.map(String).includes(String(formId))) return;
  }

  const { ids, types } = resolveFieldIds(requestForm);
  const dateIsPicker = types.dataNf === "date";
  if (!ids.cnpj) return; // formulário sem CNPJ: nada a fazer

  const state = { items: [], selected: null, razaoSocial: null, lastCnpj: null };
  const panel = buildPanel();
  const $ = (sel) => panel.querySelector(sel);
  const status = $(".dvp-status");
  const results = $(".dvp-results");
  const track = $(".dvp-track");
  const searchBtn = $(".dvp-search");

  const getForm = () => container.querySelector("form");
  const getCnpjInput = () => {
    const form = getForm();
    return form ? findInput(form, ids.cnpj) : null;
  };

  function setStatus(kind, message) {
    status.className = `dvp-status${kind ? ` dvp-status--${kind}` : ""}`;
    status.textContent = message || "";
  }

  function organizationName() {
    const orgs = organizations || [];
    const form = getForm();
    const orgInput = form && form.querySelector('[name="request[organization_id]"]');
    const chosen = orgInput && orgs.find((o) => String(o.id) === String(orgInput.value));
    const fallback = orgs.find((o) => o.default) || orgs[0];
    return (chosen || fallback || {}).name || state.razaoSocial || formatCnpj(state.lastCnpj);
  }

  function fillableInputs() {
    const form = getForm();
    if (!form) return [];
    return ["pedido", "nf", "dataNf", "sku"]
      .filter((key) => ids[key])
      .map((key) => ({ key, el: findInput(form, ids[key]) }))
      .filter((f) => f.el);
  }

  function lockInputs(locked) {
    fillableInputs().forEach(({ el }) => {
      el.readOnly = locked;
      el.classList.toggle("dvp-autofilled", locked);
    });
  }

  function fillFields(item) {
    const values = {
      pedido: item.numero_pedido,
      nf: item.nf_numero,
      // O Datepicker do Garden interpreta o texto digitado sempre no formato
      // americano MM/dd/AAAA (date-fns "P" sem locale), qualquer que seja o
      // idioma da Central de Ajuda, e já grava a data ao receber o "input".
      // Se o campo for de texto, grava DD/MM/AAAA.
      dataNf: dateIsPicker ? isoToUs(item.nf_data) : isoToBr(item.nf_data),
      sku: `${item.descricao} / ${item.sku}`,
    };
    lockInputs(false);
    fillableInputs().forEach(({ key, el }) => {
      setReactValue(el, values[key]);
      if (key === "dataNf" && dateIsPicker) closeDatepicker(el);
    });

    const subject = getForm().querySelector('[name="request[subject]"]');
    if (subject) {
      const text = CONFIG.subjectTemplate
        .replace("{{organizacao}}", organizationName())
        .replace("{{numero_pedido}}", item.numero_pedido);
      setReactValue(subject, text);
    }
    lockInputs(true);
  }

  function clearSelection() {
    lockInputs(false);
    fillableInputs().forEach(({ key, el }) => {
      setReactValue(el, "");
      if (key === "dataNf" && dateIsPicker) closeDatepicker(el);
    });
    state.selected = null;
    track.querySelectorAll(".dvp-card").forEach((c) => c.setAttribute("aria-pressed", "false"));
    $(".dvp-selected").hidden = true;
  }

  function selectItem(index) {
    const item = state.items[index];
    if (!item) return;
    state.selected = index;
    track.querySelectorAll(".dvp-card").forEach((card) => {
      card.setAttribute("aria-pressed", String(Number(card.dataset.index) === index));
    });
    fillFields(item);
    $(".dvp-selected").hidden = false;
    $(".dvp-selected-text").textContent = `Pedido ${item.numero_pedido} · ${item.sku} selecionado. Campos preenchidos automaticamente.`;
  }

  function resetResults() {
    results.hidden = true;
    track.innerHTML = "";
    state.items = [];
    if (state.selected !== null) clearSelection();
  }

  async function search() {
    const input = getCnpjInput();
    const cnpj = onlyDigits(input && input.value);
    if (!isValidCnpj(cnpj)) {
      resetResults();
      setStatus("error", "CNPJ inválido. Confira os 14 dígitos e tente novamente.");
      input && input.focus();
      return;
    }

    resetResults();
    state.lastCnpj = cnpj;
    searchBtn.disabled = true;
    searchBtn.textContent = "Buscando…";
    setStatus("", "Buscando pedidos…");
    results.hidden = false;
    $(".dvp-results-title").textContent = "Carregando pedidos";
    track.innerHTML = SKELETON.repeat(3);
    panel.querySelector(".dvp-nav").hidden = true;

    try {
      const data = await buscarPedidos(cnpj);
      if (state.lastCnpj !== cnpj) return; // CNPJ mudou durante a busca
      state.razaoSocial = data.razao_social || null;
      state.items = (data.pedidos || []).flatMap((p) =>
        (p.itens || []).map((it) => ({ ...it, numero_pedido: p.numero_pedido, nf_numero: p.nf_numero, nf_data: p.nf_data }))
      );

      if (!state.items.length) {
        resetResults();
        setStatus("empty", `Nenhum pedido encontrado para o CNPJ ${formatCnpj(cnpj)}.`);
        return;
      }

      const orders = new Set(state.items.map((i) => i.numero_pedido)).size;
      $(".dvp-results-title").innerHTML =
        `${escapeHtml(state.razaoSocial || formatCnpj(cnpj))} <span>${orders} pedido${orders > 1 ? "s" : ""} · ${state.items.length} produto${state.items.length > 1 ? "s" : ""}</span>`;
      track.innerHTML = state.items.map(cardHtml).join("");
      track.scrollLeft = 0;
      updateNav();
      setStatus("", "Selecione o produto que será devolvido.");
    } catch (error) {
      resetResults();
      setStatus("error", `Não foi possível buscar os pedidos. ${error.message}`);
    } finally {
      searchBtn.disabled = false;
      searchBtn.textContent = "Buscar pedidos";
    }
  }

  function updateNav() {
    const max = track.scrollWidth - track.clientWidth;
    panel.querySelector('[data-dir="prev"]').disabled = track.scrollLeft <= 2;
    panel.querySelector('[data-dir="next"]').disabled = track.scrollLeft >= max - 2;
    panel.querySelector(".dvp-nav").hidden = max <= 2;
  }

  // Eventos do painel
  searchBtn.addEventListener("click", search);
  $(".dvp-clear").addEventListener("click", clearSelection);
  track.addEventListener("click", (event) => {
    const card = event.target.closest(".dvp-card[data-index]");
    if (card) selectItem(Number(card.dataset.index));
  });
  track.addEventListener("scroll", updateNav, { passive: true });
  window.addEventListener("resize", updateNav);
  panel.querySelectorAll(".dvp-nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const step = track.clientWidth * 0.85 * (btn.dataset.dir === "prev" ? -1 : 1);
      track.scrollBy({ left: step, behavior: "smooth" });
    });
  });

  // Enter no CNPJ busca em vez de enviar o formulário; editar o CNPJ
  // invalida o resultado anterior.
  container.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && event.target === getCnpjInput()) {
      event.preventDefault();
      search();
    }
  });
  // Máscara do CNPJ: aceita só dígitos (máx. 14) e formata enquanto digita,
  // mantendo o cursor no lugar certo.
  container.addEventListener("input", (event) => {
    const input = getCnpjInput();
    if (event.target !== input) return;
    const formatted = maskCnpj(input.value);
    if (formatted !== input.value) {
      const caret = input.selectionStart ?? input.value.length;
      const digitsBefore = onlyDigits(input.value.slice(0, caret)).length;
      setReactValue(input, formatted);
      const pos = caretAfterDigits(formatted, digitsBefore);
      try {
        input.setSelectionRange(pos, pos);
      } catch (e) {
        /* campo sem foco */
      }
    }
    // CNPJ completo: valida na hora, sem esperar o clique em "Buscar".
    const digits = onlyDigits(input.value);
    if (digits.length === 14 && !isValidCnpj(digits)) {
      setStatus("error", "CNPJ inválido. Confira os 14 dígitos.");
    } else if (status.classList.contains("dvp-status--error") && state.lastCnpj === null) {
      setStatus("", "");
    }
  });
  // Colar: aproveita só os dígitos (ex.: "CNPJ: 11.222.333/0001-81").
  container.addEventListener("paste", (event) => {
    const input = getCnpjInput();
    if (event.target !== input) return;
    const text = (event.clipboardData || window.clipboardData).getData("text");
    const pasted = onlyDigits(text);
    if (!pasted) return;
    event.preventDefault();
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? start;
    const before = onlyDigits(input.value.slice(0, start));
    const after = onlyDigits(input.value.slice(end));
    const digits = (before + pasted + after).slice(0, 14);
    const formatted = maskCnpj(digits);
    setReactValue(input, formatted);
    const pos = caretAfterDigits(formatted, Math.min(before.length + pasted.length, 14));
    input.setSelectionRange(pos, pos);
  });

  container.addEventListener("input", (event) => {
    if (event.target !== getCnpjInput() || state.lastCnpj === null) return;
    if (onlyDigits(event.target.value) !== state.lastCnpj) {
      state.lastCnpj = null;
      resetResults();
      setStatus("", "");
    }
  });

  // O formulário é renderizado de forma assíncrona (React). Insere o painel
  // logo após o campo CNPJ e reinsere se o React recriar o trecho.
  function mount() {
    const input = getCnpjInput();
    if (input) {
      const field = input.closest("[data-garden-id='forms.field']") || input.parentElement;
      if (field.nextElementSibling !== panel) field.after(panel);
      // Botão "Buscar pedidos" na mesma linha do campo CNPJ
      field.classList.add("dvp-cnpj-field");
      if (input.nextElementSibling !== searchBtn) input.after(searchBtn);
      decorateCnpj(input);
    }
    decoratePlaceholders();
    attachments.refresh();
  }

  // Atributos do campo CNPJ (o React não controla esses atributos, mas
  // reaplica a cada mudança caso ele recrie o campo).
  function decorateCnpj(input) {
    const attrs = {
      maxlength: "18", // 14 dígitos + pontuação
      placeholder: "00.000.000/0000-00",
      inputmode: "numeric",
      autocomplete: "off",
      "aria-describedby": `${input.getAttribute("aria-describedby") || ""} dvp-cnpj-hint`.trim(),
    };
    Object.entries(attrs).forEach(([name, value]) => {
      if (name === "aria-describedby" && (input.getAttribute(name) || "").includes("dvp-cnpj-hint")) return;
      if (input.getAttribute(name) !== value) input.setAttribute(name, value);
    });
  }

  // Campos preenchidos pelo card: placeholder explicando de onde vem o valor
  function decoratePlaceholders() {
    const form = getForm();
    if (!form) return;
    const placeholders = {
      pedido: "Preenchido automaticamente",
      nf: "Preenchido automaticamente",
      dataNf: "Preenchida automaticamente",
      sku: "Preenchido automaticamente ao escolher um pedido",
    };
    Object.keys(placeholders).forEach((key) => {
      const el = ids[key] && findInput(form, ids[key]);
      if (el && el.getAttribute("placeholder") !== placeholders[key]) el.setAttribute("placeholder", placeholders[key]);
    });
  }
  const attachments = setupRequiredAttachments({ container, requestForm, getForm });
  new MutationObserver(mount).observe(container, { childList: true, subtree: true });
  mount();
}

// ------------------------- ANEXOS OBRIGATÓRIOS ------------------------------
// O campo de anexos do formulário guarda cada arquivo já enviado num input
// hidden (name = attachments_field.name, value = JSON com file_name). Arquivos
// ainda em upload aparecem só na lista visual. O envio do formulário é
// interceptado (fase de captura, antes do React) enquanto a regra não for
// cumprida.
function setupRequiredAttachments({ container, requestForm, getForm }) {
  const cfg = CONFIG.attachments;
  const fieldName = requestForm.attachments_field && requestForm.attachments_field.name;
  if (!cfg || !cfg.minImages) return { refresh() {} };
  if (!fieldName) {
    console.warn("[devolucao-pedidos] Anexos estão desativados na conta; não é possível exigir imagens.");
    return { refresh() {} };
  }

  const isImage = (name) => cfg.imageExtensions.includes(String(name).split(".").pop().toLowerCase());
  let attempted = false;

  const hint = document.createElement("div");
  hint.className = "dvp-att-hint";
  hint.textContent = cfg.hint;
  const counter = document.createElement("div");
  counter.className = "dvp-att-counter";
  counter.setAttribute("aria-live", "polite");
  const asterisk = document.createElement("span");
  asterisk.className = "dvp-att-required";
  asterisk.setAttribute("aria-hidden", "true");
  asterisk.textContent = "*";

  // O campo de anexos é o que tem a área de upload do Garden. Não dá para
  // procurar o primeiro input[type=file]: o editor da Descrição (CKEditor)
  // tem um escondido para inserir imagem no texto, e ele vem antes.
  function getField() {
    const form = getForm();
    if (!form) return null;
    const upload = form.querySelector("[data-garden-id='forms.file_upload']");
    if (upload) return upload.closest("[data-garden-id='forms.field']") || upload.parentElement;
    const fileInput = [...form.querySelectorAll("input[type=file]")].find((el) => !el.closest(".ck"));
    return fileInput ? fileInput.closest("[data-garden-id='forms.field']") || fileInput.parentElement.parentElement : null;
  }

  function counts() {
    const form = getForm();
    const field = getField();
    const uploaded = form
      ? [...form.querySelectorAll(`input[type=hidden][name="${fieldName}"]`)].map((el) => {
          try {
            return JSON.parse(el.value).file_name || "";
          } catch (e) {
            return "";
          }
        })
      : [];
    const list = field && field.querySelector("[data-garden-id='forms.file_list']");
    const listed = list ? list.querySelectorAll(":scope > li").length : 0;
    return {
      images: uploaded.filter(isImage).length,
      others: uploaded.filter((n) => !isImage(n)).length,
      pending: Math.max(0, listed - uploaded.length),
    };
  }

  function problem(c) {
    if (c.pending) return "Aguarde o envio dos arquivos terminar.";
    if (c.images < cfg.minImages) {
      const missing = cfg.minImages - c.images;
      return `Anexe pelo menos ${cfg.minImages} imagens do produto (falta${missing > 1 ? "m" : ""} ${missing}).`;
    }
    return null;
  }

  function refresh() {
    const field = getField();
    if (!field) return;
    // Decora o campo (o React pode recriá-lo, então confere a cada mudança)
    const label = field.querySelector("label");
    if (label && !label.contains(asterisk)) label.appendChild(asterisk);
    if (label && label.nextElementSibling !== hint) label.after(hint);
    if (field.lastElementChild !== counter) field.appendChild(counter);

    const c = counts();
    const error = attempted ? problem(c) : null;
    const ok = c.images >= cfg.minImages && !c.pending;
    let text = `${Math.min(c.images, cfg.minImages)} / ${cfg.minImages} imagens`;
    if (c.images > cfg.minImages) text = `${c.images} imagens`;
    if (ok) text = `✓ ${text}`;
    if (c.others) text += ` · ${c.others} outro${c.others > 1 ? "s" : ""} arquivo${c.others > 1 ? "s" : ""}`;
    if (c.pending) text += ` · enviando ${c.pending}…`;
    const message = error || text;
    if (counter.textContent !== message) counter.textContent = message;
    counter.classList.toggle("dvp-att-counter--ok", ok);
    counter.classList.toggle("dvp-att-counter--error", Boolean(error));
    field.classList.toggle("dvp-att-invalid", Boolean(error));
  }

  // Captura no document: roda antes do onSubmit do React (registrado no
  // container) e impede o envio nativo.
  document.addEventListener(
    "submit",
    (event) => {
      if (event.target !== getForm()) return;
      attempted = true;
      if (!problem(counts())) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      refresh();
      const field = getField();
      if (field) {
        field.scrollIntoView({ behavior: "smooth", block: "center" });
        const dropzone = field.querySelector("[data-garden-id='forms.file_upload']");
        if (dropzone) dropzone.focus({ preventScroll: true });
      }
    },
    true
  );

  return { refresh };
}
