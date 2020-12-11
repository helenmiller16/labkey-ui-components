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
import React from 'react';
import classNames from 'classnames';
import { List } from 'immutable';
import { OverlayTrigger, Popover } from 'react-bootstrap';

import { cancelEvent, isCopy, isPaste, isSelectAll } from '../../events';
import { focusCell, inDrag, modifyCell, selectCell, unfocusCellSelection } from '../../actions';
import { CellMessage, ValueDescriptor } from '../../models';
import { KEYS, MODIFICATION_TYPES, SELECTION_TYPES } from '../../constants';

import { QueryColumn } from '../../..';

import { getQueryColumnRenderers } from '../../global';

import { LookupCell } from './LookupCell';

interface Props {
    col: QueryColumn;
    colIdx: number;
    filteredLookupKeys?: List<any>;
    filteredLookupValues?: List<string>;
    focused?: boolean;
    message?: CellMessage;
    modelId: string;
    name?: string;
    onCellModify?: () => any;
    placeholder?: string;
    readOnly?: boolean;
    rowIdx: number;
    selected?: boolean;
    selection?: boolean;
    values?: List<ValueDescriptor>;
}

export class Cell extends React.PureComponent<Props> {
    private changeTO: number;
    private clickTO: number;
    private displayEl: React.RefObject<any>;

    static defaultProps = {
        focused: false,
        message: undefined,
        selected: false,
        selection: false,
        values: List<ValueDescriptor>(),
    };

    constructor(props: Props) {
        super(props);

        this.displayEl = React.createRef();
    }

    componentDidUpdate(): void {
        if (!this.props.focused && this.props.selected) {
            this.displayEl.current.focus();
        }
    }

    handleSelectionBlur = (): void => {
        if (this.props.selected) {
            unfocusCellSelection(this.props.modelId);
        }
    };

    handleBlur = (evt: any): void => {
        clearTimeout(this.changeTO);
        this.replaceValue(evt.target.value);
    };

    handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        event.persist();

        clearTimeout(this.changeTO);
        this.changeTO = window.setTimeout(() => {
            this.replaceValue(event.target.value);
        }, 250);
    };

    isReadOnly = (): boolean => {
        return this.props.readOnly || this.props.col.readOnly;
    };

    handleDblClick = (): void => {
        if (this.isReadOnly()) return;

        clearTimeout(this.clickTO);
        const { colIdx, modelId, rowIdx } = this.props;
        focusCell(modelId, colIdx, rowIdx);
    };

    handleKeys = (event: React.KeyboardEvent<HTMLElement>): void => {
        const { colIdx, focused, modelId, rowIdx, selected, onCellModify } = this.props;

        switch (event.keyCode) {
            case KEYS.Alt:
            case KEYS.SelectKey:
            case KEYS.Shift:
            case KEYS.Ctrl:

            case KEYS.LeftArrow:
            case KEYS.UpArrow:
            case KEYS.RightArrow:
            case KEYS.DownArrow:

            case KEYS.PageUp:
            case KEYS.PageDown:
            case KEYS.Home:
            case KEYS.End:

            case KEYS.LeftMetaKey:
            case KEYS.FFLeftMetaKey:
            case KEYS.CapsLock:
                break;
            case KEYS.Backspace:
            case KEYS.Delete:
                if (!focused && selected && !this.isReadOnly()) {
                    cancelEvent(event);
                    modifyCell(modelId, colIdx, rowIdx, undefined, MODIFICATION_TYPES.REMOVE_ALL);
                    onCellModify?.();
                }
                break;
            case KEYS.Tab:
                if (selected) {
                    cancelEvent(event);
                    selectCell(modelId, event.shiftKey ? colIdx - 1 : colIdx + 1, rowIdx);
                }
                break;
            case KEYS.Enter:
                // focus takes precedence
                if (focused) {
                    cancelEvent(event);
                    selectCell(modelId, colIdx, rowIdx + 1);
                } else if (selected) {
                    cancelEvent(event);
                    focusCell(modelId, colIdx, rowIdx);
                }
                break;
            case KEYS.Escape:
                if (focused) {
                    cancelEvent(event);
                    selectCell(modelId, colIdx, rowIdx, undefined, true);
                }
                break;
            default:
                // any other key
                if (!focused && !isCopy(event) && !isPaste(event)) {
                    if (isSelectAll(event)) {
                        cancelEvent(event);
                        selectCell(modelId, colIdx, rowIdx, SELECTION_TYPES.ALL);
                    } else {
                        // Do not cancel event here, otherwise, key capture will be lost
                        focusCell(modelId, colIdx, rowIdx, !this.isReadOnly());
                    }
                }
        }
    };

    handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>): void => {
        const { colIdx, modelId, rowIdx } = this.props;

        if (inDrag(modelId)) {
            cancelEvent(event);
            selectCell(modelId, colIdx, rowIdx, SELECTION_TYPES.AREA);
        }
    };

    handleSelect = (event: React.MouseEvent<HTMLDivElement>): void => {
        const { colIdx, modelId, rowIdx, selected } = this.props;

        if (event.ctrlKey || event.metaKey) {
            selectCell(modelId, colIdx, rowIdx, SELECTION_TYPES.SINGLE);
        } else if (event.shiftKey) {
            cancelEvent(event);
            selectCell(modelId, colIdx, rowIdx, SELECTION_TYPES.AREA);
        } else if (!selected) {
            selectCell(modelId, colIdx, rowIdx);
        }
    };

    replaceValue = (value: any): void => {
        const { colIdx, modelId, rowIdx, onCellModify } = this.props;
        modifyCell(
            modelId,
            colIdx,
            rowIdx,
            {
                display: value,
                raw: value,
            },
            MODIFICATION_TYPES.REPLACE
        );
        onCellModify?.();
    };

    render() {
        const {
            col,
            colIdx,
            focused,
            message,
            modelId,
            placeholder,
            rowIdx,
            selected,
            selection,
            values,
            onCellModify,
            filteredLookupValues,
            filteredLookupKeys,
        } = this.props;

        if (!focused) {
            let valueDisplay = values
                .filter(vd => vd && vd.display !== undefined)
                .reduce((v, vd, i) => v + (i > 0 ? ', ' : '') + vd.display, '');

            const displayProps = {
                autoFocus: selected,
                className: classNames('cellular-display', {
                    'cell-selected': selected,
                    'size-limited': col.isLookup(),
                    'cell-selection': selection,
                    'cell-warning': message !== undefined,
                    'cell-read-only': this.isReadOnly(),
                    'cell-placeholder': valueDisplay.length === 0 && placeholder !== undefined,
                }),
                onDoubleClick: this.handleDblClick,
                onKeyDown: this.handleKeys,
                onMouseDown: this.handleSelect,
                onMouseEnter: this.handleMouseEnter,
                onBlur: this.handleSelectionBlur,
                ref: this.displayEl,
                tabIndex: -1,
            };

            if (valueDisplay.length === 0 && placeholder) {
                valueDisplay = placeholder;
            }

            const cell = <div {...displayProps}>{valueDisplay}</div>;

            if (message) {
                return (
                    <OverlayTrigger
                        overlay={
                            <Popover bsClass="popover" id="grid-cell-popover">
                                {message.message}
                            </Popover>
                        }
                        placement="top"
                    >
                        {cell}
                    </OverlayTrigger>
                );
            }

            return cell;
        }

        if (col.isPublicLookup()) {
            return (
                <LookupCell
                    col={col}
                    colIdx={colIdx}
                    disabled={this.isReadOnly()}
                    filteredLookupKeys={filteredLookupKeys}
                    filteredLookupValues={filteredLookupValues}
                    modelId={modelId}
                    onCellModify={onCellModify}
                    rowIdx={rowIdx}
                    select={selectCell}
                    values={values}
                />
            );
        }

        // Some cells have custom displays such as multi value comma separated values like alias so
        // first check renderer for editable value
        let renderer;
        let defaultValue;
        if (col.columnRenderer) {
            renderer = getQueryColumnRenderers().get(col.columnRenderer.toLowerCase());
        }

        if (renderer?.getEditableValue) {
            defaultValue = renderer.getEditableValue(values);
        }

        if (defaultValue === undefined) {
            defaultValue = values.size === 0 ? '' : values.first().display !== undefined ? values.first().display : '';
        }

        return (
            <input
                autoFocus
                className="cellular-input"
                defaultValue={defaultValue}
                disabled={this.isReadOnly()}
                onBlur={this.handleBlur}
                onChange={this.handleChange}
                onKeyDown={this.handleKeys}
                placeholder={placeholder}
                tabIndex={-1}
                type="text"
            />
        );
    }
}
