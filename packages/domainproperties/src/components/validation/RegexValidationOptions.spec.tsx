import {INTEGER_TYPE, PropertyValidator} from "../../models";
import {mount} from "enzyme";
import * as React from "react";
import toJson from "enzyme-to-json";
import {createFormInputId} from "../../actions/actions";
import {
    DOMAIN_VALIDATOR_DESCRIPTION,
    DOMAIN_VALIDATOR_ERRORMESSAGE,
    DOMAIN_VALIDATOR_EXPRESSION,
    DOMAIN_VALIDATOR_FAILONMATCH,
    DOMAIN_VALIDATOR_NAME,
} from "../../constants";
import propertyValidator from "../../test/data/propertyValidator-regex.json";
import {RegexValidationOptions} from "./RegexValidationOptions";


describe('RegexValidationOptions', () => {

    test('Regex Validator - expanded', () => {
        const validatorIndex = 0;
        const validatorModel = PropertyValidator.fromJS([propertyValidator], 'RegEx').get(0);

        const props = {
            validator: validatorModel,
            index: 1,
            validatorIndex: validatorIndex,
            mvEnabled: true,
            expanded: true,
            dataType: INTEGER_TYPE,
            onExpand: jest.fn(),
            onDelete: jest.fn(),
            onChange: jest.fn()
        };

        const validator  = mount(<RegexValidationOptions
            {...props}
        />);

        const expression = validator.find({id: createFormInputId(DOMAIN_VALIDATOR_EXPRESSION, validatorIndex)});
        expect(expression.at(0).props().value).toEqual("$[abc]");

        const name = validator.find({id: createFormInputId(DOMAIN_VALIDATOR_NAME, validatorIndex)});
        expect(name.at(0).props().value).toEqual("Test Validator");

        const description = validator.find({id: createFormInputId(DOMAIN_VALIDATOR_DESCRIPTION, validatorIndex)});
        expect(description.at(0).props().value).toEqual("This is my validator description");

        const errorMsg = validator.find({id: createFormInputId(DOMAIN_VALIDATOR_ERRORMESSAGE, validatorIndex)});
        expect(errorMsg.at(0).props().value).toEqual("Test Validation Failure");

        const failOnMatch = validator.find({id: createFormInputId(DOMAIN_VALIDATOR_FAILONMATCH, validatorIndex)});
        expect(failOnMatch.at(0).props().checked).toEqual(true);

        expect(RegexValidationOptions.isValid(validatorModel)).toEqual(true);

        expect(toJson(validator)).toMatchSnapshot();
        validator.unmount();
    });

    test('Regex Validator - collapsed', () => {
        const validatorIndex = 0;
        const validatorModel = PropertyValidator.fromJS([propertyValidator], 'RegEx').get(0);

        const props = {
            validator: validatorModel,
            index: 1,
            validatorIndex: validatorIndex,
            mvEnabled: true,
            expanded: false,
            dataType: INTEGER_TYPE,
            onExpand: jest.fn(),
            onDelete: jest.fn(),
            onChange: jest.fn()
        };

        const validator  = mount(<RegexValidationOptions
            {...props}
        />);

        const collapsed = validator.find({id: "domain-regex-validator-" + validatorIndex});
        expect(collapsed.children().children().text()).toEqual("Test Validator: $[abc]");

        expect(toJson(validator)).toMatchSnapshot();
        validator.unmount();
    });
});