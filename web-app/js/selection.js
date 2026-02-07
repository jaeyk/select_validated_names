/**
 * Selection Logic for Validated Names
 * Ported from R package logic (select_names.R)
 */

const Selection = {
  /**
   * Main selection function
   * @param {Array} data - The array of name objects
   * @param {Object} params - Selection parameters
   * @param {string} params.race - Target race (Asian, Black, Hispanic, White)
   * @param {number} params.pctCorrect - Minimum threshold for correct identification (0-1)
   * @param {number} params.nNames - Number of names to select
   * @param {string} params.mode - 'control', 'vary', or 'random'
   * @param {Array} params.attributes - List of attributes to consider ['income', 'education', 'citizenship']
   * @param {string|null} params.orderBy - Attribute to sort by (e.g., 'avg_income') or null for random/distance sort
   * @returns {Array} Selected names
   */
  selectNames: (data, params) => {
    const {
      race,
      pctCorrect = 0.8,
      nNames = 5,
      mode = 'control',
      attributes = [],
      orderBy = null
    } = params;

    if (!data || data.length === 0) return [];
    
    // 1. Filter by Race
    // The R code uses str_detect(identity, race)
    let candidates = data.filter(d => d.identity && d.identity.includes(race));
    
    // 2. Filter by Pct Correct
    // The R code uses mean_correct >= pct_correct
    candidates = candidates.filter(d => (d.mean_correct !== undefined ? d.mean_correct : 0) >= pctCorrect);

    if (candidates.length === 0) return [];

    // 3. Selection Logic (Control vs Vary vs Random)
    if ((mode === 'control' || mode === 'vary') && attributes.length > 0) {
      // Calculate Median Vector for the candidate pool on selected attributes
      const medianVector = Selection.computeMedianVector(candidates, attributes);
      
      // Calculate Distance for each candidate
      candidates.forEach(d => {
        d._dist = Selection.calculateEuclideanDistance(d, medianVector, attributes);
      });
      
      // Sort by Distance
      if (mode === 'control') {
        // Minimize distance (closest to median)
        candidates.sort((a, b) => a._dist - b._dist);
      } else {
        // Maximize distance (furthest from median)
        candidates.sort((a, b) => b._dist - a._dist);
      }
    } else {
      // Random shuffle if Random mode or no attributes selected
       if (!orderBy) {
           Selection.shuffle(candidates);
       }
    }
    
    // 4. Apply Limit (n_names)
    // In R, slice_max/slice_sample happens here.
    // If orderBy is set, we sort FIRST then slice? 
    // R logic:
    // If orderBy IS NULL:
    //   -> filter -> sample(n)
    // If orderBy IS SET:
    //   -> filter -> slice_max(order_var, n)
    
    // Wait, the R logic for Control/Vary sort order seems to be implicitly handled? 
    // Actually, looking at the R code provided earlier:
    // It doesn't seem to implement Control/Vary in `select_names.R` directly!
    // The provided R file `select_names.R` only has `order_by_var` or random.
    // The `README.md` mentions Control/Vary logic and says it is in the JS site.
    // The `quarto-site/js/selection_core.js` had the Control/Vary logic.
    // I will implement the SUPERSET of features: Control/Vary (from JS) + Sort (from R).
    
    let result = [];
    
    if (orderBy) {
        // If specific sort requested, value maximization/minimization takes precedence? 
        // R's slice_max suggests getting top N by that value.
        // But if mode is Control, we might want "Close to median" AND "High Income"?
        // Let's follow the R package strictly for 'orderBy' param if present:
        // "The names will be chosen randomly. The other options are [variables]..."
        // It seems `orderBy` overrides the random selection.
        
        // However, the JS `selection_core` had `selectByMode` which handled control/vary.
        // I will combine them:
        // 1. If Control/Vary is active, we rank by Distance.
        // 2. If OrderBy is active, we rank by Attribute.
        // It's a conflict.
        // Realistically, users select Mode OR Sort.
        // I'll assume if OrderBy is Set, it overrides Mode.
        
        candidates.sort((a, b) => {
            const valA = a[orderBy] !== undefined ? a[orderBy] : -Infinity;
            const valB = b[orderBy] !== undefined ? b[orderBy] : -Infinity;
            return valB - valA; // Descending (slice_max)
        });
        
        result = candidates.slice(0, nNames);
        
    } else if ((mode === 'control' || mode === 'vary') && attributes.length > 0) {
        // Already sorted by distance above
        result = candidates.slice(0, nNames);
    } else {
        // Random
        Selection.shuffle(candidates);
        result = candidates.slice(0, nNames);
    }

    return result;
  },

  computeMedianVector: (data, attributes) => {
    const medians = {};
    attributes.forEach(attr => {
      // Map attribute names to data keys if necessary
      // In full_data.json: avg_income, avg_education, avg_citizenship
      // Our attributes param might be 'income', 'education'.
      // Need a mapping.
      const key = Selection.mapKey(attr);
      const values = data.map(d => d[key]).filter(v => v !== null && v !== undefined && !isNaN(v)).sort((a, b) => a - b);
      
      if (values.length === 0) {
        medians[attr] = 0;
      } else {
        const mid = Math.floor(values.length / 2);
        medians[attr] = values.length % 2 !== 0 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
      }
    });
    return medians;
  },

  calculateEuclideanDistance: (row, targetVector, attributes) => {
    let sumSq = 0;
    attributes.forEach(attr => {
        const key = Selection.mapKey(attr);
        const val = row[key] !== undefined ? row[key] : 0;
        const target = targetVector[attr] !== undefined ? targetVector[attr] : 0;
        sumSq += Math.pow(val - target, 2);
    });
    return Math.sqrt(sumSq);
  },
  
  mapKey: (attr) => {
      const map = {
          'income': 'avg_income',
          'education': 'avg_education',
          'citizenship': 'avg_citizenship'
      };
      return map[attr] || attr;
  },

  shuffle: (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
};

// Export for module usage (if needed) or attach to window
window.Selection = Selection;
