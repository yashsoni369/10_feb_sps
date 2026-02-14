const greetController = require('../../controllers/greet.controller');

module.exports = router => {
    router.get('/greet', greetController.greet);
};
