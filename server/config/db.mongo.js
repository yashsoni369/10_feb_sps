const mongoose = require('mongoose');

(async () => {
    uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_SERVER}/suhradam_PROD?authMechanism=DEFAULT&authSource=admin`
    mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => console.info(`Database Connected : ${process.env.DB_USER} - suhradam_PROD`)).catch((ee) => {
console.log('DB Connection Error ',ee)
    });
})();