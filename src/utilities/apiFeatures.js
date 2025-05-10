class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;

    const cleaned = {};

    for (const key in queryString) {
      const value = queryString[key];

      if (Array.isArray(value)) {
        cleaned[key] = value;
      } else if (typeof value === "object" && value !== null) {
        const nestedCleaned = {};
        for (const nestedKey in value) {
          const nestedValue = value[nestedKey];

          if (
            nestedValue !== "" &&
            nestedValue !== null &&
            !isNaN(nestedValue)
          ) {
            nestedCleaned[nestedKey] = Number(nestedValue);
          }
        }
        if (Object.keys(nestedCleaned).length > 0) {
          cleaned[key] = nestedCleaned;
        }
      } else if (
        value !== "" &&
        value !== null &&
        value.toString().trim() !== ""
      ) {
        cleaned[key] = value;
      }
    }

    console.log(cleaned);
    this.queryString = cleaned;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    for (const key in queryObj) {
      const value = queryObj[key];
      if (Array.isArray(value)) {
        queryObj[key] = { $in: value };
      }
    }

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

    console.log(queryObj);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  search(property) {
    if (this.queryString.keyword) {
      this.query = this.query.find({
        [property]: { $regex: this.queryString.keyword, $options: "i" },
      });
    }
    return this;
  }

  async getTotalCount() {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
    const parsedQuery = JSON.parse(queryStr);

    return await this.query.model.countDocuments(parsedQuery);
  }

  aggregate(pipline) {
    this.query = this.query.aggregate([pipline]);
    return this;
  }
}

export default APIFeatures;
