/*
 * Copyright (c) 2016-2018 LabKey Corporation. All rights reserved. No portion of this work may be reproduced in
 * any form or by any electronic or mechanical means without written permission from LabKey Corporation.
 */
import * as React from 'react'
import { Panel, Button } from 'react-bootstrap'
import { List, Map } from 'immutable'
import Formsy from 'formsy-react'
import { Alert, QueryGridModel } from '@glass/base'

import { updateRows } from "../../../query/api";
import { resolveDetailEditRenderer, resolveDetailRenderer, titleRenderer } from "./DetailEditRenderer";
import { Detail } from "./Detail";
import { DetailPanelHeader } from "./DetailPanelHeader";

interface DetailEditingProps {
    queryModel: QueryGridModel
    canUpdate: boolean
    onUpdate?: () => void
    useEditIcon: boolean
}

interface DetailEditingState {
    canSubmit?: boolean
    editing?: boolean
    warning?: string
    error?: string
}

export class DetailEditing extends React.Component<DetailEditingProps, DetailEditingState> {
    static defaultProps = {
        useEditIcon: true
    };

    constructor(props: DetailEditingProps) {
        super(props);

        this.state = {
            canSubmit: false,
            editing: false,
            warning: undefined,
            error: undefined
        };
    }

    arrayListIsEqual(valueArr: Array<string|number>, nestedModelList: List<Map<string, any>>): boolean {
        let matched = 0;
        // Loop through the submitted array and the existing list and compare values
        // If values match, add tally. If submitted values length is same as
        // Should have checked against empty array and list before function
        nestedModelList.forEach(nestedField => {
            return valueArr.forEach(nestedVal => {
                if (nestedField.get('value') === nestedVal || nestedField.get('displayValue') === nestedVal) {
                    matched++;
                }
            });
        });

        return matched === valueArr.length;
    }

    disableSubmitButton = ()  => {
        this.setState(() => ({canSubmit: false}));
    };

    enableSubmitButton = () => {
        this.setState(() => ({canSubmit: true}));
    };

    getEditedValues(values): {[propName: string]: any} {
        const { queryModel } = this.props;
        const queryData = queryModel.getRow();
        const queryInfo = queryModel.queryInfo;
        let updatedValues = {};

        // Loop through submitted values and check against existing values from server
        Object.keys(values).forEach((field) => {

            // If nested value, will need to do deeper check
            if (List.isList(queryData.get(field))) {

                // If the submitted value and existing value are empty, do not update field
                if (!values[field] && queryData.get(field).size === 0) {
                    return false;
                }
                // If the submitted value is empty and there is an existing value, should update field
                else if (!values[field] && queryData.get(field).size > 0) {
                    updatedValues[field] = values[field];
                }
                else {
                    // If submitted value array and existing value array are different size, should update field
                    if (values[field].length !== queryData.get(field).size) {
                        updatedValues[field] = values[field];
                    }
                    // If submitted value array and existing array are the same size, need to compare full contents
                    else if (values[field].length === queryData.get(field).size) {

                        if (!this.arrayListIsEqual(values[field], queryData.get(field))) {
                            updatedValues[field] = values[field];
                        }
                    }
                }
            }
            else if (values[field] != queryData.getIn([field, 'value'])) {

                const column = queryInfo.getColumn(field);

                // A date field needs to be checked specially
                if (column && column.jsonType === 'date') {

                    // Ensure dates have same formatting
                    // If submitted value is same as existing date, do not update
                    if (new Date(values[field]).setUTCHours(0,0,0,0) === new Date(queryData.getIn([field, 'value'])).setUTCHours(0,0,0,0)) {
                        return false;
                    }
                }

                updatedValues[field] = values[field];
            }
        });

        return updatedValues;
    }

    handleClick = () => {
        this.setState((state) => ({
            editing: !state.editing,
            warning: undefined,
            error: undefined
        }));
    };

    handleFormChange = () => {
        const { warning } = this.state;
        if (warning) {
            this.setState(() => ({warning: undefined}));
        }
    };

    handleSubmit = (values) => {
        const { queryModel, onUpdate } = this.props;
        const queryData = queryModel.getRow();
        const queryInfo = queryModel.queryInfo;
        const schemaQuery = queryInfo.schemaQuery;

        let updatedValues = this.getEditedValues(values);

        // If form contains new values, proceed to update
        if (Object.keys(updatedValues).length > 0) {

            // iterate the set of pkCols for this QueryInfo -- include value from queryData
            queryInfo.getPkCols().forEach((pkCol) => {
                const pkVal = queryData.getIn([pkCol.fieldKey, 'value']);

                if (pkVal !== undefined && pkVal !== null) {
                    updatedValues[pkCol.fieldKey] = pkVal;
                }
                else {
                    console.warn('Unable to find value for pkCol \"' + pkCol.fieldKey + '\"');
                }
            });

            return updateRows({
                schemaQuery,
                rows: [updatedValues]
            }).then(() => {
                this.setState(() => ({editing: false}));

                if (onUpdate) {
                    onUpdate();
                }

            }).catch((error) => {
                this.setState(() => ({
                    warning: undefined,
                    error: 'Error: ' + error.exception
                }));
            });
        }
        else {
            this.setState(() => ({
                canSubmit: false,
                warning: 'No changes detected. Please update the form and click save.',
                error: undefined
            }));
        }
    };

    renderEditControls() {
        const { canSubmit } = this.state;
        return (
            <div className="detail__edit-controls">
                <div className="btn-group">
                    <Button
                        onClick={this.handleClick}>
                        Cancel
                    </Button>
                    <Button
                        bsStyle={"primary"}
                        type="submit"
                        disabled={!canSubmit}>
                        Save
                    </Button>
                </div>
            </div>
        )
    }

    render() {
        const { queryModel, canUpdate, useEditIcon } = this.props;
        const { editing, warning, error } = this.state;

        let isEditable = false;
        if (queryModel && queryModel.queryInfo) {
            const hasData = queryModel.getData().size > 0;
            isEditable = hasData && queryModel.queryInfo.isAppEditable();
        }

        const header = <DetailPanelHeader
            useEditIcon={useEditIcon}
            isEditable={isEditable}
            canUpdate={canUpdate}
            editing={editing}
            onClickFn={this.handleClick}
            warning={warning}/>;

        if (editing && isEditable) {
            return (
                <Formsy
                    onChange={this.handleFormChange}
                    onValidSubmit={this.handleSubmit}
                    onValid={this.enableSubmitButton}
                    onInvalid={this.disableSubmitButton}>
                    <Panel bsStyle="info">
                        <Panel.Heading>{header}</Panel.Heading>
                        <Panel.Body>
                            <div className="detail__editing">
                                {this.renderEditControls()}
                                {error && <Alert>{error}</Alert>}
                                <Detail
                                    queryModel={queryModel}
                                    detailRenderer={resolveDetailEditRenderer}
                                    titleRenderer={titleRenderer}/>
                                {this.renderEditControls()}
                            </div>
                        </Panel.Body>
                    </Panel>
                </Formsy>
            )
        }

        return (
            <Panel>
                <Panel.Heading>{header}</Panel.Heading>
                <Panel.Body>
                    <Detail queryModel={queryModel}
                            detailRenderer={resolveDetailRenderer}/>
                </Panel.Body>
            </Panel>
        )
    }
}