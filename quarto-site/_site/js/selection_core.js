(function(root, factory){
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.selectionCore = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function(){

  function normalizeRows(data, columnMap) {
    const map = columnMap || {};
    return (data || []).map(raw => {
      const row = {};
      row.name = raw[map.name || 'name'] ?? raw.name ?? raw.Name ?? '';
      row.identity = raw[map.identity || 'identity'] ?? raw.identity ?? raw.res_race ?? raw['res.race'] ?? '';
      row.mean_correct = raw[map.mean_correct || 'mean_correct'] ?? raw.mean_correct ?? raw.pct_correct ?? 0;
      row.income = raw[map.income_ord || 'income_ord'] ?? raw.income_ord ?? raw.avg_income ?? raw.income ?? null;
      row.education = raw[map.education_ord || 'education_ord'] ?? raw.education_ord ?? raw.avg_education ?? raw.education ?? null;
      row.citizen = raw[map.citizen || 'citizen'] ?? raw.citizen ?? raw.avg_citizenship ?? raw.citizenship ?? null;
      return row;
    });
  }

  function attrValue(row, attr) {
    if (!row) return null;
    if (attr === 'income') return row.income;
    if (attr === 'education') return row.education;
    if (attr === 'citizen') return row.citizen;
    return null;
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

  function selectByMode(rows, opts) {
    // opts: {race, pct_correct, n_names, mode('control'|'vary'|'random'), attrs: ['income',...]} 
    const {race, pct_correct = 0.8, n_names = 5, mode = 'control', attrs = [], columnMap} = opts || {};
    const data = normalizeRows(rows, columnMap);
    let candidates = data.filter(d => d.identity && d.identity.includes(race));
    candidates = candidates.filter(d => (d.mean_correct ?? 0) >= (pct_correct ?? 0));
    if ((mode === 'control' || mode === 'vary') && attrs.length > 0) {
      const median = computeMedianVector(data, attrs);
      candidates.forEach(d => d._dist = attrDistanceVector(d, median, attrs));
      if (mode === 'control') candidates = candidates.sort((a,b)=>a._dist - b._dist).slice(0, n_names);
      else candidates = candidates.sort((a,b)=>b._dist - a._dist).slice(0, n_names);
    } else {
      // random fallback
      for (let i = candidates.length -1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
      }
      candidates = candidates.slice(0, n_names);
    }
    return candidates.map(d => ({
      name: d.name, identity: d.identity, pct_correct: d.mean_correct, avg_income: d.income, avg_education: d.education, avg_citizenship: d.citizen
    }));
  }

  return {
    normalizeRows, attrValue, computeMedianVector, attrDistanceVector, selectByMode
  };
});
