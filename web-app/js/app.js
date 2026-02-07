/**
 * Validated Names Web App - Main Logic
 */

const App = {
    data: [],

    init: async () => {
        console.log("Initializing App...");
        await App.loadData();
        App.bindEvents();
        // Run initial selection with defaults
        App.handleSelection();
    },

    loadData: async () => {
        try {
            const response = await fetch('data/full_data.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            App.data = await response.json();
            console.log(`Loaded ${App.data.length} records.`);
            document.getElementById('status-msg').textContent = `Loaded ${App.data.length} validated names.`;
        } catch (e) {
            console.error("Failed to load data:", e);
            document.getElementById('status-msg').textContent = "Error loading data.";
            document.getElementById('status-msg').style.color = "red";
        }
    },

    bindEvents: () => {
        document.getElementById('selection-form').addEventListener('submit', (e) => {
            e.preventDefault();
            App.handleSelection();
        });

        document.getElementById('download-csv').addEventListener('click', App.downloadCSV);
    },

    handleSelection: () => {
        const formData = new FormData(document.getElementById('selection-form'));

        const params = {
            race: formData.get('race'),
            pctCorrect: parseFloat(formData.get('pct_correct')),
            nNames: parseInt(formData.get('n_names')),
            mode: formData.get('mode'),
            orderBy: formData.get('order_by') || null,
            attributes: formData.getAll('attributes')
        };

        // If sorting is selected, mode is ignored visually, but we pass it anyway.
        if (params.orderBy === "none") params.orderBy = null;

        const results = Selection.selectNames(App.data, params);
        App.renderResults(results);
        App.currentResults = results; // Store for download
    },

    renderResults: (results) => {
        const tbody = document.getElementById('results-body');
        tbody.innerHTML = '';

        if (results.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center p-4">No names found matching criteria.</td></tr>';
            return;
        }

        results.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.name}</td>
                <td>${item.identity}</td>
                <td>${(item.mean_correct * 100).toFixed(1)}%</td>
                <td>${(item.avg_income || 0).toFixed(2)}</td>
                <td>${(item.avg_education || 0).toFixed(2)}</td>
                <td>${(item.avg_citizenship * 100 || 0).toFixed(1)}%</td>
            `;
            tbody.appendChild(tr);
        });

        document.getElementById('result-count').textContent = `${results.length} names selected`;
    },

    downloadCSV: () => {
        if (!App.currentResults || App.currentResults.length === 0) {
            alert("No results to download.");
            return;
        }

        const headers = ["Name", "Identity", "Avg Correct", "Avg Income", "Avg Education", "Avg Citizenship"];
        const rows = App.currentResults.map(item => [
            item.name,
            item.identity,
            item.mean_correct,
            item.avg_income,
            item.avg_education,
            item.avg_citizenship
        ]);

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "validated_names_selection.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

window.addEventListener('DOMContentLoaded', App.init);
