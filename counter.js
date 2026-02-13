$(document).ready(function() {
    // Counter state
    let count = 0;

    // Get DOM elements
    const counterDisplay = $('#counter');
    const incrementBtn = $('#incrementBtn');
    const decrementBtn = $('#decrementBtn');
    const resetBtn = $('#resetBtn');

    // Function to update the counter display
    function updateDisplay() {
        counterDisplay.text(count);
    }

    // Increment function
    function increment() {
        count++;
        updateDisplay();
    }

    // Decrement function
    function decrement() {
        count--;
        updateDisplay();
    }

    // Reset function
    function reset() {
        count = 0;
        updateDisplay();
    }

    // Event listeners
    incrementBtn.on('click', increment);
    decrementBtn.on('click', decrement);
    resetBtn.on('click', reset);

    // Initialize display
    updateDisplay();
});
