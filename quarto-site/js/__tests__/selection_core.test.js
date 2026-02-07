const core = require('../selection_core');

describe('selection_core', () => {
  const sample = [
    {name: 'A', identity: 'Asian', mean_correct: 0.9, income: 3, education: 3, citizen: 0.9},
    {name: 'B', identity: 'Asian', mean_correct: 0.85, income: 2, education: 2, citizen: 0.8},
    {name: 'C', identity: 'White', mean_correct: 0.9, income: 4, education: 4, citizen: 0.95},
    {name: 'D', identity: 'White', mean_correct: 0.92, income: 3, education: 3, citizen: 0.9}
  ];

  test('computeMedianVector returns medians', () => {
    const med = core.computeMedianVector(sample, ['income','education','citizen']);
    expect(med.income).toBeDefined();
    expect(med.education).toBeDefined();
  });

  test('attrDistanceVector non-negative', () => {
    const med = core.computeMedianVector(sample, ['income','education']);
    const d = core.attrDistanceVector(sample[0], med, ['income','education']);
    expect(d).toBeGreaterThanOrEqual(0);
  });

  test('selectByMode control returns items close to median', () => {
    const out = core.selectByMode(sample, {race: 'Asian', pct_correct: 0.8, n_names: 1, mode: 'control', attrs: ['income','education']});
    expect(out.length).toBe(1);
    expect(['A','B']).toContain(out[0].name);
  });

  test('selectByMode vary returns items that can be furthest', () => {
    const out = core.selectByMode(sample, {race: 'White', pct_correct: 0.8, n_names: 1, mode: 'vary', attrs: ['income']});
    expect(out.length).toBe(1);
    expect(['C','D']).toContain(out[0].name);
  });
});
