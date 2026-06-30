export class QueryBuilder<TModel, TQuery extends Record<string, any>> {
  public query: TQuery;
  public prismaQuery: {
    where: Record<string, any>;
    orderBy: Record<string, any>;
    skip?: number;
    take?: number;
  };

  constructor(query: TQuery) {
    this.query = query;
    this.prismaQuery = {
      where: {},
      orderBy: {},
    };
  }

  /**
   * Builds the search query (OR matches using 'contains' and 'insensitive' mode)
   * on the specified fields of the model.
   */
  search(searchableFields: string[]) {
    const rawSearch = this.query.search || this.query.searchTerm;
    const search = typeof rawSearch === "string" ? rawSearch.trim() : "";
    if (search) {
      this.prismaQuery.where = {
        ...this.prismaQuery.where,
        OR: searchableFields.map((field) => ({
          [field]: {
            contains: search,
            mode: "insensitive",
          },
        })),
      };
    }
    return this;
  }

  /**
   * Applies exact filters by stripping pagination/sorting query fields,
   * parsing value types, and mapping them to Prisma criteria.
   */
  filter() {
    const queryObj = { ...this.query };
    
    // Fields to exclude from direct exact matching in where clause
    const excludeFields = ["search", "searchTerm", "page", "limit", "sortBy", "sortOrder"];
    excludeFields.forEach((field) => delete queryObj[field]);

    const filters: Record<string, any> = {};

    Object.entries(queryObj).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        // Coerce boolean string to boolean
        if (value === "true") {
          filters[key] = true;
        } else if (value === "false") {
          filters[key] = false;
        }
        // Coerce comma-separated lists to arrays for list fields (e.g. tags)
        else if (key === "tags" || (typeof value === "string" && value.includes(","))) {
          const arr = typeof value === "string" ? value.split(",") : value;
          filters[key] = {
            hasSome: arr,
          };
        }
        // Coerce numeric values (e.g. views count)
        else if (typeof value === "string" && !isNaN(Number(value)) && /^\d+$/.test(value)) {
          filters[key] = Number(value);
        }
        // Exact match for other string, enum, or UUID types
        else {
          filters[key] = value;
        }
      }
    });

    this.prismaQuery.where = {
      ...this.prismaQuery.where,
      ...filters,
    };

    return this;
  }

  /**
   * Builds sorting query structure.
   */
  sort(defaultSortBy = "createdAt", defaultSortOrder = "desc") {
    const sortBy = this.query.sortBy || defaultSortBy;
    const rawSortOrder = this.query.sortOrder || defaultSortOrder;
    const sortOrder = (rawSortOrder === "asc" || rawSortOrder === "desc") ? rawSortOrder : "desc";

    this.prismaQuery.orderBy = {
      [sortBy]: sortOrder,
    };

    return this;
  }

  /**
   * Builds skip and take options for pagination.
   */
  paginate() {
    let page = Number(this.query.page);
    let limit = Number(this.query.limit);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    const skip = (page - 1) * limit;

    this.prismaQuery.skip = skip;
    this.prismaQuery.take = limit;

    return this;
  }

  /**
   * Executes the prisma model queries (findMany and count) in parallel.
   * Returns data array and standard meta object.
   */
  async execute(
    modelDelegate: {
      findMany: (args: any) => Promise<TModel[]>;
      count: (args: any) => Promise<number>;
    },
    extraOptions: {
      include?: any;
      select?: any;
      omit?: any;
    } = {}
  ) {
    const queryOptions = {
      where: this.prismaQuery.where,
      orderBy: this.prismaQuery.orderBy,
      skip: this.prismaQuery.skip,
      take: this.prismaQuery.take,
      ...extraOptions,
    };

    const [data, total] = await Promise.all([
      modelDelegate.findMany(queryOptions),
      modelDelegate.count({ where: this.prismaQuery.where }),
    ]);

    const page = Math.max(1, Number(this.query.page || 1));
    const limit = Math.max(1, Number(this.query.limit || 10));
    const totalPage = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPage,
      },
    };
  }
}
