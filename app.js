// Wait for DOM content to load before attaching event listeners
document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // UI LAYER: DOM Element Selections
    // -------------------------------------------------------------
    const loanForm = document.getElementById('loanForm');
    const resetBtn = document.getElementById('resetBtn');
    const errorMessage = document.getElementById('errorMessage');
    
    const emptyState = document.getElementById('emptyState');
    const resultsDisplay = document.getElementById('resultsDisplay');
    
    const monthlyPaymentEl = document.getElementById('monthlyPayment');
    const totalPrincipalEl = document.getElementById('totalPrincipal');
    const totalInterestEl = document.getElementById('totalInterest');
    const totalCostEl = document.getElementById('totalCost');
    
    const principalBar = document.getElementById('principalBar');
    const interestBar = document.getElementById('interestBar');

    // -------------------------------------------------------------
    // DATA LAYER & PROCESSING LAYER: Event Handlers & Logic
    // -------------------------------------------------------------
    loanForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent page refresh on submit
        clearError();

        // 1. DATA LAYER: Extract user inputs
        const amountInput = document.getElementById('loanAmount').value;
        const rateInput = document.getElementById('interestRate').value;
        const termInput = document.getElementById('loanTerm').value;

        // Parse numerical values
        const principal = parseFloat(amountInput);
        const annualRate = parseFloat(rateInput);
        const termYears = parseFloat(termInput);

        // 2. PROCESSING LAYER: Input Validation
        if (isNaN(principal) || principal <= 0) {
            showError('Please enter a valid loan amount greater than 0.');
            return;
        }
        if (isNaN(annualRate) || annualRate <= 0) {
            showError('Please enter a valid annual interest rate greater than 0.');
            return;
        }
        if (isNaN(termYears) || termYears <= 0 || !Number.isInteger(termYears)) {
            showError('Please enter a valid loan term in whole years.');
            return;
        }

        // 3. PROCESSING LAYER: Financial Formulas
        // Monthly interest rate = (Annual Rate / 100) / 12
        const monthlyRate = (annualRate / 100) / 12;
        // Total number of monthly payments = Term in Years * 12
        const totalPayments = termYears * 12;

        // Standard Amortization Payment Formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
        const rateFactor = Math.pow(1 + monthlyRate, totalPayments);
        const monthlyPayment = (principal * monthlyRate * rateFactor) / (rateFactor - 1);

        // Derived Totals
        const totalPaid = monthlyPayment * totalPayments;
        const totalInterest = totalPaid - principal;

        // Calculate ratios for the breakdown visual
        const principalPercentage = (principal / totalPaid) * 100;
        const interestPercentage = (totalInterest / totalPaid) * 100;

        // 4. UI LAYER: Render Output Values to the DOM
        monthlyPaymentEl.textContent = formatCurrency(monthlyPayment);
        totalPrincipalEl.textContent = formatCurrency(principal);
        totalInterestEl.textContent = formatCurrency(totalInterest);
        totalCostEl.textContent = formatCurrency(totalPaid);

        // Update CSS breakdown bar widths
        principalBar.style.width = `${principalPercentage.toFixed(1)}%`;
        interestBar.style.width = `${interestPercentage.toFixed(1)}%`;

        // Display results UI container
        emptyState.classList.add('hidden');
        resultsDisplay.classList.remove('hidden');
    });

    // Reset Form Handler
    resetBtn.addEventListener('click', () => {
        loanForm.reset();
        clearError();
        resultsDisplay.classList.add('hidden');
        emptyState.classList.remove('hidden');
    });

    // Utility Function: Format numbers as standard USD Currency
    function formatCurrency(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    }

    // Utility Function: Display UI error messages
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    }

    // Utility Function: Clear UI error messages
    function clearError() {
        errorMessage.textContent = '';
        errorMessage.classList.add('hidden');
    }
});
