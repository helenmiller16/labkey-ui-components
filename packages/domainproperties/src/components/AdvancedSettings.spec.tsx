import {mount} from "enzyme";
import * as React from "react";
import {createFormInputId} from "../actions/actions";
import {
    DOMAIN_FIELD_DIMENSION,
    DOMAIN_FIELD_HIDDEN,
    DOMAIN_FIELD_MEASURE,
    DOMAIN_FIELD_MVENABLED,
    DOMAIN_FIELD_PHI,
    DOMAIN_FIELD_RECOMMENDEDVARIABLE,
    DOMAIN_FIELD_SHOWNINDETAILSVIEW,
    DOMAIN_FIELD_SHOWNININSERTVIEW,
    DOMAIN_FIELD_SHOWNINUPDATESVIEW,
    INT_RANGE_URI, PHILEVEL_FULL_PHI,
    PHILEVEL_LIMITED_PHI
} from "../constants";
import {AdvancedSettings} from "./AdvancedSettings";
import {DomainField} from "../models";


describe('AdvancedSettings', () => {

    test('Advanced Settings Modal', () => {
        const _fieldName = 'Marty';
        const _title = 'Advanced Settings and Properties';
        const _index = 0;

        const field1 = DomainField.create({
            name: 'key',
            rangeURI: INT_RANGE_URI,
            propertyId: 1,
            propertyURI: 'test',
            hidden: false,
            shownInDetailsView: true,
            shownInInsertView: false,
            shownInUpdateView: true,
            dimension: false,
            measure: true,
            mvEnabled: false,
            recommendedVariable: true,
            PHI: PHILEVEL_LIMITED_PHI
        });

        const props = {
            label: _fieldName,
            index: _index,
            show: true,
            maxPhiLevel: PHILEVEL_FULL_PHI,
            field: field1,
            onHide: jest.fn(),
            onApply: jest.fn()
        };

        const advSettings  = mount(<AdvancedSettings
            {...props}
        />);

        // Verify label
        const sectionLabel = advSettings.find({className: 'modal-title'});
        expect(sectionLabel.length).toEqual(1);
        expect(sectionLabel.text()).toEqual(_title + " for " + _fieldName);

        // Verify hidden
        let hidden = advSettings.find({id: createFormInputId(DOMAIN_FIELD_HIDDEN, _index), bsClass: 'checkbox'});
        expect(hidden.length).toEqual(1);
        expect(hidden.props().checked).toEqual(true);

        // Verify show in update
        let showUpdate = advSettings.find({id: createFormInputId(DOMAIN_FIELD_SHOWNINUPDATESVIEW, _index), bsClass: 'checkbox'});
        expect(showUpdate.length).toEqual(1);
        expect(showUpdate.props().checked).toEqual(true);

        // Verify show in insert
        let showInsert = advSettings.find({id: createFormInputId(DOMAIN_FIELD_SHOWNININSERTVIEW, _index), bsClass: 'checkbox'});
        expect(showInsert.length).toEqual(1);
        expect(showInsert.props().checked).toEqual(false);

        // Verify show in details
        let showDetails = advSettings.find({id: createFormInputId(DOMAIN_FIELD_SHOWNINDETAILSVIEW, _index), bsClass: 'checkbox'});
        expect(showDetails.length).toEqual(1);
        expect(showDetails.props().checked).toEqual(true);

        // Verify measure
        let measure = advSettings.find({id: createFormInputId(DOMAIN_FIELD_MEASURE, _index), bsClass: 'checkbox'});
        expect(measure.length).toEqual(1);
        expect(measure.props().checked).toEqual(true);

        // Verify dimension
        let dimension = advSettings.find({id: createFormInputId(DOMAIN_FIELD_DIMENSION, _index), bsClass: 'checkbox'});
        expect(dimension.length).toEqual(1);
        expect(dimension.props().checked).toEqual(false);

        // Verify mvEnabled
        let mvEnabled = advSettings.find({id: createFormInputId(DOMAIN_FIELD_MVENABLED, _index), bsClass: 'checkbox'});
        expect(mvEnabled.length).toEqual(1);
        expect(mvEnabled.props().checked).toEqual(false);

        // Verify recommendedVariable
        let recommendedVariable = advSettings.find({id: createFormInputId(DOMAIN_FIELD_RECOMMENDEDVARIABLE, _index), bsClass: 'checkbox'});
        expect(recommendedVariable.length).toEqual(1);
        expect(recommendedVariable.props().checked).toEqual(true);

        // Verify phi
        let phi = advSettings.find({id: createFormInputId(DOMAIN_FIELD_PHI, _index), bsClass: 'form-control'});
        expect(phi.length).toEqual(1);
        expect(phi.props().children.size).toEqual(3);
        expect(phi.props().value).toEqual(PHILEVEL_LIMITED_PHI);

        const testStateUpdates = function() {
            // Verify hidden
            let hidden = advSettings.find({id: createFormInputId(DOMAIN_FIELD_HIDDEN, _index), bsClass: 'checkbox'});
            expect(hidden.props().checked).toEqual(false);

            // Verify show in update
            let showUpdate = advSettings.find({
                id: createFormInputId(DOMAIN_FIELD_SHOWNINUPDATESVIEW, _index),
                bsClass: 'checkbox'
            });
            expect(showUpdate.props().checked).toEqual(false);

            // Verify show in insert
            let showInsert = advSettings.find({
                id: createFormInputId(DOMAIN_FIELD_SHOWNININSERTVIEW, _index),
                bsClass: 'checkbox'
            });
            expect(showInsert.props().checked).toEqual(true);

            // Verify show in details
            let showDetails = advSettings.find({
                id: createFormInputId(DOMAIN_FIELD_SHOWNINDETAILSVIEW, _index),
                bsClass: 'checkbox'
            });
            expect(showDetails.props().checked).toEqual(false);

            // Verify measure
            let measure = advSettings.find({id: createFormInputId(DOMAIN_FIELD_MEASURE, _index), bsClass: 'checkbox'});
            expect(measure.props().checked).toEqual(false);

            // Verify dimension
            let dimension = advSettings.find({id: createFormInputId(DOMAIN_FIELD_DIMENSION, _index), bsClass: 'checkbox'});
            expect(dimension.props().checked).toEqual(true);

            // Verify mvEnabled
            let mvEnabled = advSettings.find({id: createFormInputId(DOMAIN_FIELD_MVENABLED, _index), bsClass: 'checkbox'});
            expect(mvEnabled.props().checked).toEqual(true);

            // Verify recommendedVariable
            let recommendedVariable = advSettings.find({
                id: createFormInputId(DOMAIN_FIELD_RECOMMENDEDVARIABLE, _index),
                bsClass: 'checkbox'
            });
            expect(recommendedVariable.props().checked).toEqual(false);

            let phi = advSettings.find({id: createFormInputId(DOMAIN_FIELD_PHI, _index), bsClass: 'form-control'});
            expect(phi.props().value).toEqual(PHILEVEL_FULL_PHI);

            // TODO: Some reason toJson is hitting infinite loop on Advanced Settings
            // expect(toJson(advSettings)).toMatchSnapshot();
            advSettings.unmount();
        };

        advSettings.setState({
            hidden: true,
            shownInDetailsView: false,
            shownInInsertView: true,
            shownInUpdateView: false,
            dimension: true,
            measure: false,
            mvEnabled: true,
            recommendedVariable: false,
            PHI: PHILEVEL_FULL_PHI
        }, testStateUpdates);
    });
});