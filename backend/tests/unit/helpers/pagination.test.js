// tests/unit/helpers/pagination.test.js
const { getPagination, getPagingData, getAdvancedFilters } = require('../../../helpers/pagination');

describe('Pagination Helpers', () => {
  test('getPagination returns correct limit and offset', () => {
    const result = getPagination(2, 10);
    expect(result).toEqual({ limit: 10, offset: 20 });
  });

  test('getPagingData returns correct pagination info', () => {
    const mockData = { count: 30, rows: [{}] };
    const result = getPagingData(mockData, 2, 10);
    expect(result).toEqual({
      totalItems: 30,
      items: [{}],
      totalPages: 3,
      currentPage: 2
    });
  });

  test('getAdvancedFilters handles various filter types', () => {
    const filters = {
      name: 'test',
      price: { start: 10, end: 20 },
      categories: ['A', 'B']
    };
    const result = getAdvancedFilters(filters);
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('price');
    expect(result).toHaveProperty('categories');
  });
});
