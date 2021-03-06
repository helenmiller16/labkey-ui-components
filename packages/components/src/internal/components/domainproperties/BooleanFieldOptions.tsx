import React from 'react';
import { Col, FormControl, Row } from 'react-bootstrap';

import { createFormInputId, createFormInputName } from './actions';
import { isFieldFullyLocked } from './propertiesUtil';
import { DOMAIN_FIELD_FORMAT, DOMAIN_FIELD_SCALE } from './constants';
import { ITypeDependentProps } from './models';
import { SectionHeading } from './SectionHeading';
import { DomainFieldLabel } from './DomainFieldLabel';

interface BooleanFieldProps extends ITypeDependentProps {
    format: string;
}

export class BooleanFieldOptions extends React.PureComponent<BooleanFieldProps, any> {
    onFieldChange = evt => {
        const { onChange } = this.props;

        const value = evt.target.value;

        if (onChange) {
            onChange(evt.target.id, value);
        }
    };

    getFormatHelpText = () => {
        return (
            <div>
                Use boolean formatting to specify the text to show when a value is true and false. Text can optionally
                be shown for null values.
                <br />
                <br />
                For example, "Yes;No;Blank" would output "Yes" if the value is true, "No" if false, and "Blank" for a
                null value.
            </div>
        );
    };

    render() {
        const { index, label, format, lockType, domainIndex } = this.props;

        return (
            <div>
                <Row>
                    <Col xs={12}>
                        <SectionHeading title={label} />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <div className="domain-field-label">
                            <DomainFieldLabel
                                label="Format for Boolean Values"
                                helpTipBody={this.getFormatHelpText()}
                            />
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col xs={3}>
                        <FormControl
                            type="text"
                            value={format || ''}
                            onChange={this.onFieldChange}
                            id={createFormInputId(DOMAIN_FIELD_FORMAT, domainIndex, index)}
                            disabled={isFieldFullyLocked(lockType)}
                            name={createFormInputName(DOMAIN_FIELD_SCALE)}
                        />
                    </Col>
                </Row>
            </div>
        );
    }
}
