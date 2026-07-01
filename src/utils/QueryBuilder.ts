export class QueryBuilder<TModel, TQuery extends Record<string, any>> {
  public query: TQuery;
  public prismaQuery: {
    where: Record<string, any>;
    orderBy: Record<string, any>;
    skip?: number;
    take?: number;
  };
  private allowedFields: string[];

  constructor(query: TQuery, allowedFields: string[] = []) {
    this.query = query;
    this.allowedFields = allowedFields;
    this.prismaQuery = {
      where: {},
      orderBy: {},
    };
  }

  /**
   * Builds the search query (OR matches using 'contains' and 'insensitive' mode)
   * on the specified fields of the model. Supports overriding fields dynamically
   * via a 'searchFields' query parameter.
   */
  search(defaultSearchableFields: string[]) {
    const rawSearch = this.query.search || this.query.searchTerm;
    const search = typeof rawSearch === "string" ? rawSearch.trim() : "";
    if (search) {
      const rawSearchFields = this.query.searchFields;
      let searchableFields: string[] = [];

      if (rawSearchFields) {
        if (typeof rawSearchFields === "string") {
          const trimmed = rawSearchFields.trim();
          if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
            try {
              searchableFields = JSON.parse(trimmed);
            } catch (e) {
              searchableFields = trimmed.slice(1, -1).split(",");
            }
          } else {
            searchableFields = trimmed.split(",");
          }
        } else if (Array.isArray(rawSearchFields)) {
          searchableFields = rawSearchFields;
        }
      }

      // Clean dynamic fields (strip quotes and whitespace)
      searchableFields = searchableFields
        .map((f) => (typeof f === "string" ? f.replace(/^['"]|['"]$/g, "").trim() : ""))
        .filter(Boolean);

      // Fallback to service defaults if no dynamic fields were passed
      const fields = searchableFields.length > 0 ? searchableFields : defaultSearchableFields;

      // Filter searchable fields by allowedFields if populated
      const activeFields = this.allowedFields.length > 0
        ? fields.filter((f) => this.allowedFields.includes(f))
        : fields;

      if (activeFields.length > 0) {
        this.prismaQuery.where = {
          ...this.prismaQuery.where,
          OR: activeFields.map((field) => {
            // If the field is 'tags' or list type, search using 'has' for array match
            if (field === "tags") {
              return {
                [field]: {
                  has: search,
                },
              };
            }
            // Default string contains search
            return {
              [field]: {
                contains: search,
                mode: "insensitive",
              },
            };
          }),
        };
      }
    }
    return this;
  }

  /**
   * Applies exact filters by stripping pagination/sorting query fields,
   * parsing value types, and mapping them to Prisma criteria.
   */
  filter(options?: { arrayFields?: string[]; textFields?: string[]; allowedFields?: string[] }) {
    const arrayFields = options?.arrayFields || ["tags"];
    const textFields = options?.textFields || ["title", "content", "thumbnail", "name", "email"];
    const allowed = options?.allowedFields || this.allowedFields;
    const queryObj = { ...this.query };
    
    // Fields to exclude from direct exact matching in where clause
    const excludeFields = ["search", "searchTerm", "searchFields", "page", "limit", "sortBy", "sortOrder"];
    excludeFields.forEach((field) => delete queryObj[field]);

    const filters: Record<string, any> = {};

    Object.entries(queryObj).forEach(([key, value]) => {
      // Skip query keys that are not valid fields of the model
      if (allowed.length > 0 && !allowed.includes(key)) {
        return;
      }
      if (value !== undefined && value !== null && value !== "") {
        // Coerce boolean string to boolean
        if (value === "true") {
          filters[key] = true;
        } else if (value === "false") {
          filters[key] = false;
        }
        // Coerce comma-separated lists or JSON-stringified arrays to array filters for list fields (e.g. tags)
        else if (
          arrayFields.includes(key) ||
          (typeof value === "string" && (value.includes(",") || (value.startsWith("[") && value.endsWith("]"))))
        ) {
          let arr: any[] = [];
          if (typeof value === "string") {
            const trimmedVal = value.trim();
            if (trimmedVal.startsWith("[") && trimmedVal.endsWith("]")) {
              try {
                arr = JSON.parse(trimmedVal);
              } catch (e) {
                // Fallback to removing brackets and splitting if JSON parsing fails
                arr = trimmedVal.slice(1, -1).split(",");
              }
            } else {
              arr = trimmedVal.split(",");
            }
          } else {
            arr = value;
          }

          // Clean each array element: strip leading/trailing quotes and extra whitespace
          if (Array.isArray(arr)) {
            arr = arr
              .map((item) => (typeof item === "string" ? item.replace(/^['"]|['"]$/g, "").trim() : item))
              .filter(Boolean);
          }

          // If the field is a database array field (like tags), use hasSome.
          // If the field is a standard scalar field, use 'in' to match any of the values.
          if (arrayFields.includes(key)) {
            filters[key] = {
              hasSome: arr,
            };
          } else {
            filters[key] = {
              in: arr,
            };
          }
        }
        // Coerce numeric values (e.g. views count)
        else if (typeof value === "string" && !isNaN(Number(value)) && /^\d+$/.test(value)) {
          filters[key] = Number(value);
        }
        // Dynamic partial search for text columns, exact match for enums/UUIDs/keys not in textFields
        else {
          if (typeof value === "string" && textFields.includes(key)) {
            filters[key] = {
              contains: value,
              mode: "insensitive",
            };
          } else {
            filters[key] = value;
          }
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
    let sortBy = this.query.sortBy || defaultSortBy;
    const rawSortOrder = this.query.sortOrder || defaultSortOrder;
    const sortOrder = (rawSortOrder === "asc" || rawSortOrder === "desc") ? rawSortOrder : "desc";

    // Validate that the sortBy field is in the allowedFields list (if populated)
    if (this.allowedFields.length > 0 && !this.allowedFields.includes(sortBy)) {
      sortBy = defaultSortBy;
    }

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

    let page = Number(this.query.page);
    let limit = Number(this.query.limit);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

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
