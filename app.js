document.addEventListener('DOMContentLoaded', () => {
    let currentMode = 'amortized';

    const tabBtns = document.querySelectorAll('.tab-btn');
    const formTitle = document.getElementById('formTitle');
    const calculatorForm = document.getElementById('calculatorForm');
    const resetBtn = document.getElementById('resetBtn');
    const errorMessage = document.getElementById('errorMessage');

    const groupCompoundFreq = document.getElementById('groupCompoundFreq');
    const labelPrincipal = document.getElementById('labelPrincipal');

    const emptyState = document.getElementById('emptyState');
    const singleResults = document.getElementById('singleResults');
    const compareResults = document.getElementById('compareResults');

    const heroLabel = document.getElementById('heroLabel');
    const heroValue = document.getElementById('heroValue');
    const metricPrincipal = document.getElementById('metricPrincipal');
    const metricInterest = document.getElementById('metricInterest');
    const metricTotal = document.getElementById('metricTotal');

    const barPrincipal = document.getElementById('barPrincipal');
    const barInterest = document.getElementById('barInterest');

    // Tab Navigation
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
            updateMode();
        });
    });

    function updateMode() {
        clearError();
        singleResults.classList.add('hidden');
        compareResults.classList.add('hidden');
        emptyState.classList.remove('hidden');

        if (currentMode === 'amortized') {
            formTitle.textContent = 'Loan Parameters';
            labelPrincipal.textContent = 'Principal Amount ($)';
            groupCompoundFreq.classList.add('hidden');
        } else if (currentMode === 'simple') {
            formTitle.textContent = 'Simple Interest Parameters';
            labelPrincipal.textContent = 'Principal Amount ($)';
            groupCompoundFreq.classList.add('hidden');
        } else if (currentMode === 'compound') {
            formTitle.textContent = 'Compound Interest Parameters';
            labelPrincipal.textContent = 'Principal Amount ($)';
            groupCompoundFreq.classList.remove('hidden');
        } else if (currentMode === 'compare') {
            formTitle.textContent = 'Comparison Parameters';
            labelPrincipal.textContent = 'Principal Amount ($)';
            groupCompoundFreq.classList.remove('hidden');
        }
    }

    // Formulas
    function calcSimple(P, r, t) {
        const interest = P * (r / 100) * t;
        return { interest, total: P + interest };
    }

    function calcCompound(P, r, t, n) {
        const total = P * Math.pow(1 + ((r / 100) / n), n * t);
        return { interest: total - P, total };
    }

    function calcAmortized(P, r, t) {
        const monthlyRate = (r / 100) / 12;
        const totalPayments = t * 12;
        const factor = Math.pow(1 + monthlyRate, totalPayments);
        const monthlyPayment = (P * monthlyRate * factor) / (factor - 1);
        const totalPaid = monthlyPayment * totalPayments;
        return { monthlyPayment, interest: totalPaid - P, totalPaid };
    }

    // Submit Action
    calculatorForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearError();

        const P = parseFloat(document.getElementById('principalInput').value);
        const r = parseFloat(document.getElementById('rateInput').value);
        const t = parseFloat(document.getElementById('termInput').value);
        const n = parseInt(document.getElementById('compoundFreq').value, 10) || 12;

        if (isNaN(P) || P <= 0) return showError('Please enter a valid principal amount.');
        if (isNaN(r) || r <= 0) return showError('Please enter a valid interest rate.');
        if (isNaN(t) || t <= 0) return showError('Please enter a valid term.');

        if (currentMode === 'amortized') {
            const res = calcAmortized(P, r, t);
            renderSingle('Estimated Monthly Payment', res.monthlyPayment, P, res.interest, res.totalPaid);
        } else if (currentMode === 'simple') {
            const res = calcSimple(P, r, t);
            renderSingle('Total Future Balance', res.total, P, res.interest, res.total);
        } else if (currentMode === 'compound') {
            const res = calcCompound(P, r, t, n);
            renderSingle('Total Future Balance', res.total, P, res.interest, res.total);
        } else if (currentMode === 'compare') {
            const sim = calcSimple(P, r, t);
            const com = calcCompound(P, r, t, n);
            const amo = calcAmortized(P, r, t);

            document.getElementById('compSimpleInterest').textContent = fmt(sim.interest);
            document.getElementById('compSimpleTotal').textContent = fmt(sim.total);

            document.getElementById('compCompoundInterest').textContent = fmt(com.interest);
            document.getElementById('compCompoundTotal').textContent = fmt(com.total);

            document.getElementById('compAmortizedInterest').textContent = fmt(amo.interest);
            document.getElementById('compAmortizedTotal').textContent = fmt(amo.totalPaid);

            singleResults.classList.add('hidden');
            compareResults.classList.remove('hidden');
        }

        emptyState.classList.add('hidden');
    });

    resetBtn.addEventListener('click', () => {
        calculatorForm.reset();
        clearError();
        singleResults.classList.add('hidden');
        compareResults.classList.add('hidden');
        emptyState.classList.remove('hidden');
    });

    function renderSingle(label, primary, principal, interest, total) {
        compareResults.classList.add('hidden');
        singleResults.classList.remove('hidden');

        heroLabel.textContent = label;
        heroValue.textContent = fmt(primary);
        metricPrincipal.textContent = fmt(principal);
        metricInterest.textContent = fmt(interest);
        metricTotal.textContent = fmt(total);

        const pPct = Math.min(100, Math.max(0, (principal / total) * 100));
        barPrincipal.style.width = `${pPct}%`;
        barInterest.style.width = `${100 - pPct}%`;
    }

    function fmt(val) {
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
