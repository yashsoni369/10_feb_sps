describe('Sampark Model', () => {
  let schemaArgs;
  let modelArgs;
  let indexArgs;

  beforeEach(() => {
    jest.resetModules();

    schemaArgs = {};
    modelArgs = {};
    indexArgs = null;

    jest.doMock('mongoose', () => {
      const mSchema = function (...args) {
        schemaArgs.definition = args[0];
        schemaArgs.options = args[1];
        this.index = function (idx) {
          indexArgs = idx;
        };
      };
      const mModel = function (...args) {
        modelArgs.name = args[0];
        modelArgs.schema = args[1];
        return {};
      };
      return {
        Schema: mSchema,
        model: mModel,
        Types: { ObjectId: jest.fn() }
      };
    });
  });

  it('should define the schema with all sampark fields', () => {
    require('../../models/sampark');

    const expectedFields = [
      'First Name', 'Middle Name', 'Last Name', 'Patrika', 'Verified Date',
      'Profile Meter', 'Flat No', 'Building Name', 'Street Name', 'Relationship',
      'Education Status', 'Education Others', 'Major Subject', 'Verified',
      'Family Id', 'Key Member', 'Mobile 2', 'Last Sabha Attended', 'Aym 2015',
      'Full Name', 'Attending Sabha', 'Leaving Date', 'Yogibaal Exp', 'Member Id',
      'Ambrish Code', 'NickName', 'Yogibaal', 'YDSMUM', 'Patrika Exp', 'Suburb',
      'Birth Date', 'Mobile', 'Ref Name', 'FollowUp Name', 'Gender', 'Email',
      'Sabha', 'Present', 'Secondary Email', 'Address', 'Landmark', 'Area',
      'PinCode', 'Home Phone', 'Office Phone', 'Doing Puja', 'Education',
      'Company Name', 'Occupation', 'Designation', 'Marital Status', 'Blood Group',
      'In Groups', 'Aniversary', 'Joining Date', 'Latitute', 'Longitude',
      'My References', 'My Followups', 'Mandal Name', 'Last Attended',
      '% Present', 'Sabha Status'
    ];

    expectedFields.forEach(field => {
      expect(schemaArgs.definition).toHaveProperty(field);
    });
  });

  it('should have Number type for Profile Meter and % Present', () => {
    require('../../models/sampark');

    expect(schemaArgs.definition['Profile Meter']).toBe(Number);
    expect(schemaArgs.definition['% Present']).toBe(Number);
  });

  it('should have String type for most fields', () => {
    require('../../models/sampark');

    const stringFields = ['First Name', 'Middle Name', 'Last Name', 'Mobile', 'Gender', 'Sabha', 'Email'];
    stringFields.forEach(field => {
      expect(schemaArgs.definition[field]).toBe(String);
    });
  });

  it('should enable timestamps', () => {
    require('../../models/sampark');

    expect(schemaArgs.options).toEqual({ timestamps: true });
  });

  it('should create a compound index on Mobile and Full Name', () => {
    require('../../models/sampark');

    expect(indexArgs).toEqual({ 'Mobile': 1, 'Full Name': 1 });
  });

  it('should create model with correct name', () => {
    require('../../models/sampark');

    expect(modelArgs.name).toBe('sampark');
  });
});
