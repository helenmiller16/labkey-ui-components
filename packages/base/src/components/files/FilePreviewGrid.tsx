import * as React from 'react';
import {Map, List} from 'immutable';

import { Alert } from "../Alert";
import { Grid, GridColumn } from "../Grid";

export interface FileGridPreviewProps {
    previewCount: number
    header?: string
    infoMsg?: any
}

type Props = FileGridPreviewProps & {
    data: List<Map<string, any>>
    columns?: List<GridColumn>
    errorMsg?: string
}

export class FilePreviewGrid extends React.Component<Props, any> {

    static defaultProps = {
        header: 'File preview:',
        msg:''
    };

    render() {
        const { data, columns, header, infoMsg, errorMsg } = this.props;
        const numRows = data ? data.size : 0;

        return (
            <>
                {errorMsg ? <Alert>{errorMsg}</Alert>
                    : <>
                        <strong>{header}</strong>
                        <p className={'margin-top'}>
                            <span>
                                The {numRows === 1 ? 'one row ' : 'first ' + numRows + ' rows '} of your data
                                file {numRows === 1 ? 'is' : 'are'} shown below.
                            </span>
                            &nbsp;
                            {infoMsg}
                        </p>
                        <Grid columns={columns} data={data}/>
                    </>
                }
            </>
        )
    }
}