document.addEventListener('DOMContentLoaded', () => {
    let currentMode = 'amortized';

    // -------------------------------------------------------------
    // UI LAYER: Dark Mode Theme Initialization
    // -------------------------------------------------------------
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const moonIcon = document.querySelector('.moon-icon');
    const sunIcon = document.querySelector('.sun-icon');
    const themeLabel = document.querySelector('.theme-label');

    // Check system preference or localStorage
    const savedTheme = localStorage.getItem('theme') || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    applyTheme(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const activeTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(activeTheme);
    });

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        if (theme === 'dark') {
            moonIcon.classList.add('hidden');
            sunIcon.classList.remove('hidden');
            themeLabel.textContent = 'Light Mode';
        } else {
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
            themeLabel.textContent = 'Dark Mode';
        }
    }

    // -------------------------------------------------------------
    // UI LAYER: DOM Elements
    // -------------------------------------------------------------
    const tabBtns = document.querySelectorAll('.tab-btn');
    const formTitle = document.getElementById('formTitle');
    const calculatorForm = document.getElementById('calculatorForm');
    const resetBtn = document.getElementById('resetBtn');
    const errorMessage = document.getElementById('errorMessage');

    const groupCompoundFreq = document.getElementById('groupCompoundFreq');
    const labelPrincipal = document.getElementById('labelPrincipal');

    const emptyState = document.getElementById('emptyState');
    const resultsDisplay = document.getElementById('resultsDisplay');
    const singleResultContainer = document.getElementById('singleResultContainer');
    const compareResultContainer = document.getElementById('compareResultContainer');

    const primaryMetricLabel = document.getElementById('primaryMetricLabel');
    const primaryMetricValue = document.getElementById('primaryMetricValue');
    const metricPrincipal = document.getElementById('metricPrincipal');
    const metricInterest = document.getElementById('metricInterest');
    const metricTotal = document.getElementById('metricTotal');

    const principalBar = document.getElementById('principalBar');
    const interestBar = document.getElementById('interestBar');
    const breakdownRatioText = document.getElementById('breakdownRatioText');

    // -------------------------------------------------------------
    // UI LAYER: Mode Switcher
    // -------------------------------------------------------------
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
            updateFormModeUI();
        });
    });

    function updateFormModeUI() {
        clearError();
        resultsDisplay.classList.add('hidden');
        emptyState.classList.remove('hidden');

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
    }

    // -------------------------------------------------------------
    // PROCESSING LAYER: Financial Logic
    // -------------------------------------------------------------
    function calcSimpleInterest(P, r, t) {
        const interest = P * (r / 100) * t;
        return { interest, total: P + interest };
    }

    function calcCompoundInterest(P, r, t, n) {
        const rateDecimal = r / 100;
        const total = P * Math.pow(1 + (rateDecimal / n), n * t);
        const interest = total - P;
        return { interest, total };
    }

    function calcAmortizedLoan(P, r, t) {
        const monthlyRate = (r / 100) / 12;
        const totalPayments = t * 12;
        const rateFactor = Math.pow(1 + monthlyRate, totalPayments);
        const monthlyPayment = (P * monthlyRate * rateFactor) / (rateFactor - 1);
        const totalPaid = monthlyPayment * totalPayments;
        const interest = totalPaid - P;
        return { monthlyPayment, interest, totalPaid };
    }

    // -------------------------------------------------------------
    // DATA & PROCESSING LAYER: Submit Handler
    // -------------------------------------------------------------
    calculatorForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearError();

        // 1. DATA LAYER: Extract values
        const P = parseFloat(document.getElementById('principalInput').value);
        const r = parseFloat(document.getElementById('rateInput').value);
        const t = parseFloat(document.getElementById('termInput').value);
        const n = parseInt(document.getElementById('compoundFreq').value, 10);

        // 2. PROCESSING LAYER: Validations
        if (isNaN(P) || P <= 0) return showError('Enter a valid principal amount greater than 0.');
        if (isNaN(r) || r <= 0) return showError('Enter a valid annual interest rate greater than 0.');
        if (isNaN(t) || t <= 0) return showError('Enter a valid term in years.');

        // 3. PROCESSING & UI LAYER RENDER
        if (currentMode === 'amortized') {
            const loan = calcAmortizedLoan(P, r, t);
            renderSingleResult('Estimated Monthly Payment', loan.monthlyPayment, P, loan.interest, loan.totalPaid);
        } else if (currentMode === 'simple') {
            const simple = calcSimpleInterest(P, r, t);
            renderSingleResult('Total Future Balance', simple.total, P, simple.interest, simple.total);
        } else if (currentMode === 'compound') {
            const compound = calcCompoundInterest(P, r, t, n);
            renderSingleResult('Total Future Balance', compound.total, P, compound.interest, compound.total);
        } else if (currentMode === 'compare') {
            const simple = calcSimpleInterest(P, r, t);
            const compound = calcCompoundInterest(P, r, t, n);
            const loan = calcAmortizedLoan(P, r, t);

            document.getElementById('compSimpleInterest').textContent = formatCurrency(simple.interest);
            document.getElementById('compSimpleTotal').textContent = formatCurrency(simple.total);

            document.getElementById('compCompoundInterest').textContent = formatCurrency(compound.interest);
            document.getElementById('compCompoundTotal').textContent = formatCurrency(compound.total);

            document.getElementById('compAmortizedInterest').textContent = formatCurrency(loan.interest);
            document.getElementById('compAmortizedTotal').textContent = formatCurrency(loan.totalPaid);

            singleResultContainer.classList.add('hidden');
            compareResultContainer.classList.remove('hidden');
        }

        emptyState.classList.add('hidden');
        resultsDisplay.classList.remove('hidden');
    });

    // Reset Handler
    resetBtn.addEventListener('click', () => {
        calculatorForm.reset();
        clearError();
        resultsDisplay.classList.add('hidden');
        emptyState.classList.remove('hidden');
    });

    // -------------------------------------------------------------
    // UI LAYER Helpers
    // -------------------------------------------------------------
    function renderSingleResult(label, primaryVal, principal, interest, total) {
        compareResultContainer.classList.add('hidden');
        singleResultContainer.classList.remove('hidden');

        primaryMetricLabel.textContent = label;
        primaryMetricValue.textContent = formatCurrency(primaryVal);
        metricPrincipal.textContent = formatCurrency(principal);
        metricInterest.textContent = formatCurrency(interest);
        metricTotal.textContent = formatCurrency(total);

        const principalPercent = (principal / total) * 100;
        const interestPercent = (interest / total) * 100;

        principalBar.style.width = `${principalPercent.toFixed(1)}%`;
        interestBar.style.width = `${interestPercent.toFixed(1)}%`;
        breakdownRatioText.textContent = `${principalPercent.toFixed(0)}% / ${interestPercent.toFixed(0)}%`;
    }

    function formatCurrency(val) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    }

    function showError(msg) {
        errorMessage.textContent = msg;
        errorMessage.classList.remove('hidden');
    }

    function clearError() {
        errorMessage.textContent = '';
        errorMessage.classList.add('hidden');
    }
});
