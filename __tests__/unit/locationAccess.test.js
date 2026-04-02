const { getAccessibleLocationIds } = require('../../src/utils/locationAccess');
const { sequelize, User, Role, Location } = require('../../src/models');

jest.mock('../../src/models', () => ({
  sequelize: {
    query: jest.fn()
  },
  User: {},
  Role: {}
}));

describe('locationAccess', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getAccessibleLocationIds returns null for admin', async () => {
    const user = { role: { name: 'admin' } };
    const result = await getAccessibleLocationIds(user);
    expect(result).toBeNull();
  });

  test('getAccessibleLocationIds returns array for worker with locationId', async () => {
    const user = { role: { name: 'worker' }, locationId: 5 };
    const mockRows = [{ id: 5 }, { id: 6 }, { id: 7 }];
    sequelize.query.mockResolvedValue(mockRows);
    const result = await getAccessibleLocationIds(user);
    expect(result).toEqual([5, 6, 7]);
    expect(sequelize.query).toHaveBeenCalledWith(
      expect.stringContaining('WITH RECURSIVE location_tree'),
      expect.objectContaining({ replacements: { rootId: 5 } })
    );
  });
});