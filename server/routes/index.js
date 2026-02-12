const apiRouter = require('./api');

module.exports = app => {
    // Hello World route
    app.get('/hello', (req, res) => {
        res.json({ message: 'Hello World!' });
    });

    app.use('/api', apiRouter);
}