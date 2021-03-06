/*
 * Copyright (c) 2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React from 'react';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import { fromJS } from 'immutable';

import { getQueryGridModel, getStateQueryGridModel, gridInit, SchemaQuery } from '../../../..';
import sampleDetailsQuery from '../../../../test/data/sampleDetails-getQuery.json';
import { initUnitTestMocks } from '../../../testHelpers';

import { Detail } from './Detail';

let MODEL_ID;

beforeAll(() => {
    initUnitTestMocks();
    const schemaQuery = SchemaQuery.create('samples', 'samples');
    const model = getStateQueryGridModel('jest-querygridmodel', schemaQuery, {
        allowSelection: false,
        loader: {
            fetch: () => {
                const data = fromJS(sampleDetailsQuery.rows[0]);

                return Promise.resolve({
                    data,
                    dataIds: data.keySeq().toList(),
                });
            },
        },
    });
    gridInit(model);
    MODEL_ID = model.getId();
});

describe('<Detail/>', () => {
    test('loading', () => {
        const tree = renderer.create(<Detail />);

        expect(tree.toJSON()).toMatchSnapshot();
    });

    test('with QueryGridModel', () => {
        const model = getQueryGridModel(MODEL_ID);
        const component = <Detail queryModel={model} />;
        const tree = renderer.create(component);
        expect(tree).toMatchSnapshot();

        const wrapper = mount(component);
        // expect one table row for each display column
        expect(wrapper.find('tr')).toHaveLength(model.getDetailsDisplayColumns().size);
        // expect one field value to render as links (Lookupfield)
        expect(wrapper.find('a')).toHaveLength(1);
        // expect the row labels to be the column captions by default
        expect(wrapper.find('table').text().indexOf('Lookup Field Caption')).toBeGreaterThan(-1);
        wrapper.unmount();
    });

    test('asPanel', () => {
        const model = getQueryGridModel(MODEL_ID);
        const tree = renderer.create(<Detail asPanel={true} queryModel={model} />);

        expect(tree.toJSON()).toMatchSnapshot();
    });

    test('titleRenderer', () => {
        const model = getQueryGridModel(MODEL_ID);
        const component = <Detail queryModel={model} titleRenderer={val => val.fieldKey} />;
        const wrapper = mount(component);

        // expect custom titleRenderer to use the column's fieldKey instead of caption
        expect(wrapper.find('table').text().indexOf('lookupfield')).toBeGreaterThan(-1);
        wrapper.unmount();
    });

    test('detailRenderer', () => {
        const model = getQueryGridModel(MODEL_ID);
        const component = <Detail queryModel={model} detailRenderer={() => () => <h1>TESTING</h1>} />;

        const wrapper = mount(component);
        expect(wrapper.find('a')).toHaveLength(0);
        expect(wrapper.find('h1')).toHaveLength(model.getDetailsDisplayColumns().size);
        wrapper.unmount();
    });
});
