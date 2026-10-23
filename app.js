document.addEventListener('DOMContentLoaded', () => {
    let currentMode = 'amortized';

    // 1. Dark Mode Switcher
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');
    const themeLabel = document.getElementById('themeLabel');

    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });

    function setTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeIcon.textContent = '☀️';
            themeLabel.textContent = 'Light Mode';
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            themeIcon.textContent = '🌙';
            themeLabel.textContent = 'Dark Mode';
            localStorage.setItem('theme', 'light');
        }
    }

    // 2. Tab Switcher Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const formTitle = document.getElementById('formTitle');
    const labelPrincipal = document.getElementById('labelPrincipal');
    const groupCompoundFreq = document.getElementById('groupCompoundFreq');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all tabs, add to clicked tab
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Set current mode
            currentMode = btn.dataset.mode;

            // Update Form UI based on selected mode
            if (currentMode === 'amortized') {
                formTitle.textContent = 'Loan Amortization Parameters';
                labelPrincipal.textContent = 'Loan Amount / Principal ($)';
                groupCompoundFreq.classList.add('hidden');
            } else if (currentMode === 'simple') {
                formTitle.textContent = 'Simple Interest Parameters';
                labelPrincipal.textContent = 'Initial Principal ($)';
                groupCompoundFreq.classList.add('hidden');
            } else if (currentMode === 'compound') {
                formTitle.textContent = 'Compound Interest Parameters';
                labelPrincipal.textContent = 'Initial Principal ($)';
                groupCompoundFreq.classList.remove('hidden');
            } else if (currentMode === 'compare') {
                formTitle.textContent = 'Comparison Parameters';
                labelPrincipal.textContent = 'Principal Amount ($)';
                groupCompoundFreq.classList.remove('hidden');
            }
        });
    });
});
