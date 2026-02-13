const counterValue = document.getElementById('counter-value');
const incrementButton = document.getElementById('increment-button');
const decrementButton = document.getElementById('decrement-button');

let count = 0;

function updateCounter() {
    counterValue.textContent = count;
}

incrementButton.addEventListener('click', () => {
    count++;
    updateCounter();
});

decrementButton.addEventListener('click', () => {
    count--;
    updateCounter();
});

updateCounter();
