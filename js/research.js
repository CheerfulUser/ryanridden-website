// ── Nav scroll effect ──────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ── Mobile menu toggle ─────────────────────────────────
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
    });
});

// ── Publication filters + sort ─────────────────────────
const filterBtns = document.querySelectorAll('.filter-btn');
const sortBtns = document.querySelectorAll('.sort-btn');
const pubGrid = document.getElementById('pubGrid');

let currentFilter = 'all';
let currentSort = 'default';

const originalOrder = pubGrid
    ? Array.from(pubGrid.querySelectorAll('.pub-card'))
    : [];

function applyFilterAndSort() {
    if (!pubGrid) return;
    const cards = Array.from(pubGrid.querySelectorAll('.pub-card'));

    cards.forEach(card => {
        const cats = card.dataset.category || '';
        const isStudent = card.dataset.student === 'true';
        let visible = false;
        if (currentFilter === 'all') visible = true;
        else if (currentFilter === 'student') visible = isStudent;
        else if (currentFilter === 'refereed') visible = card.dataset.refereed === 'true';
        else visible = cats.includes(currentFilter);
        card.classList.toggle('hidden', !visible);
    });

    const visible = cards.filter(c => !c.classList.contains('hidden'));
    const hidden = cards.filter(c => c.classList.contains('hidden'));

    const sorted = [...visible].sort((a, b) => {
        switch (currentSort) {
            case 'year-desc':
                return (parseInt(b.dataset.year) || 0) - (parseInt(a.dataset.year) || 0);
            case 'year-asc':
                return (parseInt(a.dataset.year) || 0) - (parseInt(b.dataset.year) || 0);
            case 'citations-desc':
                return (parseInt(b.dataset.citations) || 0) - (parseInt(a.dataset.citations) || 0);
            case 'journal-asc':
                return (a.dataset.journal || '').localeCompare(b.dataset.journal || '');
            default:
                return originalOrder.indexOf(a) - originalOrder.indexOf(b);
        }
    });

    sorted.forEach(c => pubGrid.appendChild(c));
    hidden.forEach(c => pubGrid.appendChild(c));
}

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        applyFilterAndSort();
    });
});

sortBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        sortBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentSort = btn.dataset.sort;
        applyFilterAndSort();
    });
});

// ── Fade-in on scroll ──────────────────────────────────
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.06 });

document.querySelectorAll('.pub-card, .recent-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(18px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    fadeObserver.observe(el);
});
