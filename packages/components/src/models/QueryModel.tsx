import { Query } from '@labkey/api';

export interface QueryConfig {
    // Not the final design, for illustration purposes only.
    id: string;
    schemaName: string;
    queryName: string;
    viewName: string;
    maxRows?: number;
    offset?: number;
}

export interface QueryModel extends QueryConfig {
    // Not the final design, for illustration purposes only.
    rowCount?: number;
    loadingRows?: boolean;
    loadingSelections?: boolean;
    selections?: Array<any>;
    rows?: { [key: string]: any };
}

export interface QueryModelLoader {
    // Not final design, for illustration purposes only.
    fetch: (model: QueryModel) => Promise<any>;
    fetchSelections: (model: QueryModel) => Promise<any>;
}

export const DefaultQueryModelLoader: QueryModelLoader = {
    // Not final design, for illustration purposes only.
    fetch(model: QueryModel) {
        return new Promise((resolve, reject) => {
            const config = {
                requiredVersion: 17.1,
                method: 'POST',
                schemaName: model.schemaName,
                queryName: model.queryName,
                viewName: model.viewName,
                maxRows: model.maxRows,
                offset: model.offset,
                // TODO: columns
                // TODO: sorts
                // TODO: filters
                // TODO: container path & filter
                success: (response, request) => {
                    resolve({ response, request });
                },
                failure: (response, request) => {
                    console.error('Error retrieving data');
                    reject({ response, request });
                },
            };
            Query.selectRows(config);
        });
    },

    fetchSelections(model: QueryModel) {
        return new Promise((resolve, reject) => {
            // TODO
            resolve({ selections: [] });
        });
    },
};
