$(document).ready(function() {
    let counter = 0;

    function updateDisplay() {
        $('#counterDisplay').text(counter);
    }

    $('#incrementBtn').on('click', function() {
        counter++;
        updateDisplay();
    });

    $('#decrementBtn').on('click', function() {
        counter--;
        updateDisplay();
    });

    $('#resetBtn').on('click', function() {
        counter = 0;
        updateDisplay();
    });
});
