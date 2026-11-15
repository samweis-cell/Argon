const defaultData = [
    {
        id: 1,
        subject: "griechisch",
        type: "vocab",
        front: "ὁ λόγος",
        back: "das Wort, die Rede, die Vernunft",
        details: "Genitiv: τοῦ λόγου (o-Deklination)"
    },
    {
        id: 2,
        subject: "griechisch",
        type: "vocab",
        front: "παιδεύω",
        back: "ich erziehe, ich bilde aus",
        details: "Stammformen: παιδεύσω, ἐπαίδευσα"
    },
    {
        id: 3,
        subject: "mathe",
        type: "formula",
        front: "x_{1,2} = -\\frac{p}{2} \\pm \\sqrt{\\left(\\frac{p}{2}\\right)^2 - q}",
        back: "p-q-Formel (Quadratische Gleichungen)",
        details: "Löst Gleichungen der Form: x² + px + q = 0"
    },
    {
        id: 4,
        subject: "physik",
        type: "formula",
        front: "F = m \\cdot a",
        back: "2. Newtonsches Gesetz (Grundgleichung der Mechanik)",
        details: "F = Kraft [N], m = Masse [kg], a = Beschleunigung [m/s²]"
    },
    {
        id: 5,
        subject: "chemie",
        type: "formula",
        front: "n = \\frac{m}{M}",
        back: "Stoffmenge berechnen",
        details: "n = Stoffmenge [mol], m = Masse [g], M = Molare Masse [g/mol]"
    }
];

const subjectsConfig = [
    { id: 'griechisch', name: 'Griechisch', icon: '🏛️' },
    { id: 'mathe', name: 'Mathe', icon: '📐' },
    { id: 'physik', name: 'Physik', icon: '⚡' },
    { id: 'chemie', name: 'Chemie', icon: '🧪' }
];

let entries = JSON.parse(localStorage.getItem('argon_data')) || defaultData;
let currentSubject = null; // null = Startseite mit Kacheln
let searchQuery = '';

const mainContainer = document.getElementById('main-container');
const searchInput = document.getElementById('search-input');
const appTitle = document.getElementById('app-title');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const addBtn = document.getElementById('add-btn');
const closeModal = document.getElementById('close-modal');
const entryForm = document.getElementById('entry-form');
const entryIdInput = document.getElementById('entry-id');

function saveData() {
    localStorage.setItem('argon_data', JSON.stringify(entries));
}

// Haupt-Rendering-Funktion
function render() {
    mainContainer.innerHTML = '';

    // Wenn etwas in die Suche eingegeben wurde, zeigen wir direkt die Suchergebnisse über alle Fächer
    if (searchQuery.trim().length > 0) {
        renderSearchResults();
        return;
    }

    // Wenn kein Fach ausgewählt ist -> Zeige Fächer-Kacheln (Startseite)
    if (!currentSubject) {
        renderSubjectTiles();
    } else {
        // Zeige die Karten des ausgewählten Faches
        renderSubjectView();
    }
}

// 1. Fächer-Kacheln anzeigen
function renderSubjectTiles() {
    const grid = document.createElement('div');
    grid.className = 'subject-grid';

    subjectsConfig.forEach(subj => {
        const count = entries.filter(item => item.subject === subj.id).length;
        const tile = document.createElement('div');
        tile.className = 'subject-tile';
        tile.innerHTML = `
            <div class="icon">${subj.icon}</div>
            <h2>${subj.name}</h2>
            <p>${count} ${count === 1 ? 'Eintrag' : 'Einträge'}</p>
        `;
        tile.addEventListener('click', () => {
            currentSubject = subj.id;
            render();
        });
        grid.appendChild(tile);
    });

    mainContainer.appendChild(grid);
}

// 2. Ansicht für ein einzelnes Fach anzeigen
function renderSubjectView() {
    const subjConfig = subjectsConfig.find(s => s.id === currentSubject);
    
    // Header mit Zurück-Button
    const headerBar = document.createElement('div');
    headerBar.className = 'subject-header-bar';
    headerBar.innerHTML = `
        <button class="back-btn">← Zurück zur Übersicht</button>
        <h2 style="font-size: 1.2rem;">${subjConfig.icon} ${subjConfig.name}</h2>
    `;
    headerBar.querySelector('.back-btn').addEventListener('click', () => {
        currentSubject = null;
        render();
    });
    mainContainer.appendChild(headerBar);

    const grid = document.createElement('div');
    grid.className = 'content-grid';

    const filtered = entries.filter(item => item.subject === currentSubject);

    if (filtered.length === 0) {
        grid.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1; text-align: center; padding: 40px;">Noch keine Einträge in diesem Fach vorhanden.</p>`;
    } else {
        filtered.forEach(item => renderCard(item, grid));
    }

    mainContainer.appendChild(grid);
}

// 3. Globale Suchergebnisse anzeigen
function renderSearchResults() {
    const grid = document.createElement('div');
    grid.className = 'content-grid';

    const filtered = entries.filter(item => 
        item.front.toLowerCase().includes(searchQuery) ||
        item.back.toLowerCase().includes(searchQuery) ||
        item.details.toLowerCase().includes(searchQuery)
    );

    if (filtered.length === 0) {
        grid.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1; text-align: center; padding: 40px;">Keine Suchergebnisse gefunden.</p>`;
    } else {
        filtered.forEach(item => renderCard(item, grid));
    }

    mainContainer.appendChild(grid);
}

// Einzelne Karte generieren
function renderCard(item, container) {
    const card = document.createElement('div');
    card.className = 'card';

    const headerHTML = `
        <div class="card-header">
            <span class="card-badge">${item.subject} • ${item.type === 'vocab' ? 'Vokabel' : 'Formel'}</span>
            <div class="card-actions">
                <button class="icon-btn edit-btn" title="Bearbeiten">✏️</button>
                <button class="icon-btn delete-btn" title="Löschen">🗑️</button>
            </div>
        </div>
    `;

    if (item.type === 'vocab') {
        card.innerHTML = `
            ${headerHTML}
            <div class="card-front">${item.front}</div>
            <div class="card-back vocab-hidden">${item.back}</div>
            <div class="card-details vocab-hidden">${item.details}</div>
            <div class="hint-text">Tippen zum Aufdecken</div>
        `;
        card.addEventListener('click', (e) => {
            if (e.target.closest('.card-actions')) return;
            card.querySelectorAll('.vocab-hidden').forEach(el => el.classList.toggle('vocab-hidden'));
        });
    } else {
        card.innerHTML = `
            ${headerHTML}
            <div class="card-back" style="font-weight: 600;">${item.back}</div>
            <div class="formula-box" id="formula-${item.id}"></div>
            <div class="card-details">${item.details}</div>
        `;
        
        setTimeout(() => {
            const formulaEl = document.getElementById(`formula-${item.id}`);
            if (formulaEl && window.katex) {
                try {
                    katex.render(item.front, formulaEl, { displayMode: true, throwOnError: false });
                } catch (err) {
                    formulaEl.textContent = item.front;
                }
            }
        }, 0);
    }

    card.querySelector('.edit-btn').addEventListener('click', () => openEditModal(item));
    card.querySelector('.delete-btn').addEventListener('click', () => deleteEntry(item.id));

    container.appendChild(card);
}

function deleteEntry(id) {
    if (confirm('Möchtest du diesen Eintrag wirklich löschen?')) {
        entries = entries.filter(item => item.id !== id);
        saveData();
        render();
    }
}

function openEditModal(item) {
    modalTitle.textContent = 'Eintrag bearbeiten';
    entryIdInput.value = item.id;
    document.getElementById('entry-subject').value = item.subject;
    document.getElementById('entry-type').value = item.type;
    document.getElementById('entry-front').value = item.front;
    document.getElementById('entry-back').value = item.back;
    document.getElementById('entry-details').value = item.details;
    modal.classList.remove('hidden');
}

// Logo-Klick führt zurück zur Startseite
appTitle.addEventListener('click', () => {
    currentSubject = null;
    searchQuery = '';
    searchInput.value = '';
    render();
});

addBtn.addEventListener('click', () => {
    modalTitle.textContent = 'Neuer Eintrag';
    entryForm.reset();
    entryIdInput.value = '';
    modal.classList.remove('hidden');
});

closeModal.addEventListener('click', () => modal.classList.add('hidden'));

entryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const editId = entryIdInput.value;

    const entryData = {
        id: editId ? Number(editId) : Date.now(),
        subject: document.getElementById('entry-subject').value,
        type: document.getElementById('entry-type').value,
        front: document.getElementById('entry-front').value,
        back: document.getElementById('entry-back').value,
        details: document.getElementById('entry-details').value
    };

    if (editId) {
        const index = entries.findIndex(item => item.id === Number(editId));
        if (index !== -1) entries[index] = entryData;
    } else {
        entries.unshift(entryData);
    }

    saveData();
    entryForm.reset();
    entryIdInput.value = '';
    modal.classList.add('hidden');
    render();
});

searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    render();
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then((reg) => {
        reg.update();
    });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
            refreshing = true;
            window.location.reload();
        }
    });
}

render();
