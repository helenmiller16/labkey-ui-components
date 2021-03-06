import React, { FC, memo, useMemo, useCallback, useState } from 'react';
import { Col, Row } from 'react-bootstrap';

import { Utils } from '@labkey/api';

import {Alert, GENERAL_ASSAY_PROVIDER_NAME} from '../../../index';

import { AssayProvider } from './AssayPicker';

interface SpecialtyAssayPanelProps {
    selected: AssayProvider;
    values: AssayProvider[];
    onChange: (value: string) => void;
    warning?: string;
}

export const SpecialtyAssayPanel: FC<SpecialtyAssayPanelProps> = memo(props => {
    const { values, selected, onChange, warning, children } = props;

    const options = useMemo(() => {
        return values?.filter(v => v.name !== GENERAL_ASSAY_PROVIDER_NAME)
            .map(val => {
                return <option key={val.name} value={val.name}>{val.name}</option>;
            });
    }, [values]);

    const onSelectChange = useCallback(
        e => {
            onChange(e.target.value);
        },
        [onChange]
    );

    return (
        <div>
            <Row>
                <Col xs={6}>
                    <div className="margin-bottom">
                        <b>Use Instrument Specific Data Format</b>
                    </div>
                    <div className="margin-bottom">
                        {selected && options && (
                            <select
                                id="specialty-assay-type-select"
                                value={selected.name}
                                onChange={onSelectChange}
                                className="form-control"
                            >
                                {options}
                            </select>
                        )}
                    </div>

                    <div className={"small-margin-bottom"} dangerouslySetInnerHTML={{ __html: selected?.description }} />

                    {warning && (
                        <Alert bsStyle="warning">
                            <i className="fa fa-flag" style={{ marginRight: '20px' }} />
                            {warning}
                        </Alert>
                    )}
                </Col>
            </Row>
            <Row>
                <Col xs={6}>
                    <div className={warning ? 'margin-bottom' : 'margin-top margin-bottom'}>
                        <b>Supported File Types</b>
                    </div>
                    <p>{selected?.fileTypes.join(', ')}</p>
                </Col>
            </Row>
            {children}
        </div>
    );
});
