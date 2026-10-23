document.addEventListener('DOMContentLoaded', () => {
    let currentMode = 'amortized';

    // -------------------------------------------------------------
    // 1. DARK MODE SWITCHER (Verified Working Logic)
    // -------------------------------------------------------------
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
            if (themeIcon) themeIcon.textContent = '☀️';
            if (themeLabel) themeLabel.textContent = 'Light Mode';
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            if (themeIcon) themeIcon.textContent = '🌙';
            if (themeLabel) themeLabel.textContent = 'Dark Mode';
            localStorage.setItem('theme', 'light');
        }
    }

    // -------------------------------------------------------------
    // 2. UI LAYER: DOM Elements
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

    // -------------------------------------------------------------
    // 3. UI LAYER: Tab Switcher Logic
    // -------------------------------------------------------------
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
            updateFormModeUI();
        });
    });

    function updateFormModeUI() {
        clearError();
        if (resultsDisplay) resultsDisplay.classList.add('hidden');
        if (emptyState) emptyState.classList.remove('hidden');

        if (currentMode === 'amortized') {
            if (formTitle) formTitle.textContent = 'Loan Amortization Parameters';
            if (labelPrincipal) labelPrincipal.textContent = 'Loan Amount / Principal ($)';
            if (groupCompoundFreq) groupCompoundFreq.classList.add('hidden');
        } else if (currentMode === 'simple') {
            if (formTitle) formTitle.textContent = 'Simple Interest Parameters';
            if (labelPrincipal) labelPrincipal.textContent = 'Initial Principal ($)';
            if (groupCompoundFreq) groupCompoundFreq.classList.add('hidden');
        } else if (currentMode === 'compound') {
            if (formTitle) formTitle.textContent = 'Compound Interest Parameters';
            if (labelPrincipal) labelPrincipal.textContent = 'Initial Principal ($)';
            if (groupCompoundFreq) groupCompoundFreq.classList.remove('hidden');
        } else if (currentMode === 'compare') {
            if (formTitle) formTitle.textContent = 'Comparison Parameters';
            if (labelPrincipal) labelPrincipal.textContent = 'Principal Amount ($)';
            if (groupCompoundFreq) groupCompoundFreq.classList.remove('hidden');
        }
    }

    // -------------------------------------------------------------
    // 4. PROCESSING LAYER: Financial Formulas
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
    // 5. DATA & PROCESSING LAYER: Submit Handler & Validations
    // -------------------------------------------------------------
    if (calculatorForm) {
        calculatorForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearError();

            const rawP = document.getElementById('principalInput')?.value;
            const rawR = document.getElementById('rateInput')?.value;
            const rawT = document.getElementById('termInput')?.value;
            const rawN = document.getElementById('compoundFreq')?.value;

            const P = parseFloat(rawP);
            const r = parseFloat(rawR);
            const t = parseFloat(rawT);
            const n = parseInt(rawN, 10) || 12;

            if (!rawP || isNaN(P) || P <= 0) return showError('Please enter a valid principal amount greater than 0.');
            if (!rawR || isNaN(r) || r <= 0) return showError('Please enter a valid annual interest rate greater than 0.');
            if (!rawT || isNaN(t) || t <= 0) return showError('Please enter a valid term in years greater than 0.');

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

                if (singleResultContainer) singleResultContainer.classList.add('hidden');
                if (compareResultContainer) compareResultContainer.classList.remove('hidden');
            }

            if (emptyState) emptyState.classList.add('hidden');
            if (resultsDisplay) resultsDisplay.classList.remove('hidden');
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (calculatorForm) calculatorForm.reset();
            clearError();
            if (resultsDisplay) resultsDisplay.classList.add('hidden');
            if (emptyState) emptyState.classList.remove('hidden');
        });
    }

    // -------------------------------------------------------------
    // 6. UI LAYER Helpers
    // -------------------------------------------------------------
    function renderSingleResult(label, primaryVal, principal, interest, total) {
        if (compareResultContainer) compareResultContainer.classList.add('hidden');
        if (singleResultContainer) singleResultContainer.classList.remove('hidden');

        if (primaryMetricLabel) primaryMetricLabel.textContent = label;
        if (primaryMetricValue) primaryMetricValue.textContent = formatCurrency(primaryVal);
        if (metricPrincipal) metricPrincipal.textContent = formatCurrency(principal);
        if (metricInterest) metricInterest.textContent = formatCurrency(interest);
        if (metricTotal) metricTotal.textContent = formatCurrency(total);

        const principalPercent = (principal / total) * 100;
        const interestPercent = (interest / total) * 100;

        if (principalBar) principalBar.style.width = `${Math.min(100, Math.max(0, principalPercent)).toFixed(1)}%`;
        if (interestBar) interestBar.style.width = `${Math.min(100, Math.max(0, interestPercent)).toFixed(1)}%`;
    }

    function formatCurrency(val) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    }

    function showError(msg) {
        if (errorMessage) {
            errorMessage.textContent = msg;
            errorMessage.classList.remove('hidden');
        }
    }

    function clearError() {
        if (errorMessage) {
            errorMessage.textContent = '';
            errorMessage.classList.add('hidden');
        }
    }
});
