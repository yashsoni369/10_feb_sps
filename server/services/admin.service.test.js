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

jest.mock('../models/registeration', () => ({
    aggregate: jest.fn()
}));

jest.mock('../models/sampark', () => ({}));

jest.mock('mongoose', () => ({
    Types: {
        ObjectId: jest.fn(id => id)
    }
}));

const adminService = require('./admin.service');
const registerationModel = require('../models/registeration');

describe('adminService', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        mockReq = { query: {}, body: {} };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    });

    describe('regsByMandal', () => {
        it('should return dashboard data with 200 status', async () => {
            const mockDash = [
                { _id: 'Asalpha', New: 5, Existing: 10 },
                { _id: 'Kurla', New: 3, Existing: 7 }
            ];
            registerationModel.aggregate.mockResolvedValue(mockDash);

            const result = await adminService.regsByMandal(mockReq, mockRes);

            expect(result.statusCode).toBe(200);
            expect(result.message).toBe('Regs Dashboard');
            expect(result.data).toEqual(mockDash);
            expect(result.res).toBe(mockRes);
        });

        it('should call aggregate with correct pipeline', async () => {
            registerationModel.aggregate.mockResolvedValue([]);

            await adminService.regsByMandal(mockReq, mockRes);

            expect(registerationModel.aggregate).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({ $match: expect.any(Object) }),
                    expect.objectContaining({ $project: expect.any(Object) }),
                    expect.objectContaining({ $group: expect.any(Object) })
                ])
            );
        });

        it('should filter out deleted records in aggregation', async () => {
            registerationModel.aggregate.mockResolvedValue([]);

            await adminService.regsByMandal(mockReq, mockRes);

            const pipeline = registerationModel.aggregate.mock.calls[0][0];
            const matchStage = pipeline.find(stage => stage.$match);

            expect(matchStage.$match.$or).toEqual(
                expect.arrayContaining([
                    { isDeleted: { $exists: false } },
                    { isDeleted: false }
                ])
            );
        });

        it('should group by Sabha in aggregation', async () => {
            registerationModel.aggregate.mockResolvedValue([]);

            await adminService.regsByMandal(mockReq, mockRes);

            const pipeline = registerationModel.aggregate.mock.calls[0][0];
            const groupStage = pipeline.find(stage => stage.$group);

            expect(groupStage.$group._id).toBe('$Sabha');
            expect(groupStage.$group.New).toEqual({ $sum: '$newMember' });
            expect(groupStage.$group.Existing).toEqual({ $sum: '$oldMember' });
        });

        it('should return 500 on database error', async () => {
            registerationModel.aggregate.mockRejectedValue(new Error('DB Error'));

            const result = await adminService.regsByMandal(mockReq, mockRes);

            expect(result.statusCode).toBe(500);
            expect(result.message).toBe('Internal Server Error');
            expect(result.data).toBe('');
            expect(result.error).toBeDefined();
        });

        it('should return empty array when no registrations exist', async () => {
            registerationModel.aggregate.mockResolvedValue([]);

            const result = await adminService.regsByMandal(mockReq, mockRes);

            expect(result.statusCode).toBe(200);
            expect(result.data).toEqual([]);
        });

        it('should project isNew and conditional newMember/oldMember fields', async () => {
            registerationModel.aggregate.mockResolvedValue([]);

            await adminService.regsByMandal(mockReq, mockRes);

            const pipeline = registerationModel.aggregate.mock.calls[0][0];
            const projectStage = pipeline.find(stage => stage.$project);

            expect(projectStage.$project.Sabha).toBe(1);
            expect(projectStage.$project.isNew).toBe(1);
            expect(projectStage.$project.newMember).toBeDefined();
            expect(projectStage.$project.oldMember).toBeDefined();
        });
    });
});
