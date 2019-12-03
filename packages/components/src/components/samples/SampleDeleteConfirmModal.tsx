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
import { DeleteConfirmationData, getSampleDeleteConfirmationData } from './actions';
import { SampleDeleteConfirmModalDisplay } from './SampleDeleteConfirmModalDisplay';
import { ConfirmModal } from '../base/ConfirmModal';
import { LoadingSpinner } from '../base/LoadingSpinner';

interface Props {
    onConfirm: (rowsToDelete: Array<any>, rowsToKeep: Array<any>) => any
    onCancel: () => any
    rowIds?: Array<string>
    selectionKey?: string
}

interface State {
    error: string
    isLoading: boolean
    confirmationData: DeleteConfirmationData
}

/**
 * The higher-order component that wraps SampleDeleteConfirmModal or displays a loading modal or eror modal.
 */
export class SampleDeleteConfirmModal extends React.Component<Props, State> {

    // This is used because a user may cancel during the loading phase, in which case we don't want to update state
    private _mounted : boolean;

    constructor(props: Props) {
        super(props);

        if (props.rowIds === undefined && props.selectionKey === undefined) {
            throw new Error("Either rowIds or selectionKey must be provided in order to confirm deletion.");
        }

        this.state = {
            error: undefined,
            isLoading: true,
            confirmationData: undefined
        }
    }

    componentWillMount() {
        this._mounted = true;
        this.init(this.props)
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    init(props: Props) {
        getSampleDeleteConfirmationData(props.selectionKey, props.rowIds )
            .then((confirmationData) => {
                if (this._mounted) {
                    this.setState(() => ({isLoading: false, confirmationData}));
                }
            })
            .catch((reason) => {
                console.error("There was a problem retrieving the delete confirmation data.", reason);
                if (this._mounted) {
                    this.setState(() => ({
                        isLoading: false,
                        error: "There was a problem retrieving the delete confirmation data."
                    }));
                }
            });
    }

    render() {
        const { onConfirm, onCancel } = this.props;


        if (this.state.isLoading) {
            return (
                <ConfirmModal
                      title={"Loading confirmation data"}
                      msg={<LoadingSpinner/>}
                      onCancel={onCancel}
                      cancelButtonText="Cancel"
                />
            )
        }

        if (this.state.error) {
            return (
                <ConfirmModal
                    title={"Deletion Error"}
                    onCancel={onCancel}
                    msg={this.state.error}
                    onConfirm={undefined}
                    cancelButtonText={"Dismiss"}
                />
            )
        }

        return (
            <SampleDeleteConfirmModalDisplay
                confirmationData={this.state.confirmationData}
                onConfirm={onConfirm}
                onCancel={onCancel}
            />
        )
    }
}