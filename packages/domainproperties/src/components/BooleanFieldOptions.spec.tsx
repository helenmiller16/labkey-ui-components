import {mount} from "enzyme";
import * as React from "react";
import {BooleanFieldOptions} from "./BooleanFieldOptions";
import {createFormInputId} from "../actions/actions";
import {DOMAIN_FIELD_FORMAT} from "../constants";
import toJson from "enzyme-to-json";


describe('BooleanFieldOptions', () => {

    test('Boolean data type', () => {
        const _section = 'Boolean Field Options';
        const _format = 'Yes;No;Maybe';
        const _format2 = 'Yes;No;Blank';

        const props = {
            index: 1,
            label: _section,
            format: _format,
            onChange: jest.fn()
        };

        const boolean  = mount(<BooleanFieldOptions
            {...props}
        />);

        // Verify label
        const sectionLabel = boolean.find({className: 'domain-field-section-heading'});
        expect(sectionLabel.length).toEqual(1);
        expect(sectionLabel.text()).toEqual(_section);

        // Test format field initial value
        let formatField = boolean.find({id: createFormInputId(DOMAIN_FIELD_FORMAT, 1), className: 'form-control'});
        expect(formatField.length).toEqual(1);
        expect(formatField.props().value).toEqual(_format);

        // Verify value changes with props
        boolean.setProps({format: _format2});
        formatField = boolean.find({id: createFormInputId(DOMAIN_FIELD_FORMAT, 1), className: 'form-control'});
        expect(formatField.props().value).toEqual(_format2);

        expect(toJson(boolean)).toMatchSnapshot();
        boolean.unmount();
    });
});