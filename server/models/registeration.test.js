const mongoose = require('mongoose');

// Mock mongoose before requiring the model
jest.mock('mongoose', () => {
    const actualMongoose = jest.requireActual('mongoose');
    const mockModel = jest.fn();
    mockModel.schema = new actualMongoose.Schema({});
    return {
        ...actualMongoose,
        model: jest.fn().mockReturnValue(mockModel),
        connect: jest.fn().mockResolvedValue(true)
    };
});

const registerationModel = require('./registeration');

describe('Registeration Model', () => {
    it('should be defined', () => {
        expect(registerationModel).toBeDefined();
    });

    it('should call mongoose.model with correct arguments', () => {
        expect(mongoose.model).toHaveBeenCalledWith(
            'registeration',
            expect.any(Object),
            'sps_2023_registerations'
        );
    });

    it('should define the model with collection name sps_2023_registerations', () => {
        const calls = mongoose.model.mock.calls;
        const regCall = calls.find(c => c[0] === 'registeration');
        expect(regCall).toBeDefined();
        expect(regCall[2]).toBe('sps_2023_registerations');
    });

    describe('Schema fields', () => {
        let schema;

        beforeAll(() => {
            const calls = mongoose.model.mock.calls;
            const regCall = calls.find(c => c[0] === 'registeration');
            schema = regCall[1];
        });

        it('should have First Name field of type String', () => {
            expect(schema.obj['First Name']).toBeDefined();
            expect(schema.obj['First Name'].type).toBe(String);
        });

        it('should have Middle Name field of type String', () => {
            expect(schema.obj['Middle Name']).toBeDefined();
            expect(schema.obj['Middle Name'].type).toBe(String);
        });

        it('should have Last Name field of type String', () => {
            expect(schema.obj['Last Name']).toBeDefined();
            expect(schema.obj['Last Name'].type).toBe(String);
        });

        it('should have Full Name field of type String', () => {
            expect(schema.obj['Full Name']).toBeDefined();
            expect(schema.obj['Full Name'].type).toBe(String);
        });

        it('should have Mobile field of type String', () => {
            expect(schema.obj['Mobile']).toBeDefined();
            expect(schema.obj['Mobile'].type).toBe(String);
        });

        it('should have Gender field of type String', () => {
            expect(schema.obj['Gender']).toBeDefined();
            expect(schema.obj['Gender'].type).toBe(String);
        });

        it('should have Birth Date field of type String', () => {
            expect(schema.obj['Birth Date']).toBeDefined();
            expect(schema.obj['Birth Date'].type).toBe(String);
        });

        it('should have Sabha field of type String', () => {
            expect(schema.obj['Sabha']).toBeDefined();
            expect(schema.obj['Sabha'].type).toBe(String);
        });

        it('should have Ref Name field of type String', () => {
            expect(schema.obj['Ref Name']).toBeDefined();
            expect(schema.obj['Ref Name'].type).toBe(String);
        });

        it('should have FollowUp Name field of type String', () => {
            expect(schema.obj['FollowUp Name']).toBeDefined();
            expect(schema.obj['FollowUp Name'].type).toBe(String);
        });

        it('should have updatedBy field of type String', () => {
            expect(schema.obj['updatedBy']).toBeDefined();
            expect(schema.obj['updatedBy'].type).toBe(String);
        });

        it('should have isDeleted field with default false', () => {
            expect(schema.obj['isDeleted']).toBeDefined();
            expect(schema.obj['isDeleted'].type).toBe(Boolean);
            expect(schema.obj['isDeleted'].default).toBe(false);
        });

        it('should have isNew field of type Boolean', () => {
            expect(schema.obj['isNew']).toBeDefined();
            expect(schema.obj['isNew']).toBe(Boolean);
        });

        it('should have timestamps enabled', () => {
            expect(schema.options.timestamps).toBe(true);
        });
    });
});
