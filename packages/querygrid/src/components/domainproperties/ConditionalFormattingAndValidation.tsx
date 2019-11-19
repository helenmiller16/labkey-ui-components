
import * as React from 'react'
import {Button, Col, Row} from "react-bootstrap";
import {List} from "immutable";
import {isFieldFullyLocked} from "./propertiesUtil";
import {createFormInputId, createFormInputName} from "./actions";
import {
    DOMAIN_COND_FORMAT,
    DOMAIN_RANGE_VALIDATOR,
    DOMAIN_REGEX_VALIDATOR
} from "./constants";
import {LabelHelpTip} from "@glass/base";
import {ConditionalFormat, DomainField, PropertyValidator} from "./models";
import {ValidatorModal} from "./validation/ValidatorModal";
import {RegexValidationOptions} from "./validation/RegexValidationOptions";
import {RangeValidationOptions} from "./validation/RangeValidationOptions";
import {ConditionalFormatOptions} from "./validation/ConditionalFormatOptions";

interface ConditionalFormattingAndValidationProps {
    index: number,
    field: DomainField,
    onChange: (string, any) => any
    showingModal: (boolean) => any
}

interface ConditionalFormattingAndValidationState {
    showCondFormat: boolean,
    showRegex: boolean,
    showRange: boolean
}

export class ConditionalFormattingAndValidation extends React.PureComponent<ConditionalFormattingAndValidationProps, ConditionalFormattingAndValidationState> {

    constructor(props) {
        super(props);

        this.state = {
            showCondFormat: false,
            showRegex: false,
            showRange: false
        };
    }

    handleChange = (evt: any) => {
        const { onChange } = this.props;

        if (onChange)
        {
            onChange(evt.target.id, evt.target.value);
        }
    };

    onApply = (validator: List<PropertyValidator | ConditionalFormat>, type: string) => {
        const { onChange, index } = this.props;

        onChange(createFormInputId(type, index), validator);
    };

    getRangeValidatorHelpText = () => {
        return (
            <>
                <p>Range validators allow you to specify numeric comparisons that must be satisfied.</p>

                <p>Learn more about using <a target='_blank' href='https://www.labkey.org/Documentation/wiki-page.view?name=fieldEditor#range'>Range Validation</a>.</p>
            </>
        )
    };

    getRegexValidatorHelpText = () => {
        return (
            <>
                <p>RegEx validators allow you to specify a regular expression that defines what string values are valid.</p>

                <p>Learn more about using <a target='_blank' href='https://www.labkey.org/Documentation/wiki-page.view?name=fieldEditor#regex'>Regular Expression Validation</a>.</p>
            </>
        )
    };

    getConditionalFormatHelpText = () => {
        return (
            <>
                <p>Conditional formats allow targeted display formatting for values that meet defined conditions.</p>

                <p>Learn more about using <a target='_blank' href='https://www.labkey.org/Documentation/wiki-page.view?name=fieldEditor#conditional'>Conditional Formats</a>.</p>
            </>
        )
    };

    showHideConditionalFormat = () => {
        const { showingModal } = this.props;

        this.setState((state) => ({showCondFormat: !state.showCondFormat}), showingModal(this.state.showCondFormat));

    };

    showHideRegexValidator = () => {
        const { showingModal } = this.props;

        this.setState((state) => ({showRegex: !state.showRegex}), showingModal(this.state.showRegex));
    };

    showHideRangeValidator = () => {
        const { showingModal } = this.props;

        this.setState((state) => ({showRange: !state.showRange}), showingModal(this.state.showRange));
    };

    renderValidator = (range: boolean) => {
        const { field, index } = this.props;

        const validators = range ? field.rangeValidators : field.regexValidators;
        const count = validators ? validators.size : 0;

        return (
            <div className={range ? '' : 'domain-validation-group'}>
                <div className={'domain-field-label domain-no-wrap'}>{'Create ' + (range ? 'Range': 'Regular') + ' Expression Validator'}
                    <LabelHelpTip title={'Add ' + (range ? 'Range' : 'Regex') + ' Validator'} body={range ? this.getRangeValidatorHelpText : this.getRegexValidatorHelpText}/>
                </div>
                <div>
                    <Button
                        className="domain-validation-button"
                        name={createFormInputName((range ? DOMAIN_RANGE_VALIDATOR : DOMAIN_REGEX_VALIDATOR))}
                        id={createFormInputId((range ? DOMAIN_RANGE_VALIDATOR : DOMAIN_REGEX_VALIDATOR), index)}
                        disabled={isFieldFullyLocked(field.lockType)}
                        onClick={range ? this.showHideRangeValidator : this.showHideRegexValidator}>
                        {count > 0 ? (range ? 'Edit Ranges' : 'Edit Regex') : (range ? 'Add Range' : 'Add Regex')}
                    </Button>
                    {count === 0 ? <span className='domain-text-label'>None Set</span> :
                        <a className='domain-validator-link'
                           onClick={ isFieldFullyLocked(field.lockType) ? () => {} : (range ? this.showHideRangeValidator : this.showHideRegexValidator)}>
                            {'' + count + ' Active validator' + (count > 1 ? 's' : '')}
                        </a>}
                </div>
            </div>)
    };

    renderConditionalFormats = () => {
        const { field, index } = this.props;

        let count = field.conditionalFormats ? field.conditionalFormats.size : 0;

        return (
            <div className='domain-validation-group'>
                <div className={'domain-field-label domain-no-wrap'}>Create Conditional Format Criteria
                    <LabelHelpTip title={'Add Conditional Format'} body={this.getConditionalFormatHelpText}/>
                </div>
                <div>
                    <Button
                        className="domain-validation-button"
                        name={createFormInputName(DOMAIN_COND_FORMAT)}
                        id={createFormInputId(DOMAIN_COND_FORMAT, index)}
                        disabled={isFieldFullyLocked(field.lockType)}
                        onClick={this.showHideConditionalFormat}>
                        {count > 0 ? 'Edit Formats' : 'Add Format'}
                    </Button>
                    {count === 0 ? <span className='domain-text-label'>None Set</span> :
                        <a className='domain-validator-link' onClick={ isFieldFullyLocked(field.lockType) ? () => {} : (this.showHideConditionalFormat)}>{'' + count + ' Active format' + (count > 1 ? 's' : '')}</a>}
                </div>
            </div>)
    };

    render() {
        const { index, field } = this.props;
        const { showCondFormat, showRegex, showRange } = this.state;

        const CondFormatModal = ValidatorModal(ConditionalFormatOptions);
        const RangeValidator = ValidatorModal(RangeValidationOptions);
        const RegexValidator = ValidatorModal(RegexValidationOptions);

        return (
            <div>
                <Row className='domain-row-expanded'>
                    <Col xs={12}>
                        <div className={'domain-field-section-heading domain-field-section-hdr'}>Conditional Formatting and Validation Options</div>
                    </Col>
                </Row>
                <Row className='domain-row-expanded'>
                    <Col xs={12}>
                        {this.renderConditionalFormats()}
                        {this.renderValidator(false)}
                        {DomainField.hasRangeValidation(field) && this.renderValidator(true)}
                        {showCondFormat &&
                            <CondFormatModal
                                title={'Conditional Formatting ' + (field.name ? ('for ' + field.name) : '')}
                                subTitle='Add New Formatting:'
                                addName='formatting'
                                index={index}
                                show={showCondFormat}
                                type={DOMAIN_COND_FORMAT}
                                mvEnabled={field.mvEnabled}
                                validators={field.conditionalFormats}
                                dataType={field.dataType}
                                onHide={this.showHideConditionalFormat}
                                onApply={this.onApply}
                            />
                        }
                        {showRegex &&
                            <RegexValidator
                                title={'Regular Expression Validator ' + (field.name ? ('for ' + field.name) : '')}
                                subTitle='Add New Validation Criteria:'
                                addName='Regex Validator'
                                index={index}
                                show={showRegex}
                                type={DOMAIN_REGEX_VALIDATOR}
                                mvEnabled={field.mvEnabled}
                                validators={field.regexValidators}
                                dataType={field.dataType}
                                onHide={this.showHideRegexValidator}
                                onApply={this.onApply}
                            />
                        }
                        {showRange &&
                            <RangeValidator
                                title={'Range Validator ' + (field.name ? ('for ' + field.name) : '')}
                                subTitle='Add New Validation Criteria:'
                                addName='Range Validator'
                                index={index}
                                show={showRange}
                                type={DOMAIN_RANGE_VALIDATOR}
                                mvEnabled={field.mvEnabled}
                                validators={field.rangeValidators}
                                dataType={field.dataType}
                                onHide={this.showHideRangeValidator}
                                onApply={this.onApply}
                            />
                        }
                    </Col>
                </Row>
            </div>
        )
    }
}