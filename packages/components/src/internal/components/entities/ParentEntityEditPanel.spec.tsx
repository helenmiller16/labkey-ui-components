import React from 'react';
import { mount } from 'enzyme';
import PanelBody from 'react-bootstrap/lib/PanelBody';
import { List } from 'immutable';
import { Button } from 'react-bootstrap';

import { Alert, DataClassDataType, LoadingSpinner, QueryGridModel, SchemaQuery } from '../../..';
import { DetailPanelHeader } from '../forms/detail/DetailPanelHeader';
import { initUnitTestMocks } from '../../testHelpers';

import { EntityChoice } from './models';
import { ParentEntityEditPanel } from './ParentEntityEditPanel';

beforeAll(() => {
    initUnitTestMocks();
});

describe('<ParentEntityEditPanel>', () => {
    const modelId = 'id';
    const schemaQuery = new SchemaQuery({
        schemaName: 'samples',
        queryName: 'example',
    });
    const model = new QueryGridModel({
        id: modelId,
        isLoaded: true,
        isLoading: false,
        isError: true,
        schema: schemaQuery.schemaName,
        query: schemaQuery.queryName,
    });

    test('error state', () => {
        const panel = mount(
            <ParentEntityEditPanel
                childModel={model}
                canUpdate={false}
                childName="Test"
                childNounSingular="Testing"
                title="Test 123"
                parentDataType={DataClassDataType}
            />
        );
        panel.setState({ error: 'My error message', loading: false });
        const header = panel.find(DetailPanelHeader);
        expect(header).toHaveLength(1);
        expect(header.text()).toContain('Test 123');
        expect(panel.find(Alert)).toHaveLength(1);
        expect(panel.find(PanelBody).text()).toContain('Data for Test');
        expect(panel).toMatchSnapshot();
        panel.unmount();
    });

    test('loading state', () => {
        const panel = mount(
            <ParentEntityEditPanel
                childModel={model}
                canUpdate={false}
                childName="Test"
                childNounSingular="Testing"
                title="Test 123"
                parentDataType={DataClassDataType}
            />
        );
        panel.setState({ loading: true });
        expect(panel.find(LoadingSpinner)).toHaveLength(1);
        expect(panel).toMatchSnapshot();
        panel.unmount();
    });

    test('editing, no data', () => {
        const panel = mount(
            <ParentEntityEditPanel
                childModel={model}
                canUpdate={false}
                childName="Test"
                childNounSingular="Testing"
                title="Test 123"
                parentDataType={DataClassDataType}
            />
        );
        panel.setState({
            loading: false,
            editing: true,
            originalParents: List<EntityChoice>(),
            currentParents: List<EntityChoice>(),
        });
        const header = panel.find(DetailPanelHeader);
        expect(header.text()).toContain('Editing Test 123');
        expect(panel.find(Button)).toHaveLength(2);
        expect(panel).toMatchSnapshot();
        panel.unmount();
    });
});
