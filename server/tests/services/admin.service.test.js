jest.mock('../../models/registeration', () => ({
  aggregate: jest.fn()
}));

jest.mock('../../models/sampark', () => ({}));

jest.mock('../../utility/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

jest.mock('mongoose', () => ({
  Types: { ObjectId: jest.fn() }
}));

const adminService = require('../../services/admin.service');
const registerationModel = require('../../models/registeration');

describe('adminService', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {};
    jest.clearAllMocks();
  });

  describe('regsByMandal', () => {
    it('should return aggregated dashboard data successfully', async () => {
      const mockDash = [
        { _id: 'Asalpha', New: 5, Existing: 10 },
        { _id: 'Kurla', New: 3, Existing: 7 }
      ];
      registerationModel.aggregate.mockResolvedValue(mockDash);

      const result = await adminService.regsByMandal(req, res);

      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Regs Dashboard');
      expect(result.data).toEqual(mockDash);
    });

    it('should call aggregate with correct pipeline', async () => {
      registerationModel.aggregate.mockResolvedValue([]);

      await adminService.regsByMandal(req, res);

      expect(registerationModel.aggregate).toHaveBeenCalledTimes(1);
      const pipeline = registerationModel.aggregate.mock.calls[0][0];

      // Verify $match stage
      expect(pipeline[0]).toHaveProperty('$match');
      expect(pipeline[0].$match.$or).toEqual([
        { isDeleted: { $exists: false } },
        { isDeleted: false }
      ]);

      // Verify $project stage
      expect(pipeline[1]).toHaveProperty('$project');
      expect(pipeline[1].$project).toHaveProperty('Sabha', 1);
      expect(pipeline[1].$project).toHaveProperty('isNew', 1);
      expect(pipeline[1].$project).toHaveProperty('newMember');
      expect(pipeline[1].$project).toHaveProperty('oldMember');

      // Verify $group stage
      expect(pipeline[2]).toHaveProperty('$group');
      expect(pipeline[2].$group._id).toBe('$Sabha');
      expect(pipeline[2].$group.New).toEqual({ $sum: '$newMember' });
      expect(pipeline[2].$group.Existing).toEqual({ $sum: '$oldMember' });
    });

    it('should return empty array when no registrations exist', async () => {
      registerationModel.aggregate.mockResolvedValue([]);

      const result = await adminService.regsByMandal(req, res);

      expect(result.statusCode).toBe(200);
      expect(result.data).toEqual([]);
    });

    it('should return 500 on database error', async () => {
      registerationModel.aggregate.mockRejectedValue(new Error('Aggregation failed'));

      const result = await adminService.regsByMandal(req, res);

      expect(result.statusCode).toBe(500);
      expect(result.message).toBe('Internal Server Error');
      expect(result.error).toBeDefined();
    });

    it('should include res in the response object', async () => {
      registerationModel.aggregate.mockResolvedValue([]);

      const result = await adminService.regsByMandal(req, res);

      expect(result.res).toBe(res);
    });

    it('should handle multiple mandal groups', async () => {
      const mockDash = [
        { _id: 'Asalpha', New: 5, Existing: 10 },
        { _id: 'Kurla', New: 3, Existing: 7 },
        { _id: 'Thane', New: 8, Existing: 12 },
        { _id: 'Mulund', New: 2, Existing: 4 },
        { _id: 'Asalpha (Yuvati)', New: 6, Existing: 9 }
      ];
      registerationModel.aggregate.mockResolvedValue(mockDash);

      const result = await adminService.regsByMandal(req, res);

      expect(result.data).toHaveLength(5);
      expect(result.data.map(d => d._id)).toContain('Asalpha');
      expect(result.data.map(d => d._id)).toContain('Asalpha (Yuvati)');
    });
  });
});
