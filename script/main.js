document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const root = document.documentElement;
    // Default to light theme. User can toggle to dark if preferred.
    const savedTheme = localStorage.getItem('theme') || 'light';
    root.setAttribute('data-theme', savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = root.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // Mobile Menu
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', () => {
            const isOpen = mobileNav.style.display === 'flex';
            mobileNav.style.display = isOpen ? 'none' : 'flex';
        });

        // Close mobile nav on link click
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.style.display = 'none';
            });
        });
    }

    // Project Filtering & Search
    const searchInput = document.getElementById('search-projects');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    let currentFilterValue = 'all';
    let currentFilterType = 'all';

    function filterProjects() {
        if (!searchInput) return;
        const searchTerm = searchInput.value.toLowerCase();
        projectCards.forEach(card => {
            const title = card.querySelector('h3').innerText.toLowerCase();
            const techs = card.getAttribute('data-tech').toLowerCase();
            const category = card.getAttribute('data-category');
            const matchesSearch = title.includes(searchTerm) || techs.includes(searchTerm);

            let matchesFilter = currentFilterValue === 'all';
            if (!matchesFilter && currentFilterType === 'category') {
                matchesFilter = category === currentFilterValue;
            } else if (!matchesFilter && currentFilterType === 'tech') {
                matchesFilter = techs.includes(currentFilterValue);
            }

            card.style.display = matchesSearch && matchesFilter ? 'block' : 'none';
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterProjects);
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilterType = btn.getAttribute('data-filter-type');
            currentFilterValue = btn.getAttribute('data-filter-value');
            filterProjects();
        });
    });

    // Modals
    const modals = document.querySelectorAll('.modal');
    const openBtns = document.querySelectorAll('.open-modal');

    openBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            document.getElementById(`modal-${id}`).classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-close') || e.target.closest('.modal-close')) {
            const modal = e.target.closest('.modal');
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modals.forEach(modal => {
                modal.classList.remove('active');
            });
            document.body.style.overflow = '';
            closeImgOverlay();
        }
    });

    // Image Overlay (Lightbox)
    const imgOverlay = document.createElement('div');
    imgOverlay.className = 'img-overlay';
    imgOverlay.innerHTML = '<img src="" alt="Preview">';
    document.body.appendChild(imgOverlay);

    const overlayImg = imgOverlay.querySelector('img');

    function closeImgOverlay() {
        imgOverlay.classList.remove('active');
    }

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-img')) {
            overlayImg.src = e.target.src;
            overlayImg.alt = e.target.alt;
            imgOverlay.classList.add('active');
        }
    });

    imgOverlay.addEventListener('click', () => {
        closeImgOverlay();
    });

    // Contribution Graph
    const graph = document.querySelector('.contribution-graph');
    if (graph) {
        const wrapper = document.createElement('div');
        wrapper.className = 'contribution-graph-wrapper';
        graph.parentNode.insertBefore(wrapper, graph);
        wrapper.appendChild(graph);

        const weeks = 14;
        const days = 7;
        for (let w = 0; w < weeks; w++) {
            for (let d = 0; d < days; d++) {
                const cell = document.createElement('div');
                cell.className = 'contrib-cell';
                const rand = Math.random();
                if (rand > 0.85) cell.classList.add('level-4');
                else if (rand > 0.65) cell.classList.add('level-3');
                else if (rand > 0.4) cell.classList.add('level-2');
                else if (rand > 0.2) cell.classList.add('level-1');
                graph.appendChild(cell);
            }
        }
    }

    // Copy Email (hero tooltip + contact section)
    const EMAIL_ADDRESS = 'davidchristianok@gmail.com';
    const CHECK_ICON = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
    `;

    async function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(text);
                return;
            } catch {
                // Permission denied or clipboard unavailable: try the legacy fallback
            }
        }

        // Fallback for older browsers / non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.setAttribute('readonly', '');
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        const copied = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (!copied) throw new Error('Copy command failed');
    }

    document.querySelectorAll('[data-copy-email]').forEach(copyBtn => {
        const originalContent = copyBtn.innerHTML;
        let resetTimer;

        copyBtn.addEventListener('click', async () => {
            clearTimeout(resetTimer);
            copyBtn.classList.remove('copy-failed');

            try {
                await copyText(EMAIL_ADDRESS);
                copyBtn.classList.add('copied');
                copyBtn.innerHTML = `${CHECK_ICON}Copied!`;
            } catch {
                copyBtn.classList.add('copy-failed');
                copyBtn.textContent = 'Failed';
            }

            resetTimer = setTimeout(() => {
                copyBtn.classList.remove('copied', 'copy-failed');
                copyBtn.innerHTML = originalContent;
            }, 2000);
        });
    });

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});
