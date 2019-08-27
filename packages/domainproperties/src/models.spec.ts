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
import {
    PropDescType,
    TEXT_TYPE,
    LOOKUP_TYPE,
    MULTILINE_TYPE,
    BOOLEAN_TYPE,
    INTEGER_TYPE,
    DOUBLE_TYPE,
    DATETIME_TYPE,
    FLAG_TYPE,
    FILE_TYPE,
    ATTACHMENT_TYPE,
    USERS_TYPE,
    PARTICIPANT_TYPE,
    DomainDesign, DomainField, AssayProtocolModel
} from "./models";

describe('PropDescType', () => {
    test("isInteger", () => {
        expect(PropDescType.isInteger(TEXT_TYPE.rangeURI)).toBeFalsy();
        expect(PropDescType.isInteger(LOOKUP_TYPE.rangeURI)).toBeFalsy();
        expect(PropDescType.isInteger(MULTILINE_TYPE.rangeURI)).toBeFalsy();
        expect(PropDescType.isInteger(BOOLEAN_TYPE.rangeURI)).toBeFalsy();
        expect(PropDescType.isInteger(INTEGER_TYPE.rangeURI)).toBeTruthy();
        expect(PropDescType.isInteger(DOUBLE_TYPE.rangeURI)).toBeFalsy();
        expect(PropDescType.isInteger(DATETIME_TYPE.rangeURI)).toBeFalsy();
        expect(PropDescType.isInteger(FLAG_TYPE.rangeURI)).toBeFalsy();
        expect(PropDescType.isInteger(FILE_TYPE.rangeURI)).toBeFalsy();
        expect(PropDescType.isInteger(ATTACHMENT_TYPE.rangeURI)).toBeFalsy();
        expect(PropDescType.isInteger(USERS_TYPE.rangeURI)).toBeTruthy();
        expect(PropDescType.isInteger(PARTICIPANT_TYPE.rangeURI)).toBeFalsy();
    });

    test("isString", () => {
        expect(PropDescType.isString(TEXT_TYPE.rangeURI)).toBeTruthy();
        expect(PropDescType.isString(LOOKUP_TYPE.rangeURI)).toBeFalsy();
        expect(PropDescType.isString(MULTILINE_TYPE.rangeURI)).toBeTruthy();
        expect(PropDescType.isString(BOOLEAN_TYPE.rangeURI)).toBeFalsy();
        expect(PropDescType.isString(INTEGER_TYPE.rangeURI)).toBeFalsy();
        expect(PropDescType.isString(DOUBLE_TYPE.rangeURI)).toBeFalsy();
        expect(PropDescType.isString(DATETIME_TYPE.rangeURI)).toBeFalsy();
        expect(PropDescType.isString(FLAG_TYPE.rangeURI)).toBeTruthy();
        expect(PropDescType.isString(FILE_TYPE.rangeURI)).toBeFalsy();
        expect(PropDescType.isString(ATTACHMENT_TYPE.rangeURI)).toBeFalsy();
        expect(PropDescType.isString(USERS_TYPE.rangeURI)).toBeFalsy();
        expect(PropDescType.isString(PARTICIPANT_TYPE.rangeURI)).toBeTruthy();
    });

    test("isMeasureDimension", () => {
        expect(PropDescType.isMeasureDimension(TEXT_TYPE.rangeURI)).toBeTruthy();
        expect(PropDescType.isMeasureDimension(LOOKUP_TYPE.rangeURI)).toBeTruthy();
        expect(PropDescType.isMeasureDimension(MULTILINE_TYPE.rangeURI)).toBeTruthy();
        expect(PropDescType.isMeasureDimension(BOOLEAN_TYPE.rangeURI)).toBeTruthy();
        expect(PropDescType.isMeasureDimension(INTEGER_TYPE.rangeURI)).toBeTruthy();
        expect(PropDescType.isMeasureDimension(DOUBLE_TYPE.rangeURI)).toBeTruthy();
        expect(PropDescType.isMeasureDimension(DATETIME_TYPE.rangeURI)).toBeTruthy();
        expect(PropDescType.isMeasureDimension(FLAG_TYPE.rangeURI)).toBeTruthy();
        expect(PropDescType.isMeasureDimension(FILE_TYPE.rangeURI)).toBeFalsy();
        expect(PropDescType.isMeasureDimension(ATTACHMENT_TYPE.rangeURI)).toBeFalsy();
        expect(PropDescType.isMeasureDimension(USERS_TYPE.rangeURI)).toBeTruthy();
        expect(PropDescType.isMeasureDimension(PARTICIPANT_TYPE.rangeURI)).toBeTruthy();
    });

    test("isMvEnableable", () => {
        expect(PropDescType.isMvEnableable(TEXT_TYPE.rangeURI)).toBeTruthy();
        expect(PropDescType.isMvEnableable(LOOKUP_TYPE.rangeURI)).toBeTruthy();
        expect(PropDescType.isMvEnableable(MULTILINE_TYPE.rangeURI)).toBeFalsy();
        expect(PropDescType.isMvEnableable(BOOLEAN_TYPE.rangeURI)).toBeTruthy();
        expect(PropDescType.isMvEnableable(INTEGER_TYPE.rangeURI)).toBeTruthy();
        expect(PropDescType.isMvEnableable(DOUBLE_TYPE.rangeURI)).toBeTruthy();
        expect(PropDescType.isMvEnableable(DATETIME_TYPE.rangeURI)).toBeTruthy();
        expect(PropDescType.isMvEnableable(FLAG_TYPE.rangeURI)).toBeTruthy();
        expect(PropDescType.isMvEnableable(FILE_TYPE.rangeURI)).toBeFalsy();
        expect(PropDescType.isMvEnableable(ATTACHMENT_TYPE.rangeURI)).toBeFalsy();
        expect(PropDescType.isMvEnableable(USERS_TYPE.rangeURI)).toBeTruthy();
        expect(PropDescType.isMvEnableable(PARTICIPANT_TYPE.rangeURI)).toBeTruthy();
    });
});

describe('DomainDesign', () => {
    test("init", () => {
        const d = DomainDesign.init('Foo');
        expect(d.name).toBe('Foo Fields');
        expect(d.domainURI.indexOf(':AssayDomain-Foo.')).toBe(25);
        expect(d.fields.size).toBe(0);
        expect(d.indices.size).toBe(0);
        expect(d.domainId).toBe(null);
    });

    test("isNameSuffixMatch", () => {
        const d = DomainDesign.init('Foo');
        expect(d.isNameSuffixMatch('Foo')).toBeTruthy();
        expect(d.isNameSuffixMatch('foo')).toBeFalsy();
        expect(d.isNameSuffixMatch('Bar')).toBeFalsy();
        expect(d.isNameSuffixMatch('bar')).toBeFalsy();
    });
});

describe('DomainField', () => {
    test("isNew", () => {
        const f1 = DomainField.create({name: 'foo', rangeURI: TEXT_TYPE.rangeURI});
        expect(f1.isNew()).toBeTruthy();
        const f2 = DomainField.create({name: 'foo', rangeURI: TEXT_TYPE.rangeURI, propertyId: 0});
        expect(f2.isNew()).toBeFalsy();
    });

    test("updateDefaultValues", () => {
        const textField = DomainField.create({name: 'foo', rangeURI: TEXT_TYPE.rangeURI});
        expect(textField.measure).toBeFalsy();
        expect(textField.dimension).toBeFalsy();
        const updatedTextField = DomainField.updateDefaultValues(textField);
        expect(updatedTextField.measure).toBeFalsy();
        expect(updatedTextField.dimension).toBeFalsy();

        const intField = DomainField.create({name: 'foo', rangeURI: INTEGER_TYPE.rangeURI});
        expect(intField.measure).toBeFalsy();
        expect(intField.dimension).toBeFalsy();
        const updatedIntField = DomainField.updateDefaultValues(intField);
        expect(updatedIntField.measure).toBeTruthy();
        expect(updatedIntField.dimension).toBeFalsy();

        const dblField = DomainField.create({name: 'foo', rangeURI: INTEGER_TYPE.rangeURI});
        expect(dblField.measure).toBeFalsy();
        expect(dblField.dimension).toBeFalsy();
        const updatedDblField = DomainField.updateDefaultValues(dblField);
        expect(updatedDblField.measure).toBeTruthy();
        expect(updatedDblField.dimension).toBeFalsy();
    });
});

describe('AssayProtocolModel', () => {
    test("getDomainByNameSuffix", () => {
        const model = AssayProtocolModel.create({
            protocolId: 1,
            name: 'Test Assay Protocol',
            description: 'My assay protocol for you all to use.',
            domains: [{
                name: 'Sample Fields',
                fields: [{
                    name: 'field1',
                    rangeURI: 'xsd:string'
                },{
                    name: 'field2',
                    rangeURI: 'xsd:int'
                },{
                    name: 'field3',
                    rangeURI: 'xsd:dateTime'
                }]
            }]
        });

        expect(model.getDomainByNameSuffix('Foo') === undefined).toBeTruthy();
        expect(model.getDomainByNameSuffix('sample') === undefined).toBeTruthy();
        expect(model.getDomainByNameSuffix('Sample') === undefined).toBeFalsy();
    });
});