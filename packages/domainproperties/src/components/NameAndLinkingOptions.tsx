

import * as React from 'react'
import {Col, FormControl, Row} from "react-bootstrap";
import {createFormInputId} from "../actions/actions";
import {
    DOMAIN_FIELD_DESCRIPTION,
    DOMAIN_FIELD_IMPORTALIASES,
    DOMAIN_FIELD_LABEL,
    DOMAIN_FIELD_URL,
    LK_URL_ENCODING_DOC
} from "../constants";
import {LabelHelpTip} from "@glass/base";
import {DomainField} from "../models";

interface NameAndLinkingProps {
    index: number,
    field: DomainField,
    onChange: (string, any) => any
}

export class NameAndLinkingOptions extends React.PureComponent<NameAndLinkingProps, any> {

    handleChange = (evt: any) => {
        const { onChange } = this.props;

        if (onChange)
        {
            onChange(evt.target.id, evt.target.value);
        }
    };

    getImportAliasHelpText = () => {
        return (
            <>
                Define alternate field names to be used when importing from a file.
                <br/><br/>
                Multiple aliases may be separated by spaces or commas. To define an alias that contains spaces, use double-quotes (") around it.
            </>
        )
    }

    getURLHelpText = () => {
        return (
            <>
                Use this to change the display of the field value within a data grid into a link. Multiple formats are supported, which allows ways to easily substitute and link to other locations in LabKey.
                <br/><br/>
                Learn more about using <a target="_blank" href={LK_URL_ENCODING_DOC}>Url Formatting Options</a>
            </>
        )
    }

    render() {
        const { index, field } = this.props;

        return (
            <div>
                <Row className='domain-row-expanded'>
                    <Col xs={12}>
                        <div className={'domain-field-section-heading'}>Name and Linking Options</div>
                    </Col>
                </Row>
                <Row className='domain-row-expanded'>
                    <Col xs={5}>
                        <div className={'domain-field-label'}>Description</div>
                        <textarea className="form-control domain-field-description" rows={4} value={field.description ? field.description : ''}
                                  id={createFormInputId(DOMAIN_FIELD_DESCRIPTION, index)}
                                  key={createFormInputId(DOMAIN_FIELD_DESCRIPTION, index)}
                                  placeholder={'Add a description'}
                                  onChange={this.handleChange}/>
                    </Col>
                    <Col xs={3}>
                        <div className={'domain-field-label'}>Label</div>
                        <FormControl type="text" value={field.label ? field.label : ''}
                                     id={createFormInputId(DOMAIN_FIELD_LABEL, index)}
                                     key={createFormInputId(DOMAIN_FIELD_LABEL, index)}
                                     onChange={this.handleChange}/>

                        <div className={'domain-field-label'}>
                            Import Aliases
                            <LabelHelpTip
                                title='Import Aliases'
                                body={this.getImportAliasHelpText}/>
                        </div>
                        <FormControl type="text" value={field.importAliases ? field.importAliases : ''}
                                     id={createFormInputId(DOMAIN_FIELD_IMPORTALIASES, index)}
                                     key={createFormInputId(DOMAIN_FIELD_IMPORTALIASES, index)}
                                     onChange={this.handleChange}/>
                    </Col>
                </Row>
                <Row className='domain-row-expanded'>
                    <Col xs={5}>
                        <div className={'domain-field-label'}>
                            URL
                            <LabelHelpTip
                                title='URL'
                                body={this.getURLHelpText} />
                        </div>
                        <FormControl type="text" value={field.URL ? field.URL : ''}
                                     id={createFormInputId(DOMAIN_FIELD_URL, index)}
                                     key={createFormInputId(DOMAIN_FIELD_URL, index)}
                                     onChange={this.handleChange}/>
                    </Col>
                </Row>
            </div>
        )
    }
}