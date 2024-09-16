// helpers/pagination.js
const { Op } = require('sequelize');

const getAdvancedFilters = (filters) => {
    const whereClause = {};
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key];
        if (value) {
          if (typeof value === 'object' && value.hasOwnProperty('start') && value.hasOwnProperty('end')) {
            whereClause[key] = {
              [Op.between]: [value.start, value.end]
            };
          } else if (Array.isArray(value)) {
            whereClause[key] = {
              [Op.in]: value
            };
          } else if (typeof value === 'string') {
            whereClause[key] = {
              [Op.iLike]: `%${value}%`
            };
          } else {
            whereClause[key] = value;
          }
        }
      });
    }
    return whereClause;
  };

const getPagination = (page, size) => {
  const limit = size ? +size : 10;
  const offset = page ? page * limit : 0;
  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: items } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);
  
  return { totalItems, items, totalPages, currentPage };
};

const getOrder = (sortBy, sortOrder) => {
  if (sortBy && sortOrder) {
    return [[sortBy, sortOrder.toUpperCase()]];
  }
  return [['createdAt', 'DESC']]; // default sorting
};

const getWhereClause = (filterField, filterValue) => {
  if (filterField && filterValue) {
    return { [filterField]: { [Op.iLike]: `%${filterValue}%` } };
  }
  return {};
};

module.exports = { getPagination, getPagingData, getOrder, getWhereClause, getAdvancedFilters };
