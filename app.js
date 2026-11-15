// Standard-Datenbank (kannst du hier direkt im Code erweitern oder über die App hinzufügen)
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
        front: "x₁,₂ = -p/2 ± √((p/2)² - q)",
        back: "p-q-Formel (Quadratische Gleichungen)",
        details: "Löst Gleichungen der Form: x² + px + q = 0"
    },
    {
        id: 4,
        subject: "physik",
        type: "formula",
        front: "F = m · a",
        back: "2. Newtonsches Gesetz (Grundgleichung der Mechanik)",
        details: "F = Kraft [N], m = Masse [kg], a = Beschleunigung [m/s²]"
    },
    {
        id: 5,
        subject: "chemie",
        type: "formula",
        front: "n = m / M",
        back: "Stoffmenge berechnen",
        details: "n = Stoffmenge [mol], m = Masse [g], M = Molare Masse [g/mol]"
    }
];

// Daten aus localStorage laden oder Standarddaten nutzen
let entries = JSON.parse(localStorage.getItem('schulhub_data')) || defaultData;
let currentSubject = 'alle';
let searchQuery = '';

const contentGrid = document.getElementById('content-grid');
const searchInput = document.getElementById('search-input');
const tabs = document.querySelectorAll('.tab');
const modal = document.getElementById('modal');
const addBtn = document.getElementById('add-btn');
const closeModal = document.getElementById('close-modal');
const entryForm = document.getElementById('entry-form');

// Karten rendern
function renderEntries() {
    contentGrid.innerHTML = '';

    const filtered = entries.filter(item => {
        const matchesSubject = currentSubject === 'alle' || item.subject === currentSubject;
        const matchesSearch = 
            item.front.toLowerCase().includes(searchQuery) ||
            item.back.toLowerCase().includes(searchQuery) ||
            item.details.toLowerCase().includes(searchQuery);
        return matchesSubject && matchesSearch;
    });

    if (filtered.length === 0) {
        contentGrid.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1; text-align: center; padding: 40px;">Keine Einträge gefunden.</p>`;
        return;
    }

    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';

        if (item.type === 'vocab') {
            card.innerHTML = `
                <span class="card-badge">${item.subject} • Vokabel</span>
                <div class="card-front">${item.front}</div>
                <div class="card-back vocab-hidden">${item.back}</div>
                <div class="card-details vocab-hidden">${item.details}</div>
                <div class="hint-text">Tippen zum Aufdecken</div>
            `;
            // Klick deckt Vokabel auf/zu
            card.addEventListener('click', () => {
                card.querySelectorAll('.vocab-hidden').forEach(el => el.classList.toggle('vocab-hidden'));
            });
        } else {
            card.innerHTML = `
                <span class="card-badge">${item.subject} • Formel</span>
                <div class="card-back" style="font-weight: 600;">${item.back}</div>
                <div class="formula-box">${item.front}</div>
                <div class="card-details">${item.details}</div>
            `;
        }

        contentGrid.appendChild(card);
    });
}

// Filter & Suche Events
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentSubject = tab.dataset.subject;
        renderEntries();
    });
});

searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderEntries();
});

// Modal Steuerung
addBtn.addEventListener('click', () => modal.classList.remove('hidden'));
closeModal.addEventListener('click', () => modal.classList.add('hidden'));

entryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newEntry = {
        id: Date.now(),
        subject: document.getElementById('entry-subject').value,
        type: document.getElementById('entry-type').value,
        front: document.getElementById('entry-front').value,
        back: document.getElementById('entry-back').value,
        details: document.getElementById('entry-details').value
    };

    entries.unshift(newEntry);
    localStorage.setItem('schulhub_data', JSON.stringify(entries));
    entryForm.reset();
    modal.classList.add('hidden');
    renderEntries();
});

// Service Worker für PWA registrieren
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(() => console.log('Service Worker aktiv'))
        .catch(err => console.error('SW Fehler:', err));
}

// Initiales Laden
renderEntries();
