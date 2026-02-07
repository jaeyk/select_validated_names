async function fetchSample() {
  if (window._clientData && Array.isArray(window._clientData)) return window._clientData;
  const resp = await fetch('data/sample_names.json');
  return await resp.json();
}

function detectColumns(arr) {
  if (!arr || !arr.length) return [];
  return Object.keys(arr[0]);
}

function tryAutoMap(keys) {
  const lower = k => k.toLowerCase();
  const kset = new Set(keys.map(lower));
  const pick = (cands) => cands.map(lower).find(c => kset.has(c)) || null;
  return {
    name: pick(['name','full_name','fullname','first_last','first.last','firstlast']),
    identity: pick(['identity','res_race','res.race','race','intended_race']),
    mean_correct: pick(['mean_correct','pct_correct','pct.correct','mean.correct','meanpct','mean_pct']),
    income_ord: pick(['income_ord','income.ord','avg_income','avg.income','income']),
    education_ord: pick(['education_ord','education.ord','avg_education','avg.education','education']),
    citizen: pick(['citizen','avg_citizenship','avg.citizenship','citizenship'])
  };
}

function renderMappingControls(keys) {
  const controls = document.getElementById('mapping-controls');
  controls.innerHTML = '';
  const expected = ['name','identity','mean_correct','income_ord','education_ord','citizen'];
  expected.forEach(field => {
    const wrapper = document.createElement('div');
    wrapper.style.marginBottom = '6px';
    const label = document.createElement('label');
    label.textContent = field + ': ';
    const sel = document.createElement('select');
    sel.id = 'map-' + field;
    const emptyOpt = document.createElement('option');
    emptyOpt.value = '';
    emptyOpt.textContent = '(none)';
    sel.appendChild(emptyOpt);
    keys.forEach(k => {
      const o = document.createElement('option');
      o.value = k;
      o.textContent = k;
      sel.appendChild(o);
    });
    wrapper.appendChild(label);
    wrapper.appendChild(sel);
    controls.appendChild(wrapper);
  });
}

function showMappingArea(show = true) {
  const area = document.getElementById('mapping-area');
  if (!area) return;
  area.style.display = show ? 'block' : 'none';
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

window.selectNames = async function(race, pct_correct = 0.8, order_by_var = null, n_names = 5) {
  const data = await fetchSample();
  const rows = normalizeRows(data);

  // filter by race and pct_correct
  let candidates = rows.filter(d => d.identity && d.identity.includes(race));
  candidates = candidates.filter(d => (d.mean_correct ?? 0) >= pct_correct);

  // selection mode and attributes
  const mode = (document.querySelector('input[name="mode"]:checked') || {}).value || 'control';
  const attrs = [];
  if (document.getElementById('attr-income')?.checked) attrs.push('income');
  if (document.getElementById('attr-education')?.checked) attrs.push('education');
  if (document.getElementById('attr-citizen')?.checked) attrs.push('citizen');

  if (mode === 'control' && attrs.length > 0) {
    // choose names closest to global median across chosen attributes
    const median = computeMedianVector(rows, attrs);
    candidates.forEach(d => d._dist = attrDistanceVector(d, median, attrs));
    candidates = candidates.sort((a,b) => a._dist - b._dist).slice(0, n_names);
  } else if (mode === 'vary' && attrs.length > 0) {
    // choose names that differ from median (maximize distance)
    const median = computeMedianVector(rows, attrs);
    candidates.forEach(d => d._dist = attrDistanceVector(d, median, attrs));
    candidates = candidates.sort((a,b) => b._dist - a._dist).slice(0, n_names);
  } else {
    // fallback: existing ordering behavior
    if (!order_by_var) {
      candidates = shuffle(candidates).slice(0, n_names);
    } else {
      candidates = candidates.sort((a,b) => (b[order_by_var] ?? 0) - (a[order_by_var] ?? 0)).slice(0, n_names);
    }
  }

  return candidates.map(d => ({
    name: d.name,
    identity: d.identity,
    pct_correct: d.mean_correct ?? d.pct_correct,
    avg_income: d.income, 
    avg_education: d.education,
    avg_citizenship: d.citizen
  }));
}

window.selectNamesAll = async function(pct_correct = 0.8, order_by_var = null, n_names = 5) {
  const races = ['Asian','White','Black','Hispanic'];
  const outs = [];
  for (const r of races) {
    const sub = await window.selectNames(r, pct_correct, order_by_var, n_names);
    outs.push(...sub);
  }
  return outs;
}

function normalizeRows(data) {
  // Map incoming row keys using column map if present
  const map = window._columnMap || {};
  return (data || []).map(raw => {
    const row = {};
    // name
    row.name = raw[map.name || 'name'] ?? raw.name ?? raw.Name ?? '';
    row.identity = raw[map.identity || 'identity'] ?? raw.identity ?? raw.res_race ?? raw.res.race ?? '';
    row.mean_correct = raw[map.mean_correct || 'mean_correct'] ?? raw.mean_correct ?? raw.pct_correct ?? raw.pctCorrect ?? 0;
    row.income = raw[map.income_ord || 'income_ord'] ?? raw.income_ord ?? raw.avg_income ?? raw.income ?? null;
    row.education = raw[map.education_ord || 'education_ord'] ?? raw.education_ord ?? raw.avg_education ?? raw.education ?? null;
    row.citizen = raw[map.citizen || 'citizen'] ?? raw.citizen ?? raw.avg_citizenship ?? raw.citizenship ?? null;
    return row;
  });
}

function computeMedianVector(rows, attrs) {
  const vals = attrs.map(a => []);
  rows.forEach(r => {
    attrs.forEach((a,i) => {
      const v = attrValue(r, a);
      if (v != null && !Number.isNaN(v)) vals[i].push(Number(v));
    });
  });
  const med = {};
  attrs.forEach((a,i) => {
    const arr = vals[i].sort((x,y)=>x-y);
    if (!arr.length) med[a] = 0; else {
      const m = arr[Math.floor(arr.length/2)];
      med[a] = m;
    }
  });
  return med;
}

function attrValue(row, attr) {
  if (!row) return null;
  if (attr === 'income') return row.income;
  if (attr === 'education') return row.education;
  if (attr === 'citizen') return row.citizen;
  return null;
}

function attrDistanceVector(row, median, attrs) {
  let sum = 0;
  attrs.forEach(a => {
    const v = attrValue(row, a);
    const m = median[a] ?? 0;
    const diff = (Number(v) || 0) - (Number(m) || 0);
    sum += diff * diff;
  });
  return Math.sqrt(sum);
}

window.toCSV = function(rows) {
  if (!rows || !rows.length) return '';
  const keys = Object.keys(rows[0]);
  const lines = [keys.join(',')];
  for (const r of rows) {
    lines.push(keys.map(k => '"' + (r[k] ?? '') + '"').join(','));
  }
  return lines.join('\n');
}

window.setData = function(arr) {
  if (arr === null) {
    window._clientData = null; // use sample
    window._columnMap = null;
    showMappingArea(false);
  } else if (Array.isArray(arr)) {
    window._clientData = arr;
    // detect columns and try auto-map
    const keys = detectColumns(arr);
    const auto = tryAutoMap(keys);
    // if auto mapping has at least name and identity, set it
    if (auto.name || auto.identity) {
      // map real key names from original keys (case-insensitive)
      const map = {};
      Object.keys(auto).forEach(k => {
        if (!auto[k]) return;
        // find actual key exactly matching candidate
        const found = keys.find(x => x.toLowerCase() === auto[k]);
        map[k] = found || auto[k];
      });
      window._columnMap = map;
    } else {
      window._columnMap = null;
    }
    renderMappingControls(keys);
    showMappingArea(true);
  } else {
    throw new Error('setData expects an array or null');
  }
}

window.parseUploadedFile = async function(file) {
  const name = (file && file.name) || '';
  if (name.endsWith('.csv')) {
    return new Promise((res, rej) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: (results) => res(results.data),
        error: (err) => rej(err)
      });
    });
  }
  if (name.endsWith('.json')) {
    const txt = await file.text();
    return JSON.parse(txt);
  }
  // Excel
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, {type: 'array'});
  const first = wb.Sheets[wb.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json(first, {defval: null});
  return json;
}

window.renderTable = function(rows, container) {
  if (!rows || !rows.length) {
    container.innerHTML = '<div>No results</div>';
    return;
  }
  const keys = Object.keys(rows[0]);
  const table = document.createElement('table');
  table.style.borderCollapse = 'collapse';
  table.style.width = '100%';
  const thead = document.createElement('thead');
  const thr = document.createElement('tr');
  keys.forEach(k => {
    const th = document.createElement('th');
    th.textContent = k;
    th.style.border = '1px solid #ddd';
    th.style.padding = '6px';
    th.style.textAlign = 'left';
    thr.appendChild(th);
  });
  thead.appendChild(thr);
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  rows.forEach(r => {
    const tr = document.createElement('tr');
    keys.forEach(k => {
      const td = document.createElement('td');
      td.textContent = r[k] == null ? '' : r[k];
      td.style.border = '1px solid #eee';
      td.style.padding = '6px';
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.innerHTML = '';
  container.appendChild(table);
}

document.getElementById('apply-mapping')?.addEventListener('click', () => {
  const expected = ['name','identity','mean_correct','income_ord','education_ord','citizen'];
  const map = {};
  expected.forEach(f => {
    const sel = document.getElementById('map-' + f);
    if (sel && sel.value) map[f] = sel.value;
  });
  window._columnMap = map;
  alert('Mapping applied');
});

document.getElementById('clear-mapping')?.addEventListener('click', () => {
  window._columnMap = null;
  // reset selects
  const expected = ['name','identity','mean_correct','income_ord','education_ord','citizen'];
  expected.forEach(f => {
    const sel = document.getElementById('map-' + f);
    if (sel) sel.value = '';
  });
  alert('Mapping cleared');
});
