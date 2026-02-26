const mongoose = require('mongoose');

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

const samparkModel = require('./sampark');

describe('Sampark Model', () => {
    it('should be defined', () => {
        expect(samparkModel).toBeDefined();
    });

    it('should call mongoose.model with correct model name', () => {
        expect(mongoose.model).toHaveBeenCalledWith(
            'sampark',
            expect.any(Object)
        );
    });

    describe('Schema fields', () => {
        let schema;

        beforeAll(() => {
            const calls = mongoose.model.mock.calls;
            const samparkCall = calls.find(c => c[0] === 'sampark');
            schema = samparkCall[1];
        });

        it('should have First Name field', () => {
            expect(schema.obj['First Name']).toBeDefined();
        });

        it('should have Middle Name field', () => {
            expect(schema.obj['Middle Name']).toBeDefined();
        });

        it('should have Last Name field', () => {
            expect(schema.obj['Last Name']).toBeDefined();
        });

        it('should have Full Name field', () => {
            expect(schema.obj['Full Name']).toBeDefined();
        });

        it('should have Mobile field', () => {
            expect(schema.obj['Mobile']).toBeDefined();
        });

        it('should have Gender field', () => {
            expect(schema.obj['Gender']).toBeDefined();
        });

        it('should have Sabha field', () => {
            expect(schema.obj['Sabha']).toBeDefined();
        });

        it('should have Birth Date field', () => {
            expect(schema.obj['Birth Date']).toBeDefined();
        });

        it('should have Email field', () => {
            expect(schema.obj['Email']).toBeDefined();
        });

        it('should have Ref Name field', () => {
            expect(schema.obj['Ref Name']).toBeDefined();
        });

        it('should have FollowUp Name field', () => {
            expect(schema.obj['FollowUp Name']).toBeDefined();
        });

        it('should have Mandal Name field', () => {
            expect(schema.obj['Mandal Name']).toBeDefined();
        });

        it('should have Attending Sabha field', () => {
            expect(schema.obj['Attending Sabha']).toBeDefined();
        });

        it('should have Member Id field', () => {
            expect(schema.obj['Member Id']).toBeDefined();
        });

        it('should have Family Id field', () => {
            expect(schema.obj['Family Id']).toBeDefined();
        });

        it('should have Profile Meter as Number', () => {
            expect(schema.obj['Profile Meter']).toBe(Number);
        });

        it('should have % Present as Number', () => {
            expect(schema.obj['% Present']).toBe(Number);
        });

        it('should have Patrika field', () => {
            expect(schema.obj['Patrika']).toBeDefined();
        });

        it('should have Address field', () => {
            expect(schema.obj['Address']).toBeDefined();
        });

        it('should have PinCode field', () => {
            expect(schema.obj['PinCode']).toBeDefined();
        });

        it('should have Occupation field', () => {
            expect(schema.obj['Occupation']).toBeDefined();
        });

        it('should have Blood Group field', () => {
            expect(schema.obj['Blood Group']).toBeDefined();
        });

        it('should have timestamps enabled', () => {
            expect(schema.options.timestamps).toBe(true);
        });

        it('should have an index on Mobile and Full Name', () => {
            const indexes = schema.indexes();
            const mobileIndex = indexes.find(idx =>
                idx[0]['Mobile'] === 1 && idx[0]['Full Name'] === 1
            );
            expect(mobileIndex).toBeDefined();
        });
    });
});
