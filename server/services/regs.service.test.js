jest.mock('../utility/logger', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn()
    },
    logRequest: jest.fn(),
    logResponseError: jest.fn()
}));

jest.mock('../models/registeration', () => {
    const model = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        countDocuments: jest.fn(),
        deleteOne: jest.fn(),
        aggregate: jest.fn()
    };
    // Make find chainable with sort
    model.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
    });
    return model;
});

jest.mock('../models/sampark', () => ({
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn(),
    distinct: jest.fn().mockResolvedValue([]),
    aggregate: jest.fn().mockResolvedValue([])
}));

jest.mock('mongoose', () => ({
    Types: {
        ObjectId: jest.fn(id => id)
    }
}));

const regsService = require('./regs.service');
const registerationModel = require('../models/registeration');
const samparkSchema = require('../models/sampark');

describe('regsService', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        mockReq = { query: {}, body: {} };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
        // Reset default mock behaviors
        registerationModel.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue([])
        });
        samparkSchema.find.mockResolvedValue([]);
        samparkSchema.distinct.mockResolvedValue([]);
        samparkSchema.aggregate.mockResolvedValue([]);
    });

    describe('mobileAutofill', () => {
        it('should return predictions when mobile number length is between 3 and 10', async () => {
            mockReq.query.mobileNo = '98765';
            const mockPredictions = [
                { 'Full Name': 'John Doe', 'Mobile': '9876543210' }
            ];
            samparkSchema.find.mockResolvedValue(mockPredictions);

            const result = await regsService.mobileAutofill(mockReq, mockRes);

            expect(result.statusCode).toBe(200);
            expect(result.message).toBe('Mobile autofill');
            expect(result.data).toEqual(mockPredictions);
        });

        it('should return 404 when mobile number is less than 3 characters', async () => {
            mockReq.query.mobileNo = '98';

            const result = await regsService.mobileAutofill(mockReq, mockRes);

            expect(result.statusCode).toBe(404);
            expect(result.message).toBe('No Data found');
        });

        it('should return 404 when mobile number is more than 10 characters', async () => {
            mockReq.query.mobileNo = '98765432101';

            const result = await regsService.mobileAutofill(mockReq, mockRes);

            expect(result.statusCode).toBe(404);
            expect(result.message).toBe('No Data found');
        });

        it('should return 404 when mobileNo is undefined', async () => {
            mockReq.query.mobileNo = undefined;

            const result = await regsService.mobileAutofill(mockReq, mockRes);

            expect(result.statusCode).toBe(404);
            expect(result.message).toBe('No Data found');
        });

        it('should return 404 when mobileNo is empty string', async () => {
            mockReq.query.mobileNo = '';

            const result = await regsService.mobileAutofill(mockReq, mockRes);

            expect(result.statusCode).toBe(404);
        });

        it('should return 500 on database error', async () => {
            mockReq.query.mobileNo = '98765';
            samparkSchema.find.mockRejectedValue(new Error('DB Error'));

            const result = await regsService.mobileAutofill(mockReq, mockRes);

            expect(result.statusCode).toBe(500);
            expect(result.message).toBe('Internal Server Error');
        });

        it('should search with regex pattern', async () => {
            mockReq.query.mobileNo = '987';
            samparkSchema.find.mockResolvedValue([]);

            await regsService.mobileAutofill(mockReq, mockRes);

            expect(samparkSchema.find).toHaveBeenCalledWith(
                { "Mobile": expect.any(RegExp) },
                { 'Full Name': 1, 'Mobile': 1 }
            );
        });

        it('should accept exactly 3 character mobile number', async () => {
            mockReq.query.mobileNo = '987';
            samparkSchema.find.mockResolvedValue([]);

            const result = await regsService.mobileAutofill(mockReq, mockRes);

            expect(result.statusCode).toBe(200);
        });

        it('should accept exactly 10 character mobile number', async () => {
            mockReq.query.mobileNo = '9876543210';
            samparkSchema.find.mockResolvedValue([]);

            const result = await regsService.mobileAutofill(mockReq, mockRes);

            expect(result.statusCode).toBe(200);
        });
    });

    describe('nameAutoFill', () => {
        it('should return predictions when name length is >= 3', async () => {
            mockReq.query.name = 'John';
            const mockPredictions = [
                { 'Full Name': 'John Doe', 'Mobile': '9876543210', 'Sabha': 'Asalpha' }
            ];
            samparkSchema.find.mockResolvedValue(mockPredictions);

            const result = await regsService.nameAutoFill(mockReq, mockRes);

            expect(result.statusCode).toBe(200);
            expect(result.data).toEqual(mockPredictions);
        });

        it('should return 404 when name is less than 3 characters', async () => {
            mockReq.query.name = 'Jo';

            const result = await regsService.nameAutoFill(mockReq, mockRes);

            expect(result.statusCode).toBe(404);
            expect(result.message).toBe('No Data found');
        });

        it('should return 404 when name is undefined', async () => {
            mockReq.query.name = undefined;

            const result = await regsService.nameAutoFill(mockReq, mockRes);

            expect(result.statusCode).toBe(404);
        });

        it('should return 500 on database error', async () => {
            mockReq.query.name = 'John';
            samparkSchema.find.mockRejectedValue(new Error('DB Error'));

            const result = await regsService.nameAutoFill(mockReq, mockRes);

            expect(result.statusCode).toBe(500);
            expect(result.message).toBe('Internal Server Error');
        });

        it('should search with case-insensitive regex', async () => {
            mockReq.query.name = 'john';
            samparkSchema.find.mockResolvedValue([]);

            await regsService.nameAutoFill(mockReq, mockRes);

            expect(samparkSchema.find).toHaveBeenCalledWith(
                { 'Full Name': { $regex: 'john', "$options": "i" } },
                { 'Full Name': 1, 'Mobile': 1, 'Sabha': 1 }
            );
        });
    });

    describe('formDataFromMobile', () => {
        it('should return member data when mobile is exactly 10 digits', async () => {
            mockReq.query.mobileNo = '9876543210';
            mockReq.body.Mobile = '9876543210';
            registerationModel.findOne.mockResolvedValue(null);
            const mockMember = [{ 'First Name': 'John', 'Mobile': '9876543210' }];
            samparkSchema.find.mockResolvedValue(mockMember);

            const result = await regsService.formDataFromMobile(mockReq, mockRes);

            expect(result.statusCode).toBe(200);
            expect(result.message).toBe('Full Details');
            expect(result.data).toEqual(mockMember);
        });

        it('should return 400 when member is already registered', async () => {
            mockReq.query.mobileNo = '9876543210';
            mockReq.body.Mobile = '9876543210';
            registerationModel.findOne.mockResolvedValue({ id: 'abc123' });

            const result = await regsService.formDataFromMobile(mockReq, mockRes);

            expect(result.statusCode).toBe(400);
            expect(result.message).toBe('Member already Registered');
        });

        it('should return 404 when mobile is not 10 digits', async () => {
            mockReq.query.mobileNo = '12345';

            const result = await regsService.formDataFromMobile(mockReq, mockRes);

            expect(result.statusCode).toBe(404);
            expect(result.message).toBe('No Data found');
        });

        it('should return 404 when mobileNo is undefined', async () => {
            mockReq.query.mobileNo = undefined;

            const result = await regsService.formDataFromMobile(mockReq, mockRes);

            expect(result.statusCode).toBe(404);
        });

        it('should return 500 on sampark find error', async () => {
            mockReq.query.mobileNo = '9876543210';
            mockReq.body.Mobile = '9876543210';
            registerationModel.findOne.mockResolvedValue(null);
            samparkSchema.find.mockRejectedValue(new Error('DB Error'));

            const result = await regsService.formDataFromMobile(mockReq, mockRes);

            expect(result.statusCode).toBe(500);
            expect(result.message).toBe('Internal Server Error');
        });
    });

    describe('register', () => {
        it('should register a new existing member successfully', async () => {
            mockReq.body = {
                Mobile: '9876543210',
                'First Name': 'John',
                'Middle Name': 'M',
                'Last Name': 'Doe',
                isNew: false
            };
            registerationModel.findOne.mockResolvedValue(null);
            samparkSchema.findOne.mockReturnValue({
                lean: jest.fn().mockResolvedValue({ 'Ref Name': 'Ref1', 'FollowUp Name': 'Follow1' })
            });
            registerationModel.create.mockResolvedValue({
                'Full Name': 'John M Doe',
                Mobile: '9876543210'
            });

            const result = await regsService.register(mockReq, mockRes);

            expect(result.statusCode).toBe(200);
            expect(result.message).toBe('Register Successful');
        });

        it('should register a new member (isNew=true) successfully', async () => {
            mockReq.body = {
                Mobile: '9876543210',
                'First Name': 'Jane',
                'Middle Name': 'A',
                'Last Name': 'Doe',
                isNew: true
            };
            registerationModel.findOne.mockResolvedValue(null);
            registerationModel.create.mockResolvedValue({
                'Full Name': 'Jane A Doe',
                Mobile: '9876543210'
            });

            const result = await regsService.register(mockReq, mockRes);

            expect(result.statusCode).toBe(200);
            expect(result.message).toBe('Register Successful');
        });

        it('should return 400 when member is already registered', async () => {
            mockReq.body = { Mobile: '9876543210' };
            registerationModel.findOne.mockResolvedValue({ id: 'existing123' });

            const result = await regsService.register(mockReq, mockRes);

            expect(result.statusCode).toBe(400);
            expect(result.message).toBe('Member already Registered');
        });

        it('should return 500 when create fails', async () => {
            mockReq.body = {
                Mobile: '9876543210',
                'First Name': 'John',
                'Middle Name': 'M',
                'Last Name': 'Doe',
                isNew: true
            };
            registerationModel.findOne.mockResolvedValue(null);
            registerationModel.create.mockResolvedValue(null);

            const result = await regsService.register(mockReq, mockRes);

            expect(result.statusCode).toBe(500);
        });

        it('should return 500 on database error', async () => {
            mockReq.body = { Mobile: '9876543210' };
            registerationModel.findOne.mockRejectedValue(new Error('DB Error'));

            const result = await regsService.register(mockReq, mockRes);

            expect(result.statusCode).toBe(500);
        });
    });

    describe('getAll', () => {
        it('should return registered members when isRegistered is true', async () => {
            mockReq.query.isRegistered = 'true';
            const mockRegs = [{ 'Full Name': 'John Doe', Mobile: '9876543210' }];
            registerationModel.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockRegs)
            });
            registerationModel.countDocuments.mockResolvedValue(1);

            const result = await regsService.getAll(mockReq, mockRes);

            expect(result.statusCode).toBe(200);
            expect(result.message).toBe('Registerations List');
            expect(result.data.regs).toEqual(mockRegs);
            expect(result.data.totalRecords).toBe(1);
        });

        it('should return unregistered members when isRegistered is false', async () => {
            mockReq.query.isRegistered = 'false';
            const mockRegs = [{ 'Full Name': 'Jane Doe', Mobile: '1234567890' }];
            samparkSchema.aggregate.mockResolvedValue(mockRegs);

            const result = await regsService.getAll(mockReq, mockRes);

            expect(result.statusCode).toBe(200);
            expect(result.data.regs).toEqual(mockRegs);
            expect(result.data.totalRecords).toBe(1);
        });

        it('should return 500 on database error', async () => {
            mockReq.query.isRegistered = 'true';
            registerationModel.find.mockReturnValue({
                sort: jest.fn().mockRejectedValue(new Error('DB Error'))
            });

            const result = await regsService.getAll(mockReq, mockRes);

            expect(result.statusCode).toBe(500);
            expect(result.message).toBe('Internal Server Error');
        });

        it('should sort registered members by createdAt ascending', async () => {
            mockReq.query.isRegistered = 'true';
            const sortMock = jest.fn().mockResolvedValue([]);
            registerationModel.find.mockReturnValue({ sort: sortMock });
            registerationModel.countDocuments.mockResolvedValue(0);

            await regsService.getAll(mockReq, mockRes);

            expect(sortMock).toHaveBeenCalledWith({ createdAt: 1 });
        });
    });

    describe('getSabhaList', () => {
        it('should return filtered sabha list for Male', async () => {
            mockReq.query.gender = 'Male';
            samparkSchema.distinct.mockResolvedValue(['Asalpha', 'Kurla', 'Asalpha (Yuvati)', '']);

            const result = await regsService.getSabhaList(mockReq, mockRes);

            expect(result.statusCode).toBe(200);
            expect(result.message).toBe('Sabha list');
            // Should filter out empty strings and Yuvati sabhas for Male
            expect(result.data).not.toContain('');
            expect(result.data).not.toContain('Asalpha (Yuvati)');
        });

        it('should return sabha list for Female without Yuvati filter', async () => {
            mockReq.query.gender = 'Female';
            samparkSchema.distinct.mockResolvedValue(['Asalpha (Yuvati)', 'Kurla (Yuvati)', '']);

            const result = await regsService.getSabhaList(mockReq, mockRes);

            expect(result.statusCode).toBe(200);
            expect(result.data).not.toContain('');
        });

        it('should return 500 on database error', async () => {
            mockReq.query.gender = 'Male';
            samparkSchema.distinct.mockRejectedValue(new Error('DB Error'));

            const result = await regsService.getSabhaList(mockReq, mockRes);

            expect(result.statusCode).toBe(500);
            expect(result.message).toBe('Internal Server Error');
        });

        it('should call distinct with correct gender filter', async () => {
            mockReq.query.gender = 'Male';
            samparkSchema.distinct.mockResolvedValue([]);

            await regsService.getSabhaList(mockReq, mockRes);

            expect(samparkSchema.distinct).toHaveBeenCalledWith('Sabha', { 'Gender': 'Male' });
        });
    });

    describe('deRegisterMember', () => {
        it('should delete a member successfully', async () => {
            mockReq.body = { _id: 'abc123' };
            registerationModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

            const result = await regsService.deRegisterMember(mockReq, mockRes);

            expect(result.statusCode).toBe(200);
            expect(result.message).toBe('Member Deleted');
        });

        it('should return 500 on database error', async () => {
            mockReq.body = { _id: 'abc123' };
            registerationModel.deleteOne.mockRejectedValue(new Error('DB Error'));

            const result = await regsService.deRegisterMember(mockReq, mockRes);

            expect(result.statusCode).toBe(500);
            expect(result.message).toBe('Internal Server Error');
        });

        it('should call deleteOne with ObjectId', async () => {
            mockReq.body = { _id: 'abc123' };
            registerationModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

            await regsService.deRegisterMember(mockReq, mockRes);

            expect(registerationModel.deleteOne).toHaveBeenCalledWith({
                _id: 'abc123'
            });
        });
    });
});
