document.addEventListener('DOMContentLoaded', () => {
    let currentMode = 'amortized';

    // -------------------------------------------------------------
    // 1. DARK MODE LOGIC (Direct DOM Attribute)
    // -------------------------------------------------------------
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');
    const themeLabel = document.getElementById('themeLabel');

    const savedTheme = localStorage.getItem('calc-theme') || 'light';
    applyTheme(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const activeTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(activeTheme);
    });

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('calc-theme', theme);
        if (theme === 'dark') {
            themeIcon.textContent = '☀️';
            themeLabel.textContent = 'Light Mode';
        } else {
            themeIcon.textContent = '🌙';
            themeLabel.textContent = 'Dark Mode';
        }
    }

    // -------------------------------------------------------------
    // 2. DOM ELEMENTS
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
    // 3. TAB SWITCHING
    // -------------------------------------------------------------
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
            updateModeUI();
        });
    });

    function updateModeUI() {
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
    // 4. FINANCIAL FORMULAS
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
    // 5. CALCULATE ACTION HANDLER
    // -------------------------------------------------------------
    calculatorForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearError();

        // Get numbers
        const P = parseFloat(document.getElementById('principalInput').value);
        const r = parseFloat(document.getElementById('rateInput').value);
        const t = parseFloat(document.getElementById('termInput').value);
        const n = parseInt(document.getElementById('compoundFreq').value, 10) || 12;

        // Validations
        if (isNaN(P) || P <= 0) return showError('Please enter a valid Principal amount greater than 0.');
        if (isNaN(r) || r <= 0) return showError('Please enter a valid Interest Rate greater than 0.');
        if (isNaN(t) || t <= 0) return showError('Please enter a valid Term in years greater than 0.');

        // Compute based on active tab
        if (currentMode === 'amortized') {
            const loan = calcAmortizedLoan(P, r, t);
            displaySingleResult('Estimated Monthly Payment', loan.monthlyPayment, P, loan.interest, loan.totalPaid);
        } else if (currentMode === 'simple') {
            const simple = calcSimpleInterest(P, r, t);
            displaySingleResult('Total Future Balance', simple.total, P, simple.interest, simple.total);
        } else if (currentMode === 'compound') {
            const compound = calcCompoundInterest(P, r, t, n);
            displaySingleResult('Total Future Balance', compound.total, P, compound.interest, compound.total);
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
    // 6. UI RENDER HELPERS
    // -------------------------------------------------------------
    function displaySingleResult(label, primaryVal, principal, interest, total) {
        compareResultContainer.classList.add('hidden');
        singleResultContainer.classList.remove('hidden');

        primaryMetricLabel.textContent = label;
        primaryMetricValue.textContent = formatCurrency(primaryVal);
        metricPrincipal.textContent = formatCurrency(principal);
        metricInterest.textContent = formatCurrency(interest);
        metricTotal.textContent = formatCurrency(total);

        const principalPct = Math.min(100, Math.max(0, (principal / total) * 100));
        const interestPct = Math.min(100, Math.max(0, (interest / total) * 100));

        principalBar.style.width = `${principalPct}%`;
        interestBar.style.width = `${interestPct}%`;
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
