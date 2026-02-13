// Counter state
let count = 0;

// Get DOM elements
const counterDisplay = document.getElementById('counter');
const incrementBtn = document.getElementById('incrementBtn');
const decrementBtn = document.getElementById('decrementBtn');
const resetBtn = document.getElementById('resetBtn');

// Function to update the counter display
function updateDisplay() {
    counterDisplay.textContent = count;
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
incrementBtn.addEventListener('click', increment);
decrementBtn.addEventListener('click', decrement);
resetBtn.addEventListener('click', reset);

// Initialize display
updateDisplay();
