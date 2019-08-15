import * as React from 'react';
import renderer from 'react-test-renderer'

import { AssayDefinitionModel } from '@glass/base';
import { fromJS } from 'immutable';
import { AssayReimportHeader } from './AssayReimportHeader';
import assayDefJSON from '../../test/data/assayDefinitionModel.json';


describe("<AssayReimportHeader/>", () => {
    const assay = AssayDefinitionModel.create(assayDefJSON);

    const runData = fromJS({
        'RowId':  10,
        'Name':  'Test Name'
    });
    test("has batch properties", () => {
        const component = <AssayReimportHeader hasBatchProperties={true} assay={assay} replacedRunProperties={runData}/>
        const tree = renderer.create(component).toJSON();
        expect(tree).toMatchSnapshot();
    });

    test("no batch properties", () => {
        const component = <AssayReimportHeader hasBatchProperties={false} assay={assay} replacedRunProperties={runData}/>
        const tree = renderer.create(component).toJSON();
        expect(tree).toMatchSnapshot();
    })
});