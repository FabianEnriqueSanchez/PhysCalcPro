// ===== NAV TOGGLE =====
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.navbar nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('active'));
    nav.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => nav.classList.remove('active'))
    );
  }
});

// ===== TABS =====
function initTabs() {
  const tabs = document.querySelectorAll('.calc-tab');
  const panels = document.querySelectorAll('.calc-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.target).classList.add('active');
    });
  });
}

// ===== UTILITY =====
function getVal(id) {
  const v = parseFloat(document.getElementById(id).value);
  return isNaN(v) ? null : v;
}
function isEmpty(id) { return document.getElementById(id).value.trim() === ''; }
function formatNum(n) {
  if (!isFinite(n)) return '---';
  return Number.isInteger(n) ? n.toString() : n.toFixed(4).replace(/\.?0+$/, '');
}

// ===== FIELD ERRORS =====
function setFieldError(id, msg) {
  const input = document.getElementById(id);
  const group = input.closest('.form-group');
  input.classList.add('input-error');
  let el = group.querySelector('.field-error-msg');
  if (!el) { el = document.createElement('div'); el.className = 'field-error-msg'; group.appendChild(el); }
  el.textContent = msg;
}
function clearFieldError(id) {
  const input = document.getElementById(id);
  input.classList.remove('input-error');
  const el = input.closest('.form-group').querySelector('.field-error-msg');
  if (el) el.remove();
}

// ===== BUTTON STATE =====
function setBtn(panelId, enabled, text) {
  const btn = document.querySelector(`#${panelId} .btn-calc`);
  if (!btn) return;
  btn.disabled = !enabled;
  if (text) btn.textContent = text;
}

// ===== RESULT BOX =====
function showResult(panelId, label, value, unit, detail) {
  const box = document.querySelector(`#${panelId} .result-box`);
  box.className = 'result-box show';
  box.querySelector('.result-label').textContent = label;
  box.querySelector('.result-value').textContent = `${value} ${unit}`;
  box.querySelector('.result-detail').textContent = detail || '';
}

// ===== HISTORY =====
const MAX_HISTORY = 10;
let calcHistory = [];

function addToHistory(module, formula, result, detail) {
  calcHistory.unshift({
    module, formula, result, detail,
    time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  });
  if (calcHistory.length > MAX_HISTORY) calcHistory.pop();
  renderHistory();
}
function renderHistory() {
  const list = document.getElementById('history-list');
  const empty = document.getElementById('history-empty');
  if (!list) return;
  if (calcHistory.length === 0) { list.innerHTML = ''; if (empty) empty.style.display = 'block'; return; }
  if (empty) empty.style.display = 'none';
  list.innerHTML = calcHistory.map((h, i) => `
    <div class="history-item" style="animation-delay:${i * 0.03}s">
      <div class="history-header">
        <span class="history-module">${h.module}</span>
        <span class="history-time">${h.time}</span>
      </div>
      <div class="history-result">${h.result}</div>
      <div class="history-detail">${h.detail}</div>
    </div>`).join('');
}
function clearHistory() { calcHistory = []; renderHistory(); }

// =================================================================
//  FORMULA CONFIG — cada modulo define sus variables y como resolver
// =================================================================
const FORMULAS = {
  'panel-calor': {
    name: 'Calor',
    selectId: 'calor-solve',
    variables: {
      Q:  { id: 'calor-q',  label: 'Calor (Q)',                    unit: 'J',         positive: false, notZero: false, default: null },
      m:  { id: 'calor-m',  label: 'Masa (m)',                     unit: 'kg',        positive: true,  notZero: true,  default: null },
      c:  { id: 'calor-c',  label: 'Calor especifico (c)',         unit: 'J/(kg·°C)', positive: true,  notZero: true,  default: '4186' },
      dT: { id: 'calor-dt', label: 'Cambio de temperatura (ΔT)',   unit: '°C',        positive: false, notZero: true,  default: null }
    },
    rearranged: {
      Q:  'Q = m · c · ΔT',
      m:  'm = Q / (c · ΔT)',
      c:  'c = Q / (m · ΔT)',
      dT: 'ΔT = Q / (m · c)'
    },
    solve: {
      Q:  v => v.m * v.c * v.dT,
      m:  v => v.Q / (v.c * v.dT),
      c:  v => v.Q / (v.m * v.dT),
      dT: v => v.Q / (v.m * v.c)
    },
    btnLabels: { Q: 'Calcular Calor', m: 'Calcular Masa', c: 'Calcular Calor Especifico', dT: 'Calcular ΔT' },
    denominators: { Q: [], m: ['c', 'dT'], c: ['m', 'dT'], dT: ['m', 'c'] },
    historyDetail: (target, vals, result) => {
      const f = { Q: 'Q = m·c·ΔT', m: 'm = Q/(c·ΔT)', c: 'c = Q/(m·ΔT)', dT: 'ΔT = Q/(m·c)' };
      return f[target];
    }
  },

  'panel-presion': {
    name: 'Presion',
    selectId: 'presion-solve',
    variables: {
      P: { id: 'presion-p', label: 'Presion (P)',  unit: 'Pa', positive: true,  notZero: false, default: null },
      F: { id: 'presion-f', label: 'Fuerza (F)',   unit: 'N',  positive: true,  notZero: false, default: null },
      A: { id: 'presion-a', label: 'Area (A)',      unit: 'm²', positive: true,  notZero: true,  default: null }
    },
    rearranged: { P: 'P = F / A', F: 'F = P · A', A: 'A = F / P' },
    solve: {
      P: v => v.F / v.A,
      F: v => v.P * v.A,
      A: v => v.F / v.P
    },
    btnLabels: { P: 'Calcular Presion', F: 'Calcular Fuerza', A: 'Calcular Area' },
    denominators: { P: ['A'], F: [], A: ['P'] }
  },

  'panel-caudal-vol': {
    name: 'Caudal Vol.',
    selectId: 'caudalvol-solve',
    variables: {
      Q: { id: 'caudalvol-q', label: 'Caudal (Q)',   unit: 'm³/s', positive: true,  notZero: false, default: null },
      V: { id: 'caudalvol-v', label: 'Volumen (V)',   unit: 'm³',   positive: true,  notZero: true,  default: null },
      t: { id: 'caudalvol-t', label: 'Tiempo (t)',    unit: 's',    positive: true,  notZero: true,  default: null }
    },
    rearranged: { Q: 'Q = V / t', V: 'V = Q · t', t: 't = V / Q' },
    solve: {
      Q: v => v.V / v.t,
      V: v => v.Q * v.t,
      t: v => v.V / v.Q
    },
    btnLabels: { Q: 'Calcular Caudal', V: 'Calcular Volumen', t: 'Calcular Tiempo' },
    denominators: { Q: ['t'], V: [], t: ['Q'] }
  },

  'panel-caudal-av': {
    name: 'Caudal A×v',
    selectId: 'caudalav-solve',
    variables: {
      Q: { id: 'caudalav-q', label: 'Caudal (Q)',              unit: 'm³/s', positive: true,  notZero: false, default: null },
      A: { id: 'caudalav-a', label: 'Area de seccion (A)',      unit: 'm²',   positive: true,  notZero: true,  default: null },
      v: { id: 'caudalav-v', label: 'Velocidad del fluido (v)', unit: 'm/s',  positive: true,  notZero: true,  default: null }
    },
    rearranged: { Q: 'Q = A · v', A: 'A = Q / v', v: 'v = Q / A' },
    solve: {
      Q: v => v.A * v.v,
      A: v => v.Q / v.v,
      v: v => v.Q / v.A
    },
    btnLabels: { Q: 'Calcular Caudal', A: 'Calcular Area', v: 'Calcular Velocidad' },
    denominators: { Q: [], A: ['v'], v: ['A'] }
  },

  'panel-energia': {
    name: 'Energia Pot.',
    selectId: 'energia-solve',
    variables: {
      Ep: { id: 'ep-ep', label: 'Energia potencial (Ep)', unit: 'J',    positive: true,  notZero: false, default: null },
      m:  { id: 'ep-m',  label: 'Masa (m)',                unit: 'kg',   positive: true,  notZero: true,  default: null },
      g:  { id: 'ep-g',  label: 'Gravedad (g)',            unit: 'm/s²', positive: true,  notZero: true,  default: '9.8', max: 30 },
      h:  { id: 'ep-h',  label: 'Altura (h)',              unit: 'm',    positive: true,  notZero: false, default: null, min: 0 }
    },
    rearranged: { Ep: 'Ep = m · g · h', m: 'm = Ep / (g · h)', g: 'g = Ep / (m · h)', h: 'h = Ep / (m · g)' },
    solve: {
      Ep: v => v.m * v.g * v.h,
      m:  v => v.Ep / (v.g * v.h),
      g:  v => v.Ep / (v.m * v.h),
      h:  v => v.Ep / (v.m * v.g)
    },
    btnLabels: { Ep: 'Calcular Energia', m: 'Calcular Masa', g: 'Calcular Gravedad', h: 'Calcular Altura' },
    denominators: { Ep: [], m: ['g', 'h'], g: ['m', 'h'], h: ['m', 'g'] }
  },

  'panel-eficiencia': {
    name: 'Eficiencia',
    selectId: 'eficiencia-solve',
    variables: {
      n:  { id: 'ef-n',     label: 'Eficiencia (η)',       unit: '%', positive: true, notZero: false, default: null, max: 100 },
      Eu: { id: 'ef-util',  label: 'Energia util (Eutil)', unit: 'J', positive: true, notZero: false, default: null },
      Et: { id: 'ef-total', label: 'Energia total (Etot)', unit: 'J', positive: true, notZero: true,  default: null }
    },
    rearranged: { n: 'η = (Eutil / Etotal) × 100', Eu: 'Eutil = (η × Etotal) / 100', Et: 'Etotal = (Eutil / η) × 100' },
    solve: {
      n:  v => (v.Eu / v.Et) * 100,
      Eu: v => (v.n * v.Et) / 100,
      Et: v => (v.Eu / v.n) * 100
    },
    btnLabels: { n: 'Calcular Eficiencia', Eu: 'Calcular Energia Util', Et: 'Calcular Energia Total' },
    denominators: { n: ['Et'], Eu: [], Et: ['n'] },
    postValidate: (target, vals) => {
      // Eutil no puede superar Etotal
      if (target === 'n' && vals.Eu > vals.Et) return { field: 'ef-util', msg: 'Eutil no puede superar Etotal (conservacion de energia)' };
      if (target === 'Et' && vals.n > 100) return { field: 'ef-n', msg: 'La eficiencia no puede superar 100%' };
      return null;
    },
    postCalc: (target, result, vals) => {
      if (target === 'n') {
        if (result >= 80) return 'Excelente rendimiento';
        if (result >= 50) return 'Rendimiento aceptable';
        if (result >= 25) return 'Rendimiento bajo — requiere optimizacion';
        return 'Rendimiento critico — revision urgente';
      }
      return null;
    }
  }
};

// =================================================================
//  GENERIC ENGINE
// =================================================================

function getSolveTarget(panelId) {
  const cfg = FORMULAS[panelId];
  return document.getElementById(cfg.selectId).value;
}

// Llamada al cambiar "Resolver para"
function onSolveForChange(panelId) {
  const cfg = FORMULAS[panelId];
  const target = getSolveTarget(panelId);

  // Actualizar formula mostrada
  const formulaEl = document.querySelector(`#${panelId} .formula-display`);
  if (formulaEl) formulaEl.textContent = cfg.rearranged[target];

  // Configurar campos
  Object.entries(cfg.variables).forEach(([key, v]) => {
    const input = document.getElementById(v.id);
    const group = input.closest('.form-group');

    clearFieldError(v.id);

    if (key === target) {
      input.readOnly = true;
      input.value = '';
      input.placeholder = '= ?';
      input.classList.add('solve-target');
      group.classList.add('target-group');
    } else {
      input.readOnly = false;
      input.classList.remove('solve-target');
      group.classList.remove('target-group');
      // Restaurar default si esta vacio
      if (input.value === '' && v.default !== null) input.value = v.default;
      input.placeholder = `Ej: ${v.default || '...'}`;
    }
  });

  // Actualizar boton
  setBtn(panelId, false, cfg.btnLabels[target]);

  // Ocultar resultado previo
  const box = document.querySelector(`#${panelId} .result-box`);
  if (box) box.className = 'result-box';

  // Revalidar
  validateFormula(panelId);
}

// Validacion generica en tiempo real
function validateFormula(panelId) {
  const cfg = FORMULAS[panelId];
  const target = getSolveTarget(panelId);
  let allValid = true;

  Object.entries(cfg.variables).forEach(([key, v]) => {
    if (key === target) { clearFieldError(v.id); return; } // campo resultado, no validar

    const val = getVal(v.id);
    const empty = isEmpty(v.id);

    if (empty) {
      clearFieldError(v.id);
      allValid = false;
      return;
    }

    if (val === null) {
      setFieldError(v.id, 'Valor no valido');
      allValid = false;
      return;
    }

    // Positive constraint
    if (v.positive && val < 0) {
      setFieldError(v.id, 'No puede ser negativo');
      allValid = false;
      return;
    }

    // notZero constraint
    if (v.notZero && val === 0) {
      setFieldError(v.id, 'No puede ser cero');
      allValid = false;
      return;
    }

    // min constraint
    if (v.min !== undefined && val < v.min) {
      setFieldError(v.id, `Minimo: ${v.min}`);
      allValid = false;
      return;
    }

    // max constraint
    if (v.max !== undefined && val > v.max) {
      setFieldError(v.id, `Maximo: ${v.max}`);
      allValid = false;
      return;
    }

    // Denominador: no puede ser cero si se va a dividir entre el
    if (cfg.denominators[target] && cfg.denominators[target].includes(key) && val === 0) {
      setFieldError(v.id, 'No puede ser cero (division)');
      allValid = false;
      return;
    }

    clearFieldError(v.id);
  });

  // Post-validacion especifica del modulo
  if (allValid && cfg.postValidate) {
    const vals = {};
    Object.entries(cfg.variables).forEach(([key, v]) => {
      if (key !== target) vals[key] = getVal(v.id);
    });
    const err = cfg.postValidate(target, vals);
    if (err) { setFieldError(err.field, err.msg); allValid = false; }
  }

  setBtn(panelId, allValid);
}

// Calculo generico al presionar boton
function calcFormula(panelId) {
  const cfg = FORMULAS[panelId];
  const target = getSolveTarget(panelId);

  // Recoger valores de las entradas
  const vals = {};
  Object.entries(cfg.variables).forEach(([key, v]) => {
    if (key !== target) vals[key] = getVal(v.id);
  });

  // Calcular
  const result = cfg.solve[target](vals);

  if (!isFinite(result)) {
    showResult(panelId, 'Error', 'Resultado no valido', '', 'Verifica que los valores no generen una division por cero.');
    return;
  }

  // Escribir resultado en el campo target
  const targetInput = document.getElementById(cfg.variables[target].id);
  targetInput.value = formatNum(result);

  // Construir detalle
  const unit = cfg.variables[target].unit;
  let extra = '';
  if (cfg.postCalc) {
    const pc = cfg.postCalc(target, result, vals);
    if (pc) extra = ` — ${pc}`;
  }

  const detail = `${cfg.rearranged[target]} = ${formatNum(result)} ${unit}${extra}`;
  showResult(panelId, cfg.variables[target].label, formatNum(result), unit, detail);

  // Historial
  addToHistory(cfg.name, cfg.rearranged[target], `${formatNum(result)} ${unit}${extra}`, detail);
}

// =================================================================
//  TEMPERATURA (se mantiene independiente por su logica unica)
// =================================================================
const CERO_ABSOLUTO = { C: -273.15, F: -459.67, K: 0 };

function validateTemp() {
  const val = getVal('temp-val');
  const from = document.getElementById('temp-from').value;

  if (isEmpty('temp-val')) { clearFieldError('temp-val'); setBtn('panel-temp', false); return; }
  if (val === null) { setFieldError('temp-val', 'Valor no valido'); setBtn('panel-temp', false); return; }

  const limit = CERO_ABSOLUTO[from];
  const names = { C: '°C', F: '°F', K: 'K' };
  if (val < limit) {
    const msg = from === 'K' ? 'Kelvin no puede ser negativo (0 K = cero absoluto)' : `Minimo: ${limit} ${names[from]} (cero absoluto)`;
    setFieldError('temp-val', msg);
    setBtn('panel-temp', false);
    return;
  }

  clearFieldError('temp-val');
  setBtn('panel-temp', true);
}

function calcTemp() {
  const val = getVal('temp-val');
  const from = document.getElementById('temp-from').value;
  let C, F, K;

  if (from === 'C') { C = val; F = val * 1.8 + 32; K = val + 273.15; }
  else if (from === 'F') { C = (val - 32) / 1.8; F = val; K = C + 273.15; }
  else { K = val; C = val - 273.15; F = C * 1.8 + 32; }

  const texto = `${formatNum(C)} °C = ${formatNum(F)} °F = ${formatNum(K)} K`;
  showResult('panel-temp', 'Conversiones', '', '', '');
  document.querySelector('#panel-temp .result-value').textContent = texto;
  addToHistory('Temperatura', `${val} ${from}`, texto, '');
}

// =================================================================
//  INIT
// =================================================================
function initAll() {
  initTabs();

  // Temperatura
  ['temp-val'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.addEventListener('input', validateTemp); el.addEventListener('change', validateTemp); }
  });
  const tempSel = document.getElementById('temp-from');
  if (tempSel) tempSel.addEventListener('change', validateTemp);

  // Modulos con formula generica
  Object.keys(FORMULAS).forEach(panelId => {
    const cfg = FORMULAS[panelId];

    // Listeners en cada campo
    Object.values(cfg.variables).forEach(v => {
      const el = document.getElementById(v.id);
      if (el) {
        el.addEventListener('input', () => validateFormula(panelId));
        el.addEventListener('change', () => validateFormula(panelId));
      }
    });

    // Listener en selector "Resolver para"
    const sel = document.getElementById(cfg.selectId);
    if (sel) sel.addEventListener('change', () => onSolveForChange(panelId));

    // Estado inicial
    onSolveForChange(panelId);
  });

  // Deshabilitar boton de temperatura al inicio
  setBtn('panel-temp', false);

  renderHistory();
}

document.addEventListener('DOMContentLoaded', initAll);
