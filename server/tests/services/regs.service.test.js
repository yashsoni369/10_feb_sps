const mongoose = require('mongoose');

// Mock mongoose models
jest.mock('../../models/registeration', () => {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    countDocuments: jest.fn(),
    deleteOne: jest.fn(),
    updateOne: jest.fn(),
    aggregate: jest.fn()
  };
});

jest.mock('../../models/sampark', () => {
  const findOneMock = jest.fn();
  return {
    find: jest.fn(),
    findOne: findOneMock,
    aggregate: jest.fn(),
    distinct: jest.fn()
  };
});

jest.mock('../../utility/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

jest.mock('mongoose', () => ({
  Types: {
    ObjectId: jest.fn(id => id)
  }
}));

const regsService = require('../../services/regs.service');
const registerationModel = require('../../models/registeration');
const samparkSchema = require('../../models/sampark');

describe('regsService', () => {
  let req, res;

  beforeEach(() => {
    req = { query: {}, body: {} };
    res = {};
    jest.clearAllMocks();
  });

  describe('mobileAutofill', () => {
    it('should return predictions when mobile number length is between 3 and 10', async () => {
      req.query.mobileNo = '98765';
      const mockData = [{ 'Full Name': 'John Doe', Mobile: '9876543210' }];
      samparkSchema.find.mockResolvedValue(mockData);

      const result = await regsService.mobileAutofill(req, res);

      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Mobile autofill');
      expect(result.data).toEqual(mockData);
      expect(samparkSchema.find).toHaveBeenCalledWith(
        { "Mobile": expect.any(RegExp) },
        { 'Full Name': 1, 'Mobile': 1 }
      );
    });

    it('should return 404 when mobile number is less than 3 characters', async () => {
      req.query.mobileNo = '98';

      const result = await regsService.mobileAutofill(req, res);

      expect(result.statusCode).toBe(404);
      expect(result.message).toBe('No Data found');
    });

    it('should return 404 when mobile number is more than 10 characters', async () => {
      req.query.mobileNo = '98765432101';

      const result = await regsService.mobileAutofill(req, res);

      expect(result.statusCode).toBe(404);
      expect(result.message).toBe('No Data found');
    });

    it('should return 404 when mobileNo is undefined', async () => {
      req.query.mobileNo = undefined;

      const result = await regsService.mobileAutofill(req, res);

      expect(result.statusCode).toBe(404);
    });

    it('should return 500 on database error', async () => {
      req.query.mobileNo = '98765';
      samparkSchema.find.mockRejectedValue(new Error('DB Error'));

      const result = await regsService.mobileAutofill(req, res);

      expect(result.statusCode).toBe(500);
      expect(result.message).toBe('Internal Server Error');
    });

    it('should return empty array when no matches found', async () => {
      req.query.mobileNo = '12345';
      samparkSchema.find.mockResolvedValue([]);

      const result = await regsService.mobileAutofill(req, res);

      expect(result.statusCode).toBe(200);
      expect(result.data).toEqual([]);
    });
  });

  describe('nameAutoFill', () => {
    it('should return predictions when name length is >= 3', async () => {
      req.query.name = 'John';
      const mockData = [{ 'Full Name': 'John Doe', Mobile: '9876543210', Sabha: 'Asalpha' }];
      samparkSchema.find.mockResolvedValue(mockData);

      const result = await regsService.nameAutoFill(req, res);

      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Mobile autofill');
      expect(result.data).toEqual(mockData);
    });

    it('should use case-insensitive regex for name search', async () => {
      req.query.name = 'john';
      samparkSchema.find.mockResolvedValue([]);

      await regsService.nameAutoFill(req, res);

      expect(samparkSchema.find).toHaveBeenCalledWith(
        { 'Full Name': { $regex: 'john', "$options": "i" } },
        { 'Full Name': 1, 'Mobile': 1, 'Sabha': 1 }
      );
    });

    it('should return 404 when name is less than 3 characters', async () => {
      req.query.name = 'Jo';

      const result = await regsService.nameAutoFill(req, res);

      expect(result.statusCode).toBe(404);
      expect(result.message).toBe('No Data found');
    });

    it('should return 404 when name is undefined', async () => {
      req.query.name = undefined;

      const result = await regsService.nameAutoFill(req, res);

      expect(result.statusCode).toBe(404);
    });

    it('should return 500 on database error', async () => {
      req.query.name = 'John';
      samparkSchema.find.mockRejectedValue(new Error('DB Error'));

      const result = await regsService.nameAutoFill(req, res);

      expect(result.statusCode).toBe(500);
      expect(result.message).toBe('Internal Server Error');
    });
  });

  describe('formDataFromMobile', () => {
    it('should return member data when mobile is 10 digits and not already registered', async () => {
      req.query.mobileNo = '9876543210';
      req.body.Mobile = '9876543210';
      registerationModel.findOne.mockResolvedValue(null);
      const mockMember = [{ 'First Name': 'John', 'Last Name': 'Doe', Mobile: '9876543210' }];
      samparkSchema.find.mockResolvedValue(mockMember);

      const result = await regsService.formDataFromMobile(req, res);

      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Full Details');
      expect(result.data).toEqual(mockMember);
    });

    it('should return 400 when member is already registered', async () => {
      req.query.mobileNo = '9876543210';
      req.body.Mobile = '9876543210';
      registerationModel.findOne.mockResolvedValue({ id: 'abc123' });

      const result = await regsService.formDataFromMobile(req, res);

      expect(result.statusCode).toBe(400);
      expect(result.message).toBe('Member already Registered');
    });

    it('should return 404 when mobile is not 10 digits', async () => {
      req.query.mobileNo = '12345';

      const result = await regsService.formDataFromMobile(req, res);

      expect(result.statusCode).toBe(404);
      expect(result.message).toBe('No Data found');
    });

    it('should return 404 when mobileNo is undefined', async () => {
      req.query.mobileNo = undefined;

      const result = await regsService.formDataFromMobile(req, res);

      expect(result.statusCode).toBe(404);
    });

    it('should return 500 on database error in sampark find', async () => {
      req.query.mobileNo = '9876543210';
      req.body.Mobile = '9876543210';
      registerationModel.findOne.mockResolvedValue(null);
      samparkSchema.find.mockRejectedValue(new Error('DB Error'));

      const result = await regsService.formDataFromMobile(req, res);

      expect(result.statusCode).toBe(500);
      expect(result.message).toBe('Internal Server Error');
    });
  });

  describe('register', () => {
    it('should register a new existing member (isNew=false) successfully', async () => {
      req.body = {
        Mobile: '9876543210',
        'First Name': 'John',
        'Middle Name': 'M',
        'Last Name': 'Doe',
        isNew: false
      };
      registerationModel.findOne.mockResolvedValue(null);
      samparkSchema.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue({ 'Ref Name': 'Ref1', 'FollowUp Name': 'Follow1' }) });
      registerationModel.create.mockResolvedValue({ _id: 'new123', 'Full Name': 'John M Doe' });

      const result = await regsService.register(req, res);

      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Register Successful');
      expect(result.data).toBeDefined();
    });

    it('should register a new member (isNew=true) successfully', async () => {
      req.body = {
        Mobile: '9876543210',
        'First Name': 'Jane',
        'Middle Name': 'A',
        'Last Name': 'Doe',
        isNew: true
      };
      registerationModel.findOne.mockResolvedValue(null);
      registerationModel.create.mockResolvedValue({ _id: 'new456', 'Full Name': 'Jane A Doe' });

      const result = await regsService.register(req, res);

      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Register Successful');
    });

    it('should return 400 when member is already registered', async () => {
      req.body = { Mobile: '9876543210' };
      registerationModel.findOne.mockResolvedValue({ id: 'existing123' });

      const result = await regsService.register(req, res);

      expect(result.statusCode).toBe(400);
      expect(result.message).toBe('Member already Registered');
    });

    it('should return 500 when registerMember fails (create throws error)', async () => {
      req.body = {
        Mobile: '9876543210',
        'First Name': 'John',
        'Middle Name': 'M',
        'Last Name': 'Doe',
        isNew: true
      };
      registerationModel.findOne.mockResolvedValue(null);
      registerationModel.create.mockRejectedValue(new Error('Create failed'));

      const result = await regsService.register(req, res);

      // registerMember catches the error and returns null, then outer code returns 500
      expect(result.statusCode).toBe(500);
      expect(result.message).toBe('Error registering player');
    });

    it('should return 500 on unexpected error in register flow', async () => {
      req.body = {
        Mobile: '9876543210',
        'First Name': 'John',
        'Middle Name': 'M',
        'Last Name': 'Doe',
        isNew: false
      };
      // alreadyRegistered returns 0 (not registered), then samparkSchema.findOne().lean() throws
      registerationModel.findOne.mockResolvedValue(null);
      samparkSchema.findOne.mockReturnValue({ lean: jest.fn().mockRejectedValue(new Error('Unexpected')) });

      const result = await regsService.register(req, res);

      expect(result.statusCode).toBe(500);
      expect(result.message).toBe('Internal Server Error');
    });
  });

  describe('getAll', () => {
    it('should return registered members when isRegistered is true', async () => {
      req.query.isRegistered = 'true';
      const mockRegs = [{ 'Full Name': 'John Doe', Mobile: '9876543210' }];
      registerationModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(mockRegs) });
      registerationModel.countDocuments.mockResolvedValue(1);

      const result = await regsService.getAll(req, res);

      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Registerations List');
      expect(result.data.regs).toEqual(mockRegs);
      expect(result.data.totalRecords).toBe(1);
    });

    it('should return unregistered members when isRegistered is false', async () => {
      req.query.isRegistered = 'false';
      const mockRegs = [{ 'Full Name': 'Jane Doe', Mobile: '1234567890' }];
      samparkSchema.aggregate.mockResolvedValue(mockRegs);

      const result = await regsService.getAll(req, res);

      expect(result.statusCode).toBe(200);
      expect(result.data.regs).toEqual(mockRegs);
      expect(result.data.totalRecords).toBe(1);
    });

    it('should return 500 on database error', async () => {
      req.query.isRegistered = 'true';
      registerationModel.find.mockReturnValue({ sort: jest.fn().mockRejectedValue(new Error('DB Error')) });

      const result = await regsService.getAll(req, res);

      expect(result.statusCode).toBe(500);
      expect(result.message).toBe('Internal Server Error');
    });

    it('should use aggregate pipeline for unregistered members', async () => {
      req.query.isRegistered = 'false';
      samparkSchema.aggregate.mockResolvedValue([]);

      await regsService.getAll(req, res);

      expect(samparkSchema.aggregate).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ $lookup: expect.any(Object) }),
        expect.objectContaining({ $match: expect.any(Object) }),
        expect.objectContaining({ $project: expect.any(Object) })
      ]));
    });
  });

  describe('getSabhaList', () => {
    it('should return filtered sabha list for Male', async () => {
      req.query.gender = 'Male';
      samparkSchema.distinct.mockResolvedValue(['Asalpha', 'Kurla', 'Asalpha (Yuvati)', '']);

      const result = await regsService.getSabhaList(req, res);

      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Sabha list');
      expect(result.data).not.toContain('');
      expect(result.data).not.toContain('Asalpha (Yuvati)');
      expect(result.data).toContain('Asalpha');
      expect(result.data).toContain('Kurla');
    });

    it('should return filtered sabha list for Female (includes Yuvati)', async () => {
      req.query.gender = 'Female';
      samparkSchema.distinct.mockResolvedValue(['Asalpha (Yuvati)', 'Kurla (Yuvati)', '']);

      const result = await regsService.getSabhaList(req, res);

      expect(result.statusCode).toBe(200);
      expect(result.data).not.toContain('');
      expect(result.data).toContain('Asalpha (Yuvati)');
    });

    it('should return 500 on database error', async () => {
      req.query.gender = 'Male';
      samparkSchema.distinct.mockRejectedValue(new Error('DB Error'));

      const result = await regsService.getSabhaList(req, res);

      expect(result.statusCode).toBe(500);
      expect(result.message).toBe('Internal Server Error');
    });

    it('should call distinct with correct gender filter', async () => {
      req.query.gender = 'Male';
      samparkSchema.distinct.mockResolvedValue([]);

      await regsService.getSabhaList(req, res);

      expect(samparkSchema.distinct).toHaveBeenCalledWith('Sabha', { 'Gender': 'Male' });
    });
  });

  describe('deRegisterMember', () => {
    it('should delete a member successfully', async () => {
      req.body = { _id: 'abc123' };
      const mockResult = { deletedCount: 1 };
      registerationModel.deleteOne.mockResolvedValue(mockResult);

      const result = await regsService.deRegisterMember(req, res);

      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Member Deleted');
      expect(result.data).toEqual(mockResult);
    });

    it('should call deleteOne with correct ObjectId', async () => {
      req.body = { _id: 'abc123' };
      registerationModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

      await regsService.deRegisterMember(req, res);

      expect(registerationModel.deleteOne).toHaveBeenCalledWith({ _id: 'abc123' });
    });

    it('should return 500 on database error', async () => {
      req.body = { _id: 'abc123' };
      registerationModel.deleteOne.mockRejectedValue(new Error('DB Error'));

      const result = await regsService.deRegisterMember(req, res);

      expect(result.statusCode).toBe(500);
      expect(result.message).toBe('Internal Server Error');
    });
  });
});
