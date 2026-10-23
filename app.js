document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');
    const themeLabel = document.getElementById('themeLabel');

    // Load saved theme from localStorage, default to 'light'
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    // Toggle theme on button click
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
});
