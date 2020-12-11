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
import React, { Component, FC, MouseEvent, ReactNode, useCallback } from 'react';
import { Button, MenuItem, SplitButton } from 'react-bootstrap';
import classNames from 'classnames';

import { MAX_EDITABLE_GRID_ROWS } from '../../constants';

export type PlacementType = 'top' | 'bottom' | 'both';

export interface AddRowsControlProps {
    disable?: boolean;
    initialCount?: number;
    maxCount?: number;
    maxTotalCount?: number;
    minCount?: number;
    nounPlural?: string;
    nounSingular?: string;
    addText?: string;
    onAdd: Function;
    quickAddText?: string;
    onQuickAdd?: (count: number) => void;
    placement?: PlacementType;
    wrapperClass?: string;
}

interface AddRowsControlState {
    count: number;
}

export class AddRowsControl extends Component<AddRowsControlProps, AddRowsControlState> {
    static defaultProps = {
        addText: 'Add',
        disable: false,
        initialCount: 1,
        maxCount: MAX_EDITABLE_GRID_ROWS,
        minCount: 1,
        nounPlural: 'rows',
        nounSingular: 'row',
        placement: 'bottom',
    };

    private addCount: React.RefObject<any>;

    constructor(props: AddRowsControlProps) {
        super(props);

        this.state = {
            count: this.props.initialCount,
        };

        this.addCount = React.createRef();
    }

    getAddCount = (): number => {
        if (this.addCount.current) {
            return parseInt(this.addCount.current.value);
        }
    };

    isValid = (count: number): boolean => {
        return (
            (!this.props.minCount || count > this.props.minCount - 1) &&
            (!this.props.maxCount || count <= this.getMaxRowsToAdd())
        );
    };

    onAdd = (): void => {
        if (this.isValid(this.state.count)) {
            const numToAdd = this.state.count;
            this.setState(
                () => ({ count: this.props.minCount }),
                () => this.props.onAdd(numToAdd)
            );
        }
    };

    onBlur = (): void => {
        if (!this.isValid(this.state.count)) {
            this.setState({
                count: this.props.initialCount,
            });
        }
    };

    onChange = (event): void => {
        let count = parseInt(event.target.value);

        if (isNaN(count)) {
            count = undefined;
        }

        this.setState({ count });
    };

    hasError = (): boolean => {
        const { count } = this.state;

        return count !== undefined && !this.isValid(count);
    };

    onQuickAdd = (): void => {
        this.props.onQuickAdd?.(this.state.count);
    };

    renderButton = (): ReactNode => {
        const { disable, quickAddText, onQuickAdd, addText, nounSingular, nounPlural } = this.props;
        const { count } = this.state;

        const title = addText + ' ' + (count === 1 ? nounSingular : nounPlural);
        return (
            <span className="input-group-btn">
                {quickAddText && onQuickAdd ? (
                    <SplitButton id="addRowsDropdown" onClick={this.onAdd} title={title} bsStyle="primary">
                        <MenuItem onClick={this.onQuickAdd}>{quickAddText}</MenuItem>
                    </SplitButton>
                ) : (
                    <Button
                        bsStyle="primary"
                        title={disable ? 'Maximum number of ' + nounPlural + ' reached.' : undefined}
                        disabled={disable || this.hasError()}
                        onClick={this.onAdd}
                    >
                        {title}
                    </Button>
                )}
            </span>
        );
    };

    shouldRenderHelpText = (): boolean => {
        return this.props.maxCount !== undefined || this.props.maxTotalCount !== undefined;
    };

    getMaxRowsToAdd = (): number => {
        const { maxCount, maxTotalCount } = this.props;
        return maxCount && maxTotalCount && maxCount > maxTotalCount ? maxTotalCount : maxCount;
    };

    render() {
        const { disable, minCount, nounPlural, nounSingular, placement, wrapperClass } = this.props;
        const { count } = this.state;

        const hasError = !disable && this.hasError();
        const wrapperClasses = classNames('editable-grid__controls', 'text-nowrap', wrapperClass, {
            'margin-top': placement === 'bottom',
            'has-error': hasError,
        });
        const maxToAdd = this.getMaxRowsToAdd();

        return (
            <div className={wrapperClasses}>
                <span className="input-group input-group-align">
                    <input
                        className="form-control"
                        max={disable ? undefined : maxToAdd}
                        min={disable ? undefined : minCount}
                        disabled={disable}
                        name="addCount"
                        onBlur={this.onBlur}
                        onChange={this.onChange}
                        ref={this.addCount}
                        style={{ width: '65px' }}
                        type="number"
                        value={count ? count.toString() : undefined}
                    />
                    {this.renderButton()}
                </span>
                {hasError && (
                    <span className="text-danger pull-left add-control--error-message">
                        {minCount === maxToAdd
                            ? `${minCount} ${nounSingular.toLowerCase()} allowed`
                            : `${minCount}-${maxToAdd} ${nounPlural.toLowerCase()} allowed`}
                    </span>
                )}
            </div>
        );
    }
}

interface RightClickToggleProps {
    onClick?: (event: MouseEvent<HTMLDivElement>) => void;
}

export const RightClickToggle: FC<RightClickToggleProps> = ({ children, onClick }) => {
    const handleClick = useCallback(
        (e: MouseEvent<HTMLDivElement>) => {
            if (e.button === 2 || e.buttons === 2) {
                e.preventDefault();
                onClick?.(e);
            }
        },
        [onClick]
    );

    return (
        <div className="cellular-count-content" onClick={handleClick} onContextMenu={handleClick}>
            {children}
        </div>
    );
};
