// Counter state
let count = 0;

// Function to update the counter display
function updateDisplay() {
    $('#counter').text(count);
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

// Document ready
$(document).ready(function() {
    // Event listeners
    $('#incrementBtn').click(increment);
    $('#decrementBtn').click(decrement);
    $('#resetBtn').click(reset);

    // Initialize display
    updateDisplay();
});
