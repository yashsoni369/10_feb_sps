const mongoose = require('mongoose');

jest.mock('mongoose', () => ({
    connect: jest.fn(),
}));

describe('config/db.mongo.js', () => {
    const ORIGINAL_ENV = process.env;
    let consoleInfoSpy;
    let consoleLogSpy;

    beforeEach(() => {
        jest.resetModules();
        mongoose.connect.mockReset();
        process.env = {
            ...ORIGINAL_ENV,
            DB_USER: 'testuser',
            DB_PASS: 'testpass',
            DB_SERVER: 'localhost:27017',
        };
        consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        process.env = ORIGINAL_ENV;
        consoleInfoSpy.mockRestore();
        consoleLogSpy.mockRestore();
    });

    function loadDbModule() {
        jest.doMock('mongoose', () => mongoose);
        require('../config/db.mongo');
    }

    test('should call mongoose.connect with correct URI built from env vars', async () => {
        const expectedUri = 'mongodb://testuser:testpass@localhost:27017/suhradam_PROD?authMechanism=DEFAULT&authSource=admin';
        mongoose.connect.mockResolvedValueOnce();

        loadDbModule();
        await new Promise(resolve => setImmediate(resolve));

        expect(mongoose.connect).toHaveBeenCalledWith(
            expectedUri,
            expect.objectContaining({
                useNewUrlParser: true,
                useUnifiedTopology: true,
            })
        );
    });

    test('should pass useNewUrlParser and useUnifiedTopology options', async () => {
        mongoose.connect.mockResolvedValueOnce();

        loadDbModule();
        await new Promise(resolve => setImmediate(resolve));

        const options = mongoose.connect.mock.calls[0][1];
        expect(options).toEqual({
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });

    test('should log success message on successful connection', async () => {
        mongoose.connect.mockResolvedValueOnce();

        loadDbModule();
        await new Promise(resolve => setImmediate(resolve));

        expect(consoleInfoSpy).toHaveBeenCalledWith(
            expect.stringContaining('Database Connected')
        );
        expect(consoleInfoSpy).toHaveBeenCalledWith(
            expect.stringContaining('testuser')
        );
        expect(consoleInfoSpy).toHaveBeenCalledWith(
            expect.stringContaining('suhradam_PROD')
        );
    });

    test('should log error on failed connection', async () => {
        const mockError = new Error('Connection failed');
        mongoose.connect.mockRejectedValueOnce(mockError);

        loadDbModule();
        await new Promise(resolve => setImmediate(resolve));

        expect(consoleLogSpy).toHaveBeenCalledWith('DB Connection Error ', mockError);
    });

    test('should use DB_USER env variable in the connection URI', async () => {
        process.env.DB_USER = 'customuser';
        mongoose.connect.mockResolvedValueOnce();

        loadDbModule();
        await new Promise(resolve => setImmediate(resolve));

        const uri = mongoose.connect.mock.calls[0][0];
        expect(uri).toContain('customuser');
    });

    test('should use DB_PASS env variable in the connection URI', async () => {
        process.env.DB_PASS = 'secretpass';
        mongoose.connect.mockResolvedValueOnce();

        loadDbModule();
        await new Promise(resolve => setImmediate(resolve));

        const uri = mongoose.connect.mock.calls[0][0];
        expect(uri).toContain('secretpass');
    });

    test('should use DB_SERVER env variable in the connection URI', async () => {
        process.env.DB_SERVER = 'mydbhost:27018';
        mongoose.connect.mockResolvedValueOnce();

        loadDbModule();
        await new Promise(resolve => setImmediate(resolve));

        const uri = mongoose.connect.mock.calls[0][0];
        expect(uri).toContain('mydbhost:27018');
    });

    test('should target suhradam_PROD database with correct auth params', async () => {
        mongoose.connect.mockResolvedValueOnce();

        loadDbModule();
        await new Promise(resolve => setImmediate(resolve));

        const uri = mongoose.connect.mock.calls[0][0];
        expect(uri).toContain('/suhradam_PROD');
        expect(uri).toContain('authMechanism=DEFAULT');
        expect(uri).toContain('authSource=admin');
    });
});
