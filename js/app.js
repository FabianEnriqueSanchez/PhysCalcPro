// ===== NAV TOGGLE (mobile) =====
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

// ===== CALCULATOR TABS =====
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

function showResult(panelId, label, value, unit, detail) {
  const box = document.querySelector(`#${panelId} .result-box`);
  box.querySelector('.result-label').textContent = label;
  box.querySelector('.result-value').textContent = `${value} ${unit}`;
  box.querySelector('.result-detail').textContent = detail || '';
  box.classList.add('show');
}

function formatNum(n) {
  return Number.isInteger(n) ? n.toString() : n.toFixed(4).replace(/\.?0+$/, '');
}

// ===== 1. CALOR =====
function calcCalor() {
  const m = getVal('calor-m');
  const c = getVal('calor-c');
  const dt = getVal('calor-dt');
  if (m === null || c === null || dt === null) return alert('Completa todos los campos.');
  const Q = m * c * dt;
  showResult('panel-calor', 'Calor (Q)', formatNum(Q), 'Joules',
    `Q = ${m} kg x ${c} J/(kg-°C) x ${dt} °C = ${formatNum(Q)} J`);
}

// ===== 2. TEMPERATURA =====
function calcTemp() {
  const val = getVal('temp-val');
  const from = document.getElementById('temp-from').value;
  if (val === null) return alert('Ingresa un valor de temperatura.');

  let celsius, fahrenheit, kelvin;

  if (from === 'C') {
    celsius = val;
    fahrenheit = val * 1.8 + 32;
    kelvin = val + 273.15;
  } else if (from === 'F') {
    celsius = (val - 32) / 1.8;
    fahrenheit = val;
    kelvin = celsius + 273.15;
  } else {
    celsius = val - 273.15;
    fahrenheit = celsius * 1.8 + 32;
    kelvin = val;
  }

  showResult('panel-temp', 'Conversiones', '', '',
    `${formatNum(celsius)} °C  |  ${formatNum(fahrenheit)} °F  |  ${formatNum(kelvin)} K`);
  document.querySelector('#panel-temp .result-value').textContent =
    `${formatNum(celsius)} °C = ${formatNum(fahrenheit)} °F = ${formatNum(kelvin)} K`;
}

// ===== 3. PRESION =====
function calcPresion() {
  const f = getVal('presion-f');
  const a = getVal('presion-a');
  if (f === null || a === null) return alert('Completa todos los campos.');
  if (a === 0) return alert('El area no puede ser cero.');
  const P = f / a;
  showResult('panel-presion', 'Presion (P)', formatNum(P), 'Pascales (Pa)',
    `P = ${f} N / ${a} m² = ${formatNum(P)} Pa`);
}

// ===== 4. CAUDAL VOLUMETRICO =====
function calcCaudalVol() {
  const v = getVal('caudal-v');
  const t = getVal('caudal-t');
  if (v === null || t === null) return alert('Completa todos los campos.');
  if (t === 0) return alert('El tiempo no puede ser cero.');
  const Q = v / t;
  showResult('panel-caudal-vol', 'Caudal (Q)', formatNum(Q), 'm³/s',
    `Q = ${v} m³ / ${t} s = ${formatNum(Q)} m³/s`);
}

// ===== 5. CAUDAL (AREA x VELOCIDAD) =====
function calcCaudalAV() {
  const a = getVal('caudal-a');
  const vel = getVal('caudal-vel');
  if (a === null || vel === null) return alert('Completa todos los campos.');
  const Q = a * vel;
  showResult('panel-caudal-av', 'Caudal (Q)', formatNum(Q), 'm³/s',
    `Q = ${a} m² x ${vel} m/s = ${formatNum(Q)} m³/s`);
}

// ===== 6. ENERGIA POTENCIAL =====
function calcEnergia() {
  const m = getVal('ep-m');
  const g = getVal('ep-g');
  const h = getVal('ep-h');
  if (m === null || g === null || h === null) return alert('Completa todos los campos.');
  const Ep = m * g * h;
  showResult('panel-energia', 'Energia Potencial (Ep)', formatNum(Ep), 'Joules',
    `Ep = ${m} kg x ${g} m/s² x ${h} m = ${formatNum(Ep)} J`);
}

// ===== 7. EFICIENCIA =====
function calcEficiencia() {
  const eu = getVal('ef-util');
  const et = getVal('ef-total');
  if (eu === null || et === null) return alert('Completa todos los campos.');
  if (et === 0) return alert('La energia total no puede ser cero.');
  const n = (eu / et) * 100;
  let estado = '';
  if (n >= 80) estado = 'Excelente rendimiento';
  else if (n >= 50) estado = 'Rendimiento aceptable';
  else estado = 'Rendimiento bajo - requiere optimizacion';
  showResult('panel-eficiencia', 'Eficiencia (n)', formatNum(n), '%',
    `n = (${eu} / ${et}) x 100 = ${formatNum(n)}% - ${estado}`);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', initTabs);
