// Middelware for handling selecting,sorting, and pagination.
const advancedResults = (model, populate) => async (req, res, next) => {
  let reqQuery = { ...req.query };

  // Keys to be removed from the query
  const excludedKeys = ["select", "sortBy"];

  // Delete the excluded keys from copied request query
  excludedKeys.forEach((key) => delete reqQuery[key]);

  let queryString = JSON.stringify(req.query);
  // Append $ before the operator to be performed by mongo
  queryString = queryString.replace(
    /\b(eq|gt|gte|lt|lte|ne|in)\b/g,
    (match) => `$${match}`
  );

  let query = model.find(JSON.parse(queryString));

  //Selecting
  if (req.query.select) {
    // Convert comma sapreted to list of string
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  //Sorting
  if (req.query.sortBy) {
    // Convert comma sapreted to list of string
    const sortBy = req.query.sortBy.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    // Desending date
    query = query.sort("-createdAt");
  }

  // Population
  if (populate) {
    query = query.populate(populate);
  }

  //Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }
  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  const results = await query;

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  };
  next();
};

module.exports = advancedResults;
