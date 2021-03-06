import React from 'react';
import { List, Map } from 'immutable';

import { Alert, Grid, GridColumn, InferDomainResponse } from '../../..';

export interface FileGridPreviewProps {
    previewCount: number;
    header?: string;
    infoMsg?: any;
    onPreviewLoad?: (response: InferDomainResponse, fileData?: File) => any;
    acceptedFormats?: string; // comma-separated list of allowed extensions i.e. '.png, .jpg, .jpeg'
    initialData?: InferDomainResponse;
    skipPreviewGrid?: boolean;
    errorStyle?: string;
}

type Props = FileGridPreviewProps & {
    data: List<Map<string, any>>;
    columns?: List<GridColumn>;
    errorMsg?: string;
};

export class FilePreviewGrid extends React.Component<Props, any> {
    static defaultProps = {
        header: 'File preview:',
        msg: '',
        errorStyle: 'warning'
    };

    render() {
        const { data, columns, header, infoMsg, errorMsg, errorStyle } = this.props;
        const numRows = data ? data.size : 0;

        return (
            <>
                {errorMsg ? (
                    <Alert bsStyle={errorStyle}>{errorMsg}</Alert>
                ) : (
                    <>
                        <strong>{header}</strong>
                        <p className="margin-top">
                            <span>
                                The {numRows === 1 ? 'one row ' : 'first ' + numRows + ' rows '} of your data file{' '}
                                {numRows === 1 ? 'is' : 'are'} shown below.
                            </span>
                            &nbsp;
                            {infoMsg}
                        </p>
                        <Grid columns={columns} data={data} />
                    </>
                )}
            </>
        );
    }
}
