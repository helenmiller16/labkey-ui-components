/*
 * Copyright (c) 2019 LabKey Corporation. All rights reserved. No portion of this work may be reproduced in
 * any form or by any electronic or mechanical means without written permission from LabKey Corporation.
 */
import { List, Map, Set } from 'immutable'
import { Ajax, Filter, Query, Utils } from '@labkey/api'
import $ from 'jquery'

import { getQueryDetails } from './query/api'
import { CHECKBOX_OPTIONS, EXPORT_TYPES } from './query/constants'
import { isEqual } from './query/filter'
import { QueryColumn, QueryInfo, SchemaQuery, ViewInfo } from './query/model'
import { buildURL, getSortFromUrl } from './util/ActionURL'
import { DataViewInfo, QueryGridModel, VisualizationConfigModel } from './model'
import { bindColumnRenderers } from './renderers'
import {
    getQueryGridModelsForSchema,
    getQueryGridModelsForSchemaQuery,
    updateQueryGridModel,
    updateSelections
} from './reducers'
import { FASTA_EXPORT_CONTROLLER, GENBANK_EXPORT_CONTROLLER } from "./constants";
import { getLocation, replaceParameter, replaceParameters } from "./util/URL";

export function init(model: QueryGridModel) {
    let newModel = updateQueryGridModel(model, {}, false);

    if (!newModel.isLoaded) {
        if (newModel.bindURL) {
            newModel = updateQueryGridModel(newModel, {
                isLoading: true,
                ...bindURLProps(newModel)
            });
        }
        else {
            newModel = updateQueryGridModel(newModel, {isLoading: true});
        }

        fetchQueryInfo(newModel).then(queryInfo => {
            newModel = updateQueryGridModel(newModel, {
                queryInfo: bindQueryInfo(queryInfo)
            });

            // TODO not yet ready to handle the editable case for the shared component
            // if (newModel.editable) {
            //     initEditorModel(newModel);
            // }

            load(newModel);
        });
    }
    else if (hasURLChange(newModel) && newModel.bindURL) {
        newModel = updateQueryGridModel(newModel, bindURLProps(newModel));
        load(newModel);
    }
}

export function selectAll(key: string, schemaName: string, queryName: string, filterList: List<Filter.Filter>): Promise<ISelectResponse> {

    const filters = filterList.reduce((prev, next)=> {
        return Object.assign(prev, {[next.getURLParameterName()]: next.getValue()});
    }, {});

    return new Promise((resolve, reject) => {
        return Ajax.request({
            url: buildURL('query', 'selectAll.api'),
            method: 'POST',
            params: Object.assign({
                schemaName,
                queryName,
                'query.selectionKey': key,
            }, filters),
            success: Utils.getCallbackWrapper((response) => {
                resolve(response);
            }),
            failure: Utils.getCallbackWrapper((response) => {
                reject(response);
            }),
        });
    });
}


export function gridSelectAll(model: QueryGridModel) {

    const id = model.getId();

    return selectAll(id, model.schema, model.query, model.getFilters()).then(data => {

        if (data && data.count > 0) {
            return getSelected(id).then(response => {
                updateSelections(model, {
                    selectedIds: List(response.selected)
                })

            }).catch(err => {
                const error = err ? err : {message: 'Something went wrong in selecting all items for this grid (name: ' + model.getModelName() + ', id:' + id + ')'};
                handleQueryErrorAction(model, error);
            });
        }
    })

}

export function sort(model: QueryGridModel, columnIndex: string, dir: string) {
    if (model.bindURL) {
        const urlDir = dir == '+' ? '' : '-';
        replaceParameters(getLocation(), Map<string, any>({
            [model.createParam('sort')]: `${urlDir}${columnIndex}`
        }));
    }
    else {
        let newModel = updateQueryGridModel(model, {
            sorts: dir + columnIndex // TODO: Support multiple sorts
        });

        load(newModel)
    }
}

// Handle single row select/deselect from the QueryGrid checkbox column
export function toggleGridRowSelection(model: QueryGridModel, row: Map<string, any>, checked: boolean) {
    let pkValue;
    let pkCols: List<QueryColumn> = model.queryInfo.getPkCols();

    if (pkCols.size === 1) {
        let pkCol: QueryColumn = pkCols.first();
        pkValue = row.getIn([pkCol.name, 'value']);

        setSelected(model.getId(), checked, pkValue).then(response => {
            const stringKey = pkValue !== undefined ? pkValue.toString(): pkValue;
            const selected: List<string> = model.selectedIds;
            let selectedState: CHECKBOX_OPTIONS;

            if (checked) {
                // if one is checked, value cannot be 'NONE'
                const allSelected: boolean = model.data.every(d => {
                    // compare if item is already 'checked' or will be 'checked' by this action
                    let keyVal = d.getIn([pkCol.name, 'value']) !== undefined ? d.getIn([pkCol.name, 'value']).toString() : undefined;

                    return keyVal === stringKey || selected.indexOf(keyVal) !== -1;
                });

                selectedState = allSelected ? CHECKBOX_OPTIONS.ALL : CHECKBOX_OPTIONS.SOME;
            }
            else {
                // if unchecking, value cannot be 'ALL'
                const someSelected: boolean = model.data.some(d => {
                    // compare if item is already 'checked' or will be 'unchecked' by this action
                    let keyVal = d.getIn([pkCol.name, 'value']) !== undefined ? d.getIn([pkCol.name, 'value']).toString() : undefined;
                    return keyVal !== stringKey && selected.indexOf(keyVal) !== -1;
                });

                selectedState = someSelected ? CHECKBOX_OPTIONS.SOME : CHECKBOX_OPTIONS.NONE;
            }

            const selectedIds = checked ? selected.push(stringKey) : selected.delete(selected.findIndex(item => item === stringKey));

            updateQueryGridModel(model, {
                selectedState: selectedState,
                selectedQuantity: response.count,
                selectedIds: selectedIds
            });
        });
    }
    else {
        console.warn('Selection requires only one key be available. Unable to toggle selection for specific keyValue. Keys:', pkCols.toJS());
    }
}

export function toggleGridSelected(model: QueryGridModel, checked: boolean) {
    if (checked) {
        setGridSelected(model, checked);
    }
    else {
        setGridUnselected(model);
    }
}

export function clearError(model: QueryGridModel) {
    if (model.isError) {
        updateQueryGridModel(model, {
            isError: false,
            message: undefined
        });
    }
}

export function schemaInvalidate(schemaName: string) {
    getQueryGridModelsForSchema(schemaName).map((model) => invalidate(model));
}

export function queryInvalidate(schemaQuery: SchemaQuery) {
    getQueryGridModelsForSchemaQuery(schemaQuery).map((model) => invalidate(model));
}

export function invalidate(model: QueryGridModel): QueryGridModel {
    return updateQueryGridModel(model, {
        data: Map<any, List<any>>(),
        dataIds: List<any>(),
        isError: false,
        isLoaded: false,
        isLoading: false,
        message: undefined
    });
}

export function loadPage(model: QueryGridModel, pageNumber: number) {
    if (pageNumber !== model.pageNumber) {
        if (model.bindURL) {
            replaceParameters(getLocation(), Map<string, any>({
                [model.createParam('p')]: pageNumber > 1 ? pageNumber : undefined
            }));
        }
        else {
            let newModel = updateQueryGridModel(model, {pageNumber: pageNumber > 1 ? pageNumber : 1});
            load(newModel);
        }
    }
}

export function refresh(model: QueryGridModel) {
    let newModel = invalidate(model);

    if (model.allowSelection) {
        setGridUnselected(newModel);
    }

    load(newModel);
}

export function reloadQueryGridModel(model: QueryGridModel) {
    const newModel = updateQueryGridModel(model, {
        isLoading: true,
        ...bindURLProps(model)
    });
    load(newModel);
}

// Takes a List<Filter.Filter> and remove each filter from the grid model
// Alternately, the 'all' flag can be set to true to remove all filters. This
// setting takes precedence over the filters list.
export function removeFilters(model: QueryGridModel, filters?: List<any>, all: boolean = false) {
    if (model.bindURL) {
        replaceParameters(getLocation(), getFilterParameters(filters, true));
    }
    else {
        let newModel = model;
        if (model.filterArray.count()) {
            if (all) {
                newModel = updateQueryGridModel(newModel, {filterArray: List<any>()});
            }
            else if (filters && filters.count()) {
                let urls = filters.reduce((urls, filter: any) => {
                    return urls.add(filter.getURLParameterName() + filter.getURLParameterValue());
                }, Set());

                let filtered = model.filterArray.filter((f: any) => {
                    return !urls.has(f.getURLParameterName() + f.getURLParameterValue());
                });

                if (filtered.count() < model.filterArray.count()) {
                    newModel = updateQueryGridModel(newModel, {filterArray: filtered});
                }
            }
        }

        load(newModel);
    }
}

export function addFilters(model: QueryGridModel, filters: List<Filter.Filter>) {
    if (model.bindURL) {
        replaceParameters(getLocation(), getFilterParameters(filters));
    }
    else {
        if (filters.count()) {
            let newModel = updateQueryGridModel(model, {filterArray: model.filterArray.merge(filters)});
            load(newModel);
        }
    }
}

export function load(model: QueryGridModel) {
    // validate view exists prior to initiating request
    if (model.view && model.queryInfo && !model.queryInfo.getView(model.view)) {
        setError(model, `Unable to find view "${model.view}".`);
        return;
    }

    let newModel = updateQueryGridModel(model, {isLoading: true});

    newModel.loader.fetch(newModel, getLocation()).then(response => {
        // TODO not yet ready to handle the editable case for the shared component
        // load data into editor
        // if (newModel.editable) {
        //     dispatch({
        //         type: TYPES.GRID_EDITOR_LOAD_DATA,
        //         model: newModel,
        //         response
        //     });
        // }

        const { data, dataIds, totalRows } = response;
        newModel = updateQueryGridModel(newModel, {
            isError: false,
            isLoading: false,
            isLoaded: true,
            message: undefined,
            selectedState: getSelectedState(dataIds, model.selectedIds, model.maxRows, totalRows),
            totalRows,
            data,
            dataIds
        });

        if (newModel.allowSelection) {
            fetchSelectedIfNeeded(newModel);
        }
    }, payload => {
        handleQueryErrorAction(payload.model, payload.error);
    });
}

function bindURLProps(model: QueryGridModel): Partial<QueryGridModel> {
    let props = {
        filterArray: List<Filter.Filter>(),
        pageNumber: 1,
        sorts: model.sorts || undefined,
        urlParamValues: Map<string, any>().asMutable(),
        view: undefined
    };

    const location = getLocation();
    const queryString = location.search;
    const p = location.query.get(model.createParam('p'));
    const q = location.query.get(model.createParam('q'));
    const view = location.query.get(model.createParam('view'));

    props.filterArray = List<Filter.Filter>(Filter.getFiltersFromUrl(queryString, model.urlPrefix))
        .concat(bindSearch(q))
        .toList();
    props.sorts = getSortFromUrl(queryString, model.urlPrefix);
    props.view = view;

    if (model.isPaged) {
        let pageNumber = parseInt(p);
        if (!isNaN(pageNumber)) {
            props.pageNumber = pageNumber;
        }
    }

    // pick up other parameters as indicated by the model
    if (model.urlParams) {
        model.urlParams.forEach((paramName) => {
            const value = location.query.get(model.createParam(paramName));
            if (value !== undefined) {
                props.urlParamValues.set(paramName, value);
            }
        });
    }

    props.urlParamValues = props.urlParamValues.asImmutable();


    return props;
}

function bindSearch(searchTerm: string): List<Filter.Filter> {
    let searchFilters = List<Filter.Filter>().asMutable();

    if (searchTerm) {
        searchTerm.split(';').forEach((term) => {
            if (term) {
                searchFilters.push(Filter.create('*', term, Filter.Types.Q));
            }
        });
    }

    return searchFilters.asImmutable();
}

interface IExportOptions {
    columns?: string
    filters?: List<Filter.Filter>
    sorts?: string
    showRows?: 'ALL' | 'SELECTED' | 'UNSELECTED'
    selectionKey?: string
}

export function exportRows(type: EXPORT_TYPES, schemaQuery: SchemaQuery, options?: IExportOptions): void {

    let params: any = {
        schemaName: schemaQuery.schemaName,
        ['query.queryName']: schemaQuery.queryName,
        ['query.showRows']: options.showRows ? [options.showRows] : ['ALL'],
        ['query.selectionKey']: options.selectionKey ? options.selectionKey : undefined
    };

    if (schemaQuery.viewName) {
        params['query.viewName'] = schemaQuery.viewName;
    }

    // 32052: Apply default headers (CRSF, etc)
    for (let i in LABKEY.defaultHeaders) {
        if (LABKEY.defaultHeaders.hasOwnProperty(i)) {
            params[i] = LABKEY.defaultHeaders[i];
        }
    }

    if (type === EXPORT_TYPES.CSV) {
        params['delim'] = 'COMMA';
    }

    if (options) {
        if (options.columns) {
            params['query.columns'] = options.columns;
        }

        if (options.filters) {
            options.filters.forEach((f) => {
                if (f) {
                    params[f.getURLParameterName()] = [f.getURLParameterValue()];
                }
            })
        }

        if (options.sorts) {
            params['query.sort'] = options.sorts;
        }
    }

    let controller, action;
    if (type === EXPORT_TYPES.CSV || type === EXPORT_TYPES.TSV) {
        controller = 'query';
        action = 'exportRowsTsv.post';
    }
    else if (type === EXPORT_TYPES.EXCEL) {
        controller = 'query';
        action = 'exportRowsXLSX.post';
    }
    else if (type === EXPORT_TYPES.FASTA) {
        controller = FASTA_EXPORT_CONTROLLER;
        action = 'export.post';
        params['format'] = 'FASTA';
    }
    else if (type === EXPORT_TYPES.GENBANK) {
        controller = GENBANK_EXPORT_CONTROLLER;
        action = 'export.post';
        params['format'] = 'GENBANK';
    }
    else {
        throw new Error("Unknown export type: " + type);
    }
    const url = buildURL(controller, action, undefined, { returnURL: false });

    // POST a form
    let form = $(`<form method="POST" action="${url}">`);
    $.each(params, function(k, v) {
        form.append($(`<input type="hidden" name="${k.toString()}" value="${v}">`));
    });
    $('body').append(form);
    form.trigger( "submit" );
}

export function doExport(model: QueryGridModel, type: EXPORT_TYPES) {
    const { allowSelection, selectedState } = model;
    const showRows = allowSelection && selectedState !== CHECKBOX_OPTIONS.NONE ? 'SELECTED' : 'ALL';

    exportRows(type, SchemaQuery.create(model.schema, model.query, model.view), {
        filters: model.getFilters(),
        columns: model.getExportColumnsString(),
        sorts: model.getSorts(),
        showRows,
        selectionKey: model.getId()
    });
}

export function selectView(model: QueryGridModel, view: ViewInfo) {
    const viewName = view.isDefault ? undefined : view.name;
    replaceParameter(getLocation(), model.createParam('view'), viewName);
}

function hasURLChange(model: QueryGridModel): boolean {
    if (!model || !model.bindURL) {
        return false;
    }

    const nextProps = bindURLProps(model);

    // filterArray and sorts are set specially so we check those specially.
    if (!isEqual(nextProps.filterArray, model.filterArray))
        return true;
    else if (nextProps.view !== model.view)
        return true;
    else if (nextProps.sorts !== model.sorts)
        return true;

    const mismatchIndex = model.urlParams.findIndex((name) => {
        return nextProps.urlParamValues.get(name) !== model.urlParamValues.get(name)
    });

    return mismatchIndex >= 0;
}

function fetchQueryInfo(model: QueryGridModel): Promise<QueryInfo> {
    if (model.queryInfo) {
        return Promise.resolve(model.queryInfo);
    }

    return getQueryDetails({
        schemaName: model.schema,
        queryName: model.query
    })
}

function bindQueryInfo(queryInfo: QueryInfo): QueryInfo {
    if (queryInfo) {
        return queryInfo.merge({
            columns: bindColumnRenderers(queryInfo.columns)
        }) as QueryInfo;
    }

    return queryInfo;
}

function getSelectedState(dataIds: List<string>, selected: List<string>, maxRows: number, totalRows: number): CHECKBOX_OPTIONS {

    const selectedOnPage: number = dataIds.filter((id) => selected.indexOf(id) !== -1).size,
        totalSelected: number = selected.size;

    if (
        maxRows === selectedOnPage ||
        totalRows === totalSelected && totalRows !== 0 ||
        selectedOnPage === dataIds.size && selectedOnPage > 0
    ) {
        return CHECKBOX_OPTIONS.ALL;
    }
    else if (totalSelected > 0) {
        // if model has any selected show checkbox as indeterminate
        return CHECKBOX_OPTIONS.SOME;
    }

    return CHECKBOX_OPTIONS.NONE;
}

function fetchSelectedIfNeeded(model: QueryGridModel) {
    const { allowSelection, isLoaded, loader, selectedLoaded } = model;

    if (allowSelection && isLoaded && !selectedLoaded && loader.fetchSelection) {
        loader.fetchSelection(model).then(response => {
            const selectedIds = response.selectedIds;

            if (selectedIds !== undefined && selectedIds.size) {
                const { dataIds, maxRows, totalRows } = model;
                const selectedState = getSelectedState(dataIds, selectedIds, maxRows, totalRows);

                updateQueryGridModel(model, {
                    selectedLoaded: true,
                    selectedQuantity: selectedIds.size,
                    selectedIds,
                    selectedState
                });
            }
            else {
                updateQueryGridModel(model, {
                    selectedLoaded: true
                });
            }
        }, payload => {
            handleQueryErrorAction(payload.model, payload.error);
        });
    }
}

interface IGetSelectedResponse {
    selected: Array<any>
}

export function getSelected(key: string): Promise<IGetSelectedResponse> {
    return new Promise((resolve, reject) => {
        return Ajax.request({
            url: buildURL('query', 'getSelected.api', {
                key,
            }),
            success: Utils.getCallbackWrapper((response) => {
                resolve(response);
            }),
            failure: Utils.getCallbackWrapper((response) => {
                reject(response);
            })
        });
    });
}

interface ISelectResponse {
    count: number
}

function clearSelected(key: string): Promise<ISelectResponse> {
    return new Promise((resolve, reject) => {
        return Ajax.request({
            url: buildURL('query', 'clearSelected.api', {
                key,
            }),
            method: 'POST',
            success: Utils.getCallbackWrapper((response) => {
                resolve(response);
            }),
            failure: Utils.getCallbackWrapper((response) => {
                reject(response);
            })
        });
    });
}

function setSelected(key: string, checked: boolean, ids: Array<string> | string): Promise<ISelectResponse> {
    return new Promise((resolve, reject) => {
        return Ajax.request({
            url: buildURL('query', 'setSelected.api', {
                key,
                checked
            }),
            method: 'POST',
            params: {
                id: ids
            },
            success: Utils.getCallbackWrapper((response) => {
                resolve(response);
            }),
            failure: Utils.getCallbackWrapper((response) => {
                reject(response);
            }),
        });
    })
}

function setGridSelected(model: QueryGridModel, checked: boolean) {
    const { dataIds } = model;
    const modelId = model.getId();

    let ids: Array<string>;
    if (dataIds && dataIds.size) {
        ids = dataIds.toArray();
    }

    setSelected(modelId, checked, ids).then(response => {
        const dataIds = model.dataIds;
        const currentSelected = model.selectedIds;

        updateQueryGridModel(model, {
            selectedIds: checked ? currentSelected.merge(dataIds) : List<string>(),
            selectedQuantity: response.count,
            selectedState: checked ? CHECKBOX_OPTIONS.ALL : CHECKBOX_OPTIONS.NONE
        });
    });
}

function setGridUnselected(model: QueryGridModel) {
    clearSelected(model.getId()).then(() => {
        updateQueryGridModel(model, {
            selectedIds: List<string>(),
            selectedQuantity: 0,
            selectedState: CHECKBOX_OPTIONS.NONE
        });
    }).catch(err => {
        const error = err ? err : {message: 'Something went wrong'};
        handleQueryErrorAction(model, error);
    })
}

function getFilterParameters(filters: List<any>, remove: boolean = false): Map<string, string> {

    const params = {};

    filters.map((filter) => {
        if (remove) {
            params[filter.getURLParameterName()] = undefined;
        }
        else {
            params[filter.getURLParameterName()] = filter.getURLParameterValue();
        }
    });

    return Map<string, string>(params);
}

export function getVisualizationConfig(reportId: string): Promise<VisualizationConfigModel> {
    return new Promise((resolve, reject) => {
        Query.Visualization.get({
            reportId,
            name: undefined,
            schemaName: undefined,
            queryName: undefined,
            success: (response) => {
                resolve(VisualizationConfigModel.create(response.visualizationConfig));
            },
            failure: reject
        });
    });
}

export function fetchCharts(schemaQuery: SchemaQuery): Promise<List<DataViewInfo>> {
    return new Promise((resolve, reject) => {
        Ajax.request({
            url: buildURL('study-reports', 'getReportInfos.api', {
                schemaName: schemaQuery.getSchema(),
                queryName: schemaQuery.getQuery()
            }),
            success: Utils.getCallbackWrapper((response: any) => {
                if (response && response.success) {
                    let result = response.reports.reduce((list, rawDataViewInfo) => list.push(new DataViewInfo(rawDataViewInfo)), List<DataViewInfo>());
                    resolve(result);
                }
                else {
                    reject({
                        error: 'study-report-getReportInfos.api responded to success without success'
                    });
                }
            }),
            failure: Utils.getCallbackWrapper((error) => {
                reject(error);
            }),
        })
    });
}

function setError(model: QueryGridModel, message: string) {
    updateQueryGridModel(model, {
        isLoading: false,
        isLoaded: true,
        isError: true,
        message
    })
}

function handleQueryErrorAction(model: QueryGridModel, error: any) {
    setError(model, error ? (error.status ? error.status + ': ' : '') + (error.message ? error.message : error.exception) : 'Query error');
}