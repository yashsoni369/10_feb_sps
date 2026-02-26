describe('Registeration Model', () => {
  let mongoose;
  let schemaArgs;
  let modelArgs;

  beforeEach(() => {
    jest.resetModules();

    schemaArgs = {};
    modelArgs = {};

    jest.doMock('mongoose', () => {
      const mSchema = function (...args) {
        schemaArgs.definition = args[0];
        schemaArgs.options = args[1];
      };
      const mModel = function (...args) {
        modelArgs.name = args[0];
        modelArgs.schema = args[1];
        modelArgs.collection = args[2];
        return {};
      };
      return {
        Schema: mSchema,
        model: mModel,
        Types: { ObjectId: jest.fn() }
      };
    });

    mongoose = require('mongoose');
  });

  it('should define the schema with correct fields', () => {
    require('../../models/registeration');

    expect(schemaArgs.definition).toHaveProperty('First Name');
    expect(schemaArgs.definition).toHaveProperty('Middle Name');
    expect(schemaArgs.definition).toHaveProperty('Last Name');
    expect(schemaArgs.definition).toHaveProperty('Full Name');
    expect(schemaArgs.definition).toHaveProperty('Mobile');
    expect(schemaArgs.definition).toHaveProperty('Gender');
    expect(schemaArgs.definition).toHaveProperty('Birth Date');
    expect(schemaArgs.definition).toHaveProperty('Sabha');
    expect(schemaArgs.definition).toHaveProperty('Ref Name');
    expect(schemaArgs.definition).toHaveProperty('FollowUp Name');
    expect(schemaArgs.definition).toHaveProperty('updatedBy');
    expect(schemaArgs.definition).toHaveProperty('isDeleted');
    expect(schemaArgs.definition).toHaveProperty('isNew');
  });

  it('should have correct types for schema fields', () => {
    require('../../models/registeration');

    expect(schemaArgs.definition['First Name']).toEqual({ type: String });
    expect(schemaArgs.definition['Middle Name']).toEqual({ type: String });
    expect(schemaArgs.definition['Last Name']).toEqual({ type: String });
    expect(schemaArgs.definition['Full Name']).toEqual({ type: String });
    expect(schemaArgs.definition['Mobile']).toEqual({ type: String });
    expect(schemaArgs.definition['Gender']).toEqual({ type: String });
    expect(schemaArgs.definition['Birth Date']).toEqual({ type: String });
    expect(schemaArgs.definition['Sabha']).toEqual({ type: String });
    expect(schemaArgs.definition['Ref Name']).toEqual({ type: String });
    expect(schemaArgs.definition['FollowUp Name']).toEqual({ type: String });
    expect(schemaArgs.definition['updatedBy']).toEqual({ type: String });
    expect(schemaArgs.definition['isDeleted']).toEqual({ type: Boolean, default: false });
    expect(schemaArgs.definition['isNew']).toBe(Boolean);
  });

  it('should enable timestamps', () => {
    require('../../models/registeration');

    expect(schemaArgs.options).toEqual({ timestamps: true });
  });

  it('should create model with correct name and collection', () => {
    require('../../models/registeration');

    expect(modelArgs.name).toBe('registeration');
    expect(modelArgs.collection).toBe('sps_2023_registerations');
  });

  it('should have isDeleted default to false', () => {
    require('../../models/registeration');

    expect(schemaArgs.definition['isDeleted'].default).toBe(false);
  });
});
