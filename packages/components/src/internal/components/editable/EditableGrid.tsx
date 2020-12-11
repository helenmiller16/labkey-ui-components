/*
 * Copyright (c) 2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, { ChangeEvent, createRef, ReactNode, RefObject } from 'react';
import ReactN from 'reactn';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';
import { List, Map, OrderedMap, Set } from 'immutable';
import $ from 'jquery';

import {
    addRows,
    beginDrag,
    clearSelection,
    copyEvent,
    endDrag,
    inDrag,
    pasteEvent,
    removeRow,
    removeRows,
    select,
    updateGridFromBulkForm,
} from '../../actions';
import { getQueryGridModel } from '../../global';

import { headerSelectionCell } from '../../renderers';
import { QueryInfoForm, QueryInfoFormProps } from '../forms/QueryInfoForm';
import { MAX_EDITABLE_GRID_ROWS, GRID_CHECKBOX_OPTIONS, GRID_EDIT_INDEX, GRID_SELECTION_INDEX } from '../../constants';
import {
    Grid,
    GridColumn,
    DeleteIcon,
    Alert,
    LoadingSpinner,
    BulkAddUpdateForm,
    QueryColumn,
    QueryGridModel,
} from '../../..';

import { blurActiveElement, capitalizeFirstChar, caseInsensitive } from '../../util/utils';

import { EditorModel, ValueDescriptor } from '../../models';

import { AddRowsControl, AddRowsControlProps, PlacementType } from './Controls';
import { Cell } from './Cell';

const COUNT_COL = new GridColumn({
    index: GRID_EDIT_INDEX,
    tableCell: true,
    title: 'Row',
    width: 45,
    // style cast to "any" type due to @types/react@16.3.14 switch to csstype package usage which does not declare
    // "textAlign" property correctly for <td> elements.
    cell: (d, r, c, rn) => (
        <td className="cellular-count" key={c.index} style={{ textAlign: c.align || 'left' } as any}>
            <div className="cellular-count-static-content">{rn + 1}</div>
        </td>
    ),
});

// the column index for cell values and cell messages does not include either the selection
// column or the row number column, so we adjust the value passed to <Cell> to accommodate.
function inputCellFactory(
    model: QueryGridModel,
    editorModel: EditorModel,
    allowSelection?: boolean,
    hideCountCol?: boolean,
    columnMetadata?: EditableColumnMetadata,
    readonlyRows?: List<any>,
    onCellModify?: () => void
) {
    return (value: any, row: any, c: GridColumn, rn: number, cn: number) => {
        let colOffset = 0;
        if (allowSelection) colOffset += 1;
        if (!hideCountCol) colOffset += 1;

        const colIdx = cn - colOffset;

        const isReadonlyCol = columnMetadata ? columnMetadata.readOnly : false;
        let isReadonlyRow = false;

        if (!isReadonlyCol && readonlyRows) {
            const keyCols = model.getKeyColumns();
            if (keyCols.size === 1) {
                const key = caseInsensitive(row.toJS(), keyCols.get(0).fieldKey);
                isReadonlyRow = key !== undefined && readonlyRows.contains(key);
            } else {
                console.warn(
                    'Setting readonly rows for models with ' + keyCols.size + ' keys is not currently supported.'
                );
            }
        }

        return (
            <Cell
                col={c.raw}
                colIdx={colIdx}
                filteredLookupKeys={columnMetadata?.filteredLookupKeys}
                filteredLookupValues={columnMetadata?.filteredLookupValues}
                focused={editorModel ? editorModel.isFocused(colIdx, rn) : false}
                key={inputCellKey(c.raw, row)}
                message={editorModel ? editorModel.getMessage(colIdx, rn) : undefined}
                modelId={model.getId()}
                onCellModify={onCellModify}
                placeholder={columnMetadata?.placeholder}
                readOnly={isReadonlyCol || isReadonlyRow}
                rowIdx={rn}
                selected={editorModel ? editorModel.isSelected(colIdx, rn) : false}
                selection={editorModel ? editorModel.inSelection(colIdx, rn) : false}
                values={editorModel ? editorModel.getValue(colIdx, rn) : List<ValueDescriptor>()}
            />
        );
    };
}

function inputCellKey(col: QueryColumn, row: any): string {
    const indexKey = row.get(GRID_EDIT_INDEX);

    if (indexKey === undefined || indexKey === null) {
        throw new Error(`QueryFormInputs.encodeName: Unable to encode name for field "${col.fieldKey}".`);
    }

    return [col.fieldKey, indexKey].join('_$Cell$_');
}

export interface EditableColumnMetadata {
    filteredLookupValues?: List<string>;
    filteredLookupKeys?: List<any>;
    placeholder?: string;
    readOnly?: boolean;
    toolTip?: ReactNode;
}

export interface EditableGridProps {
    addControlProps?: Partial<AddRowsControlProps>;
    allowAdd?: boolean;
    allowBulkAdd?: boolean;
    allowBulkRemove?: boolean;
    allowBulkUpdate?: boolean;
    allowFieldDisable?: boolean;
    allowRemove?: boolean;
    bordered?: boolean;
    bulkAddProps?: Partial<QueryInfoFormProps>;
    bulkAddText?: string;
    bulkRemoveText?: string;
    bulkUpdateProps?: Partial<QueryInfoFormProps>;
    bulkUpdateText?: string;
    columnMetadata?: Map<string, EditableColumnMetadata>;
    condensed?: boolean;
    disabled?: boolean;
    emptyGridMsg?: string;
    forUpdate?: boolean;
    hideCountCol?: boolean;
    initialEmptyRowCount?: number;
    isSubmitting?: boolean;
    maxTotalRows?: number;
    model: QueryGridModel;
    notDeletable?: List<any>; // list of key values that cannot be deleted.
    onCellModify?: () => void;
    onRowCountChange?: (rowCount?: number) => any;
    readOnlyColumns?: List<string>;
    readonlyRows?: List<any>; // list of key values for rows that are readonly.
    removeColumnTitle?: string;
    responsive?: boolean;
    rowNumColumn?: GridColumn;
    striped?: boolean;
}

export interface EditableGridState {
    selected: Set<string>;
    selectedState: GRID_CHECKBOX_OPTIONS;
    showBulkAdd: boolean;
    showBulkUpdate: boolean;
}

export class EditableGrid extends ReactN.PureComponent<EditableGridProps, EditableGridState> {
    static defaultProps = {
        allowAdd: true,
        allowBulkAdd: false,
        allowBulkRemove: false,
        allowBulkUpdate: false,
        allowRemove: false,
        removeColumnTitle: 'Delete',
        addControlProps: {
            nounPlural: 'Rows',
            nounSingular: 'Row',
        },
        bordered: false,
        bulkAddText: 'Bulk Add',
        bulkRemoveText: 'Delete Rows',
        bulkUpdateText: 'Bulk Update',
        columnMetadata: Map<string, EditableColumnMetadata>(),
        notDeletable: List<any>(),
        condensed: false,
        disabled: false,
        isSubmitting: false,
        initialEmptyRowCount: 1,
        striped: false,
        maxTotalRows: MAX_EDITABLE_GRID_ROWS,
        hideCountCol: false,
        responsive: false,
        rowNumColumn: COUNT_COL,
    };

    private maskDelay: number;
    private readonly table: RefObject<any>;
    private readonly wrapper: RefObject<any>;

    constructor(props: EditableGridProps) {
        // @ts-ignore // see https://github.com/CharlesStover/reactn/issues/126
        super(props);

        this.table = createRef();
        this.wrapper = createRef();

        this.state = {
            selected: Set<string>(),
            selectedState: GRID_CHECKBOX_OPTIONS.NONE,
            showBulkAdd: false,
            showBulkUpdate: false,
        };
    }

    UNSAFE_componentWillMount(): void {
        this.initModel(this.props);
    }

    UNSAFE_componentWillReceiveProps(nextProps: EditableGridProps): void {
        this.initModel(nextProps);
    }

    initModel = (props: EditableGridProps): void => {
        const { initialEmptyRowCount } = props;
        const model = this.getModel();

        if (model.isLoaded && !model.isError && model.data.size === 0 && initialEmptyRowCount > 0) {
            addRows(model, initialEmptyRowCount);
            this.onRowCountChange();
        }
    };

    onRowCountChange = (): void => {
        const { initialEmptyRowCount, onRowCountChange } = this.props;
        onRowCountChange?.();

        const { rowCount } = this.getEditorModel();

        if (rowCount === 0 && initialEmptyRowCount > 0) {
            addRows(this.getModel(), initialEmptyRowCount);
        }
    };

    componentDidMount = (): void => {
        document.addEventListener('click', this.onDocumentClick);
        document.addEventListener('copy', this.onCopy);
        document.addEventListener('paste', this.onPaste);
    };

    componentWillUnmount = (): void => {
        document.removeEventListener('click', this.onDocumentClick);
        document.removeEventListener('copy', this.onCopy);
        document.removeEventListener('paste', this.onPaste);
    };

    select = (row: Map<string, any>, evt: ChangeEvent<HTMLInputElement>): void => {
        const key = row.get(GRID_EDIT_INDEX);
        const checked = evt.currentTarget.checked === true;

        this.setState(state => {
            const selected = checked ? state.selected.add(key) : state.selected.remove(key);

            let selectedState = GRID_CHECKBOX_OPTIONS.SOME;
            if (selected.size === 0) {
                selectedState = GRID_CHECKBOX_OPTIONS.NONE;
            } else if (this.getModel().dataIds.size === selected.size) {
                selectedState = GRID_CHECKBOX_OPTIONS.ALL;
            }

            return {
                selected,
                selectedState,
            };
        });
    };

    selectAll = (evt: ChangeEvent<HTMLInputElement>): void => {
        const model = this.getModel();
        const checked = evt.currentTarget.checked === true;

        this.setState(state => {
            const selected = checked && state.selectedState !== GRID_CHECKBOX_OPTIONS.ALL;
            return {
                selected: selected ? Set<string>(model.dataIds.toArray()) : Set<string>(),
                selectedState: selected ? GRID_CHECKBOX_OPTIONS.ALL : GRID_CHECKBOX_OPTIONS.NONE,
            };
        });
    };

    getColumns = (): List<QueryColumn> => {
        const model = this.getModel();

        if (this.props.forUpdate) {
            return model.getUpdateColumns(this.props.readOnlyColumns);
        }

        return model.getInsertColumns();
    };

    generateColumns = (): List<GridColumn> => {
        const {
            allowBulkRemove,
            allowBulkUpdate,
            allowRemove,
            columnMetadata,
            hideCountCol,
            rowNumColumn,
            readonlyRows,
            onCellModify,
        } = this.props;
        const model = this.getModel();
        const editorModel = this.getEditorModel();
        const gridColumns: GridColumn[] = [];
        if (!editorModel) {
            console.log('dont even have a model yet... why are we generating columns...');
        }

        if (allowBulkRemove || allowBulkUpdate) {
            gridColumns.push(
                new GridColumn({
                    index: GRID_SELECTION_INDEX,
                    title: '&nbsp;',
                    cell: (selected: boolean, row) => (
                        <input
                            style={{ margin: '0 8px' }}
                            checked={this.state.selected.contains(row.get(GRID_EDIT_INDEX))}
                            type="checkbox"
                            onChange={this.select.bind(this, row)}
                        />
                    ),
                })
            );
        }

        if (!hideCountCol) {
            gridColumns.push(rowNumColumn ?? COUNT_COL);
        }

        this.getColumns().forEach(qCol => {
            gridColumns.push(
                new GridColumn({
                    align: qCol.align,
                    cell: inputCellFactory(
                        model,
                        editorModel,
                        allowBulkRemove || allowBulkUpdate,
                        hideCountCol,
                        columnMetadata.get(qCol.fieldKey),
                        readonlyRows,
                        onCellModify
                    ),
                    index: qCol.fieldKey,
                    raw: qCol,
                    title: qCol.caption,
                    width: 100,
                })
            );
        });

        if (allowRemove) {
            gridColumns.push(
                new GridColumn({
                    index: GRID_EDIT_INDEX,
                    tableCell: true,
                    title: this.props.removeColumnTitle,
                    width: 45,
                    cell: (d, row: Map<string, any>, c, rn) => {
                        const keyCols = model.getKeyColumns();
                        let canDelete = true;
                        if (keyCols.size === 1) {
                            const key = caseInsensitive(row.toJS(), keyCols.get(0).fieldKey);
                            canDelete = !key || !this.props.notDeletable.contains(key);
                        } else {
                            console.warn(
                                'Preventing deletion for models with ' +
                                    keyCols.size +
                                    ' keys is not currently supported.'
                            );
                        }

                        return canDelete ? (
                            <td key={'delete' + rn}>
                                <DeleteIcon
                                    onDelete={event => {
                                        removeRow(model, d, rn);
                                        this.onRowCountChange();
                                    }}
                                />
                            </td>
                        ) : (
                            <td key={'delete' + rn}>&nbsp;</td>
                        );
                    },
                })
            );
        }

        return List(gridColumns);
    };

    renderColumnHeader = (col: GridColumn, metadataKey: string, required?: boolean): ReactNode => {
        const metadata = this.props.columnMetadata?.get(metadataKey);

        return (
            <>
                {col.title}
                {required && <span className="required-symbol"> *</span>}
                {metadata?.toolTip && (
                    <>
                        &nbsp;
                        <OverlayTrigger
                            placement="bottom"
                            overlay={
                                <Popover id={`popover-${col.index}`} bsClass="popover">
                                    {metadata.toolTip}
                                </Popover>
                            }
                        >
                            <i className="fa fa-question-circle" />
                        </OverlayTrigger>
                    </>
                )}
            </>
        );
    };

    headerCell = (col: GridColumn): ReactNode => {
        if (
            (this.props.allowBulkRemove || this.props.allowBulkUpdate) &&
            col.index.toLowerCase() === GRID_SELECTION_INDEX
        ) {
            return headerSelectionCell(this.selectAll, this.state.selectedState, false);
        }

        const model = this.getModel();
        const queryColumn = model.queryInfo?.getColumn(col.index);

        if (queryColumn) {
            return this.renderColumnHeader(col, queryColumn.fieldKey, queryColumn.required);
        }

        if (col?.showHeader) {
            return this.renderColumnHeader(col, col.title, false);
        }

        return null;
    };

    hideMask = (): void => {
        clearTimeout(this.maskDelay);
        this.toggleMask(false);
    };

    onDocumentClick = (event: any): void => {
        const { disabled } = this.props;
        const model = this.getModel();

        if (
            !disabled &&
            this.table?.current &&
            !$.contains(this.table.current, event.target) &&
            !$(event.target).parent('.cell-lookup') &&
            !inDrag(model.getId())
        ) {
            clearSelection(model.getId());
        }
    };

    onCopy = (event: any): void => {
        if (!this.props.disabled) {
            copyEvent(this.props.model.getId(), event);
        }
    };

    onKeyDown = (event: any): void => {
        if (!this.props.disabled) {
            select(this.props.model.getId(), event);
        }
    };

    onMouseDown = (event: any): void => {
        if (!this.props.disabled) {
            beginDrag(this.props.model.getId(), event);
        }
    };

    onMouseUp = (event: any): void => {
        if (!this.props.disabled) {
            endDrag(this.props.model.getId(), event);
        }
    };

    onPaste = (event: any): void => {
        if (!this.props.disabled) {
            const beforeRowCount = this.getEditorModel().rowCount;
            pasteEvent(
                this.props.model.getId(),
                event,
                this.showMask,
                this.hideMask,
                this.props.columnMetadata,
                this.props.readonlyRows,
                !this.props.allowAdd
            );
            const afterRowCount = this.getEditorModel().rowCount;
            if (beforeRowCount !== afterRowCount) {
                this.onRowCountChange();
            }
            this.props.onCellModify?.();
        }
    };

    showMask = (): void => {
        clearTimeout(this.maskDelay);
        this.maskDelay = window.setTimeout(this.toggleMask.bind(this, true), 300);
    };

    toggleMask = (show: boolean): void => {
        if (this.wrapper?.current) {
            $(this.wrapper.current).toggleClass('loading-mask', show === true);
        }
    };

    onAddRows = (count: number): void => {
        const model = this.getModel();
        const editorModel = this.getEditorModel();
        let toAdd = count;
        if (this.props.maxTotalRows && count + editorModel.rowCount > this.props.maxTotalRows) {
            toAdd = this.props.maxTotalRows - editorModel.rowCount;
        }
        addRows(model, toAdd);
        this.onRowCountChange();
    };

    toggleBulkAdd = (): void => {
        this.setState(
            state => ({ showBulkAdd: !state.showBulkAdd }),
            // Issue 38420: Without this, the BulkUpdate button always retains focus after modal is shown
            blurActiveElement
        );
    };

    toggleBulkUpdate = (): void => {
        this.setState(
            state => ({ showBulkUpdate: !state.showBulkUpdate }),
            // Issue 38420: Without this, the BulkUpdate button always retains focus after modal is shown
            blurActiveElement
        );
    };

    getModel = (): QueryGridModel => {
        return getQueryGridModel(this.props.model.getId());
    };

    getEditorModel = (): EditorModel => {
        const modelId = this.props.model.getId();
        return this.global.QueryGrid_editors.get(modelId);
    };

    getSelectedRowIndexes = (): List<number> => {
        const model = this.getModel();
        const { selected } = this.state;

        return model.data.reduce((indexes, dataMap, key) => {
            if (selected.has(key)) {
                return indexes.push(model.dataIds.indexOf(key));
            }
            return indexes;
        }, List<number>());
    };

    removeSelectedRows = (): void => {
        removeRows(this.getModel(), this.getSelectedRowIndexes());
        this.setState(() => ({
            selected: Set<string>(),
            selectedState: GRID_CHECKBOX_OPTIONS.NONE,
        }));
        this.onRowCountChange();
    };

    getAddControlProps = (): Partial<AddRowsControlProps> => {
        const { addControlProps, maxTotalRows } = this.props;
        const { rowCount } = this.getEditorModel();

        const props: Partial<AddRowsControlProps> = {
            ...addControlProps,
            maxTotalCount: maxTotalRows,
        };

        if (maxTotalRows && rowCount + addControlProps.maxCount > maxTotalRows) {
            props.maxCount = maxTotalRows - rowCount;
        }

        return props;
    };

    renderAddRowsControl = (placement: PlacementType): ReactNode => {
        const { isSubmitting } = this.props;
        return (
            <AddRowsControl
                {...this.getAddControlProps()}
                placement={placement}
                disable={
                    isSubmitting ||
                    (this.props.maxTotalRows && this.getEditorModel().rowCount >= this.props.maxTotalRows)
                }
                onAdd={this.onAddRows}
            />
        );
    };

    renderTopControls = (): ReactNode => {
        const {
            allowAdd,
            allowBulkAdd,
            allowBulkRemove,
            allowBulkUpdate,
            bulkAddText,
            bulkRemoveText,
            bulkUpdateText,
            initialEmptyRowCount,
            isSubmitting,
            addControlProps,
        } = this.props;
        const nounPlural = addControlProps ? addControlProps.nounPlural : 'rows';
        const editorModel = this.getEditorModel();
        const showAddOnTop = allowAdd && this.getControlsPlacement() !== 'bottom';
        const noValidSelection =
            this.state.selected.size === 0 ||
            (initialEmptyRowCount === 1 && editorModel.rowCount === 1 && !editorModel.hasData());
        const model = this.getModel();
        const canAddRows = !isSubmitting && model.data && model.data.size < this.props.maxTotalRows;

        return (
            <div className="row QueryGrid-bottom-spacing">
                {showAddOnTop && <div className="col-sm-3">{this.renderAddRowsControl('top')}</div>}
                <div className={showAddOnTop ? 'col-sm-9' : 'col-sm-12'}>
                    {allowBulkAdd && (
                        <span className="control-right">
                            <Button
                                title={
                                    canAddRows
                                        ? 'Add multiple ' + nounPlural + ' with the same values'
                                        : 'The grid contains the maximum number of ' + nounPlural + '.'
                                }
                                disabled={!canAddRows}
                                onClick={this.toggleBulkAdd}
                            >
                                {bulkAddText}
                            </Button>
                        </span>
                    )}
                    {allowBulkUpdate && (
                        <span className="control-right">
                            <Button
                                className="control-right"
                                disabled={noValidSelection}
                                onClick={this.toggleBulkUpdate}
                            >
                                {bulkUpdateText}
                            </Button>
                        </span>
                    )}
                    {allowBulkRemove && (
                        <span className="control-right">
                            <Button
                                className="control-right"
                                disabled={noValidSelection}
                                onClick={this.removeSelectedRows}
                            >
                                {bulkRemoveText}
                            </Button>
                        </span>
                    )}
                </div>
            </div>
        );
    };

    restoreBulkInsertData = (model: QueryGridModel, data: Map<string, any>): Map<string, any> => {
        const allInsertCols = OrderedMap<string, any>().asMutable();
        model.getInsertColumns().forEach(col => allInsertCols.set(col.name, undefined));
        return allInsertCols.merge(data).asImmutable();
    };

    bulkAdd = (data: OrderedMap<string, any>): Promise<any> => {
        const { addControlProps, bulkAddProps } = this.props;
        const { nounSingular, nounPlural } = addControlProps;

        const numItems = data.get('numItems');
        let updatedData = data.delete('numItems');

        if (numItems) {
            const model = this.getModel();

            if (bulkAddProps?.columnFilter) {
                updatedData = this.restoreBulkInsertData(model, updatedData);
            }

            addRows(model, numItems, updatedData);
            this.onRowCountChange();

            return Promise.resolve({
                message: 'Added ' + numItems + ' ' + (numItems > 1 ? nounPlural : nounSingular),
                success: true,
            });
        }

        return Promise.reject({
            exception: 'Quantity unknown.  No ' + nounPlural + ' added.',
        });
    };

    renderBulkAdd = (): ReactNode => {
        const { bulkAddProps, maxTotalRows } = this.props;
        const model = this.getModel();
        const maxToAdd =
            maxTotalRows && maxTotalRows - model.data.size < MAX_EDITABLE_GRID_ROWS
                ? maxTotalRows - model.data.size
                : MAX_EDITABLE_GRID_ROWS;

        const header = bulkAddProps?.header ? (
            <div className="editable-grid__bulk-header">{bulkAddProps.header}</div>
        ) : null;

        return (
            <QueryInfoForm
                allowFieldDisable={this.props.allowFieldDisable}
                onSubmitForEdit={this.bulkAdd}
                asModal={true}
                checkRequiredFields={false}
                showLabelAsterisk={true}
                submitForEditText={`Add ${capitalizeFirstChar(this.props.addControlProps.nounPlural)} to Grid`}
                maxCount={maxToAdd}
                onHide={this.toggleBulkAdd}
                onCancel={this.toggleBulkAdd}
                onSuccess={this.toggleBulkAdd}
                fieldValues={bulkAddProps?.fieldValues}
                columnFilter={bulkAddProps?.columnFilter}
                queryInfo={model.queryInfo}
                schemaQuery={model.queryInfo.schemaQuery}
                title={bulkAddProps?.title}
                header={header}
            />
        );
    };

    editSelectionInGrid = (updatedData: OrderedMap<string, any>): Promise<any> => {
        const updatedGrid = updateGridFromBulkForm(this.getModel(), updatedData, this.getSelectedRowIndexes());
        return Promise.resolve({ success: true, updatedGrid });
    };

    getControlsPlacement = (): PlacementType => {
        return this.props.addControlProps?.placement ?? 'bottom';
    };

    render() {
        const {
            addControlProps,
            allowAdd,
            bordered,
            bulkUpdateProps,
            condensed,
            emptyGridMsg,
            responsive,
            striped,
        } = this.props;
        const { showBulkAdd, showBulkUpdate } = this.state;
        const model = this.getModel();

        if (!model?.isLoaded) {
            return <LoadingSpinner />;
        }

        const { isError, message } = model;

        return (
            <div>
                {this.renderTopControls()}
                <div
                    className="editable-grid__container"
                    onKeyDown={this.onKeyDown}
                    onMouseDown={this.onMouseDown}
                    onMouseUp={this.onMouseUp}
                    ref={this.wrapper}
                >
                    <Grid
                        bordered={bordered}
                        calcWidths={true}
                        cellular={true}
                        columns={this.generateColumns()}
                        condensed={condensed}
                        data={model.getDataEdit()}
                        emptyText={emptyGridMsg}
                        headerCell={this.headerCell}
                        responsive={responsive}
                        rowKey={GRID_EDIT_INDEX}
                        striped={striped}
                        tableRef={this.table}
                    />
                </div>
                {allowAdd && this.getControlsPlacement() !== 'top' && this.renderAddRowsControl('bottom')}
                {isError && <Alert className="margin-top">{message ?? 'Something went wrong.'}</Alert>}
                {showBulkAdd && this.renderBulkAdd()}
                {showBulkUpdate && (
                    <BulkAddUpdateForm
                        selectedRowIndexes={this.getSelectedRowIndexes()}
                        singularNoun={addControlProps.nounSingular}
                        pluralNoun={addControlProps.nounPlural}
                        model={model}
                        columnFilter={bulkUpdateProps?.columnFilter}
                        onCancel={this.toggleBulkUpdate}
                        onComplete={this.toggleBulkUpdate}
                        onSubmitForEdit={this.editSelectionInGrid}
                    />
                )}
            </div>
        );
    }
}
