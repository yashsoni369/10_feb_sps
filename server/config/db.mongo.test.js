describe('db.mongo', () => {
    const originalEnv = process.env;
    let mongoose;

    beforeEach(() => {
        jest.resetModules();
        process.env = {
            ...originalEnv,
            DB_USER: 'testuser',
            DB_PASS: 'testpass',
            DB_SERVER: 'localhost:27017'
        };

        // Mock mongoose with a connect that returns a proper promise chain
        mongoose = {
            connect: jest.fn().mockReturnValue(
                Promise.resolve().then(() => {})
            )
        };
        jest.doMock('mongoose', () => mongoose);
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('should call mongoose.connect with correct URI', async () => {
        require('./db.mongo');
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(mongoose.connect).toHaveBeenCalledWith(
            expect.stringContaining('mongodb://testuser:testpass@localhost:27017/suhradam_PROD'),
            expect.objectContaining({
                useNewUrlParser: true,
                useUnifiedTopology: true
            })
        );
    });

    it('should use environment variables for connection string', async () => {
        require('./db.mongo');
        await new Promise(resolve => setTimeout(resolve, 100));

        const connectionUri = mongoose.connect.mock.calls[0][0];
        expect(connectionUri).toContain('testuser');
        expect(connectionUri).toContain('testpass');
        expect(connectionUri).toContain('localhost:27017');
    });

    it('should include authMechanism and authSource in URI', async () => {
        require('./db.mongo');
        await new Promise(resolve => setTimeout(resolve, 100));

        const connectionUri = mongoose.connect.mock.calls[0][0];
        expect(connectionUri).toContain('authMechanism=DEFAULT');
        expect(connectionUri).toContain('authSource=admin');
    });

    it('should handle connection error gracefully', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        mongoose.connect.mockReturnValue(
            Promise.reject(new Error('Connection failed'))
        );

        require('./db.mongo');
        await new Promise(resolve => setTimeout(resolve, 100));

        consoleSpy.mockRestore();
        // Should not throw - error is caught in .catch()
    });

    it('should pass useNewUrlParser option', async () => {
        require('./db.mongo');
        await new Promise(resolve => setTimeout(resolve, 100));

        const options = mongoose.connect.mock.calls[0][1];
        expect(options.useNewUrlParser).toBe(true);
    });

    it('should pass useUnifiedTopology option', async () => {
        require('./db.mongo');
        await new Promise(resolve => setTimeout(resolve, 100));

        const options = mongoose.connect.mock.calls[0][1];
        expect(options.useUnifiedTopology).toBe(true);
    });
});
