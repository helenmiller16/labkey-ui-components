export interface QueryConfig {
    // Not the final design, for illustration purposes only.
    id: string;
    schemaName: string;
    queryName: string;
    viewName: string;
}

export interface QueryModel extends QueryConfig {
    // Not the final design, for illustration purposes only.
    data: { [key: string]: any };
}

export interface QueryModelLoader {
    // Not final design, for illustration purposes only.
    fetch: (model: QueryModel) => Promise<any>;
    fetchSelections: (model: QueryModel) => Promise<any>;
}

export const DefaultQueryModelLoader: QueryModelLoader = {
    // Not final design, for illustration purposes only.
    fetch(model: QueryModel) {
        return new Promise((resolve, reject) => {});
    },

    fetchSelections(model: QueryModel) {
        return new Promise((resolve, reject) => {});
    },
};
