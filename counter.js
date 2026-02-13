$(function () {
    // Counter state
    let count = 0;

    // Get DOM elements
    const $counterDisplay = $('#counter');
    const $incrementBtn = $('#incrementBtn');
    const $decrementBtn = $('#decrementBtn');
    const $resetBtn = $('#resetBtn');

    // Function to update the counter display
    const updateDisplay = () => {
        $counterDisplay.text(count);
    };

    // Event listeners
    $incrementBtn.on('click', () => {
        count++;
        updateDisplay();
    });

    $decrementBtn.on('click', () => {
        count--;
        updateDisplay();
    });

    $resetBtn.on('click', () => {
        count = 0;
        updateDisplay();
    });

    // Initialize display
    updateDisplay();
});
