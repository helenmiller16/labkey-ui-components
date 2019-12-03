import React from 'react';
import { List } from 'immutable';
import { mount } from 'enzyme';
import { AssayPropertiesPanel } from './AssayPropertiesPanel';
import { AssayProtocolModel, DomainDesign } from '../models';
import { LK_DOMAIN_HELP_URL } from '../constants';
import {
    AutoCopyDataInput,
    BackgroundUploadInput,
    DescriptionInput,
    DetectionMethodsInput,
    EditableResultsInput,
    EditableRunsInput,
    MetadataInputFormatsInput,
    ModuleProvidedScriptsInput,
    NameInput,
    PlateTemplatesInput,
    QCStatesInput,
    SaveScriptDataInput,
    TransformScriptsInput,
} from './AssayPropertiesInput';
import toJson from 'enzyme-to-json';

const EMPTY_MODEL = AssayProtocolModel.create({
    providerName: 'General',
    domains: List([
        DomainDesign.create({name: 'Batch Fields'}),
        DomainDesign.create({name: 'Run Fields'}),
        DomainDesign.create({name: 'Data Fields'})
    ])
});

describe('AssayPropertiesPanel', () => {

    test('default properties', () => {
        const form = mount(
            <AssayPropertiesPanel
                model={EMPTY_MODEL}
                onChange={jest.fn}
            />
        );

        expect(toJson(form)).toMatchSnapshot();
        form.unmount();
    });

    test('asPanel, helpURL, and basePropertiesOnly', () => {
        const form = mount(
            <AssayPropertiesPanel
                model={EMPTY_MODEL}
                asPanel={false}
                basePropertiesOnly={true}
                helpURL={LK_DOMAIN_HELP_URL}
                onChange={jest.fn}
            />
        );

        expect(toJson(form)).toMatchSnapshot();
        form.unmount();
    });

    test('without helpURL', () => {
        const form = mount(
            <AssayPropertiesPanel
                model={EMPTY_MODEL}
                helpURL={null}
                basePropertiesOnly={true}
                onChange={jest.fn}
            />
        );

        expect(toJson(form)).toMatchSnapshot();
        form.unmount();
    });

    test('panelCls, initCollapsed, and markComplete', () => {
        const form = mount(
            <AssayPropertiesPanel
                model={EMPTY_MODEL}
                collapsible={false}
                initCollapsed={true}
                onChange={jest.fn}
            />
        );

        expect(toJson(form)).toMatchSnapshot();
        form.unmount();
    });

    test('with initial model', () => {
        const form = mount(
            <AssayPropertiesPanel
                model={AssayProtocolModel.create({
                    protocolId: 1,
                    name: 'name should not be editable',
                    description: 'test description for this assay',
                    editableRuns: true,
                    editableResults: true
                })}
                onChange={jest.fn}
            />
        );

        expect(toJson(form)).toMatchSnapshot();
        form.unmount();
    });

    test('collapsible', (done) => {
        const name = 'With Name';
        const component = (
            <AssayPropertiesPanel
                model={AssayProtocolModel.create({protocolId: 1, name: name})}
                collapsible={true}
                onChange={jest.fn}
            />
        );

        const wrapper = mount(component);
        expect(wrapper.find('.panel-body')).toHaveLength(1);
        expect(wrapper.find('.panel-heading').text()).toBe(name + ' - Assay Properties');
        expect(wrapper.find('.domain-panel-header-expanded').hostNodes()).toHaveLength(1);
        expect(wrapper.find('.domain-panel-header-collapsed').hostNodes()).toHaveLength(0);
        wrapper.find('.pull-right').last().simulate('click'); // expand/collapse toggle click
        expect(wrapper.find('.panel-body')).toHaveLength(1);
        expect(wrapper.find('.panel-heading').text()).toBe(name + ' - Assay Properties');
        expect(wrapper.find('.domain-panel-header-expanded').hostNodes()).toHaveLength(0);
        expect(wrapper.find('.domain-panel-header-collapsed').hostNodes()).toHaveLength(1);
        wrapper.find('.pull-right').last().simulate('click'); // expand/collapse toggle click
        expect(wrapper.find('.panel-body')).toHaveLength(1);
        expect(wrapper.find('.panel-heading').text()).toBe(name + ' - Assay Properties');
        expect(wrapper.find('.domain-panel-header-expanded').hostNodes()).toHaveLength(1);
        expect(wrapper.find('.domain-panel-header-collapsed').hostNodes()).toHaveLength(0);
        wrapper.unmount();
        done();
    });

    test('visible properties based on empty AssayProtocolModel', () => {
        const simpleModelWrapper = mount(<AssayPropertiesPanel model={EMPTY_MODEL} onChange={jest.fn}/>);
        expect(simpleModelWrapper.find(NameInput)).toHaveLength(1);
        expect(simpleModelWrapper.find(DescriptionInput)).toHaveLength(1);
        expect(simpleModelWrapper.find(QCStatesInput)).toHaveLength(0);
        expect(simpleModelWrapper.find(PlateTemplatesInput)).toHaveLength(0);
        expect(simpleModelWrapper.find(DetectionMethodsInput)).toHaveLength(0);
        expect(simpleModelWrapper.find(MetadataInputFormatsInput)).toHaveLength(0);
        expect(simpleModelWrapper.find(EditableRunsInput)).toHaveLength(1);
        expect(simpleModelWrapper.find(EditableResultsInput)).toHaveLength(0);
        expect(simpleModelWrapper.find(BackgroundUploadInput)).toHaveLength(0);
        expect(simpleModelWrapper.find(TransformScriptsInput)).toHaveLength(0);
        expect(simpleModelWrapper.find(SaveScriptDataInput)).toHaveLength(0);
        expect(simpleModelWrapper.find(ModuleProvidedScriptsInput)).toHaveLength(0);
        expect(simpleModelWrapper.find(AutoCopyDataInput)).toHaveLength(1);
        simpleModelWrapper.unmount();
    });

    test('visible properties based on populated AssayProtocolModel', () => {
        const model = AssayProtocolModel.create({
            allowBackgroundUpload: true,
            allowEditableResults: true,
            allowQCStates: true,
            allowTransformationScript: true,
            availableDetectionMethods: ['a', 'b', 'c'],
            availableMetadataInputFormats: {test1: 'abc'},
            availablePlateTemplates: ['d','e','f'],
            moduleTransformScripts: ['validation.pl']
        });

        const simpleModelWrapper = mount(<AssayPropertiesPanel model={model} onChange={jest.fn}/>);
        expect(simpleModelWrapper.find(NameInput)).toHaveLength(1);
        expect(simpleModelWrapper.find(DescriptionInput)).toHaveLength(1);
        expect(simpleModelWrapper.find(QCStatesInput)).toHaveLength(1);
        expect(simpleModelWrapper.find(PlateTemplatesInput)).toHaveLength(1);
        expect(simpleModelWrapper.find(DetectionMethodsInput)).toHaveLength(1);
        expect(simpleModelWrapper.find(MetadataInputFormatsInput)).toHaveLength(1);
        expect(simpleModelWrapper.find(EditableRunsInput)).toHaveLength(1);
        expect(simpleModelWrapper.find(EditableResultsInput)).toHaveLength(1);
        expect(simpleModelWrapper.find(BackgroundUploadInput)).toHaveLength(1);
        expect(simpleModelWrapper.find(TransformScriptsInput)).toHaveLength(1);
        expect(simpleModelWrapper.find(SaveScriptDataInput)).toHaveLength(1);
        expect(simpleModelWrapper.find(ModuleProvidedScriptsInput)).toHaveLength(1);
        expect(simpleModelWrapper.find(AutoCopyDataInput)).toHaveLength(1);
        simpleModelWrapper.unmount();
    });

    test('visible properties for basePropertiesOnly based on populated AssayProtocolModel', () => {
        const model = AssayProtocolModel.create({
            allowBackgroundUpload: true,
            allowEditableResults: true,
            allowQCStates: true,
            availableDetectionMethods: ['a', 'b', 'c'],
            availableMetadataInputFormats: {test1: 'abc'},
            availablePlateTemplates: ['d','e','f'],
            moduleTransformScripts: ['validation.pl']
        });

        const simpleModelWrapper = mount(<AssayPropertiesPanel model={model} onChange={jest.fn} basePropertiesOnly={true}/>);
        expect(simpleModelWrapper.find(NameInput)).toHaveLength(1);
        expect(simpleModelWrapper.find(DescriptionInput)).toHaveLength(1);
        expect(simpleModelWrapper.find(QCStatesInput)).toHaveLength(0);
        expect(simpleModelWrapper.find(PlateTemplatesInput)).toHaveLength(1);
        expect(simpleModelWrapper.find(DetectionMethodsInput)).toHaveLength(1);
        expect(simpleModelWrapper.find(MetadataInputFormatsInput)).toHaveLength(1);
        expect(simpleModelWrapper.find(EditableRunsInput)).toHaveLength(1);
        expect(simpleModelWrapper.find(EditableResultsInput)).toHaveLength(1);
        expect(simpleModelWrapper.find(BackgroundUploadInput)).toHaveLength(0);
        expect(simpleModelWrapper.find(TransformScriptsInput)).toHaveLength(0);
        expect(simpleModelWrapper.find(SaveScriptDataInput)).toHaveLength(0);
        expect(simpleModelWrapper.find(ModuleProvidedScriptsInput)).toHaveLength(0);
        expect(simpleModelWrapper.find(AutoCopyDataInput)).toHaveLength(0);
        simpleModelWrapper.unmount();
    });
});