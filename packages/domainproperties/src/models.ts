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
import { List, Record, fromJS } from "immutable";
import {
    ATTACHMENT_RANGE_URI,
    BOOLEAN_RANGE_URI,
    DATETIME_RANGE_URI,
    DOUBLE_RANGE_URI, FILELINK_RANGE_URI, FLAG_CONCEPT_URI,
    INT_RANGE_URI,
    MULTILINE_RANGE_URI, PARTICIPANTID_CONCEPT_URI, STRING_RANGE_URI,
    USER_RANGE_URI
} from "./constants";

interface IPropDescType {
    conceptURI: string
    display: string
    name: string
    rangeURI: string
}

export class PropDescType extends Record({
    conceptURI: undefined,
    display: undefined,
    name: undefined,
    rangeURI: undefined
}) implements IPropDescType {
    conceptURI: string;
    display: string;
    name: string;
    rangeURI: string;

    static isLookup(name: string): boolean {
        return name === 'lookup';
    }

    constructor(values?: {[key:string]: any}) {
        super(values);
    }

    isLookup(): boolean {
        return PropDescType.isLookup(this.name);
    }
}

export const PROP_DESC_TYPES = List([
    new PropDescType({name: 'string', display: 'Text (String)', rangeURI: STRING_RANGE_URI}),
    new PropDescType({name: 'multiLine', display: 'Multi-Line Text', rangeURI: MULTILINE_RANGE_URI}),
    new PropDescType({name: 'boolean', display: 'Boolean', rangeURI: BOOLEAN_RANGE_URI}),
    new PropDescType({name: 'int', display: 'Integer', rangeURI: INT_RANGE_URI}),
    new PropDescType({name: 'double', display: 'Number (Double)', rangeURI: DOUBLE_RANGE_URI}),
    new PropDescType({name: 'dateTime', display: 'Date Time', rangeURI: DATETIME_RANGE_URI}),
    new PropDescType({name: 'flag', display: 'Flag (String)', rangeURI: STRING_RANGE_URI, conceptURI: FLAG_CONCEPT_URI}),
    new PropDescType({name: 'fileLink', display: 'File', rangeURI: FILELINK_RANGE_URI}),
    new PropDescType({name: 'attachment', display: 'Attachment', rangeURI: ATTACHMENT_RANGE_URI}),
    new PropDescType({name: 'users', display: 'User', rangeURI: USER_RANGE_URI}),
    new PropDescType({name: 'ParticipantId', display: 'Subject/Participant (String)', rangeURI: STRING_RANGE_URI, conceptURI: PARTICIPANTID_CONCEPT_URI}),
    new PropDescType({name: 'lookup', display: 'Lookup'}),
]);

interface IDomainDesign {
    name: string
    description?: string
    domainURI: string
    domainId: number
    fields?: List<DomainField>
    indices?: List<DomainIndex>
}

export class DomainDesign extends Record({
    name: undefined,
    description: undefined,
    domainURI: undefined,
    domainId: null,
    fields: List<DomainField>(),
    indices: List<DomainIndex>()
}) implements IDomainDesign {
    name: string;
    description: string;
    domainURI: string;
    domainId: number;
    fields: List<DomainField>;
    indices: List<DomainIndex>;

    static create(rawModel): DomainDesign {
        let fields = List<DomainField>();
        let indices = List<DomainIndex>();

        if (rawModel) {
            if (rawModel.fields) {
                fields = DomainField.fromJS(rawModel.fields);
            }

            if (rawModel.indices) {
                indices = DomainIndex.fromJS(rawModel.indices);
            }
        }

        return new DomainDesign({
            ...rawModel,
            fields,
            indices
        })
    }

    static serialize(dd: DomainDesign): any {
        let json = dd.toJS();
        json.fields = dd.fields.map(DomainField.serialize).toArray();
        return json;
    }

    constructor(values?: {[key:string]: any}) {
        super(values);
    }
}

interface IDomainIndex {
    columns: Array<string> | List<string>
    type: 'primary' | 'unique'
}

export class DomainIndex extends Record({
    columns: List<string>(),
    type: undefined
}) implements IDomainIndex {
    columns: List<string>;
    type: 'primary' | 'unique';

    static fromJS(rawIndices: Array<IDomainIndex>): List<DomainIndex> {
        let indices = List<DomainIndex>().asMutable();

        for (let i=0; i < rawIndices.length; i++) {
            indices.push(new DomainIndex(fromJS(rawIndices[i])));
        }

        return indices.asImmutable();
    }

    constructor(values?: {[key:string]: any}) {
        super(values);
    }
}

// Commented out properties are unused
interface IDomainField {
    conceptURI: string
    // conditionalFormats: Array<string>
    // container: string
    // defaultDisplayValue: string
    // defaultScale: string
    // defaultValue: any?
    // defaultValueType: string
    description: string
    // dimension: boolean
    // disableEditing: boolean
    // excludeFromShifting: boolean
    // facetingBehaviorType: string
    // format: string
    hidden: boolean
    importAliases: string
    label: string
    // lockType: string
    lookupContainer: string
    lookupQuery: string
    lookupSchema: string
    // measure: boolean
    // mvEnabled: boolean
    name: string
    // ontologyURI: string
    // PHI: string
    // preventReordering: boolean
    primaryKey: boolean
    propertyId: number
    propertyURI: string
    // propertyValidators: Array<any>
    rangeURI: string
    // recommendedVariables: boolean
    // redactedText: any?
    required: boolean
    scale: number
    // searchTerms: any?
    // semanticType: string?
    // shownInDetailsView: boolean
    // shownInInsertView: boolean
    // shownInUpdateView: boolean
    // typeEditable: boolean
    URL: string

    dataType: PropDescType
    original: Partial<IDomainField>;
    updatedField: boolean
}

export class DomainField extends Record({
    conceptURI: undefined,
    description: undefined,
    hidden: false,
    importAliases: undefined,
    label: undefined,
    lookupContainer: undefined,
    lookupQuery: undefined,
    lookupSchema: undefined,
    name: undefined,
    primaryKey: false,
    propertyId: undefined,
    propertyURI: undefined,
    rangeURI: STRING_RANGE_URI,
    required: false,
    scale: undefined,
    URL: undefined,

    dataType: undefined,
    original: undefined,
    updatedField: false
}) implements IDomainField {
    conceptURI: string;
    description: string;
    hidden: boolean;
    importAliases: string;
    label: string;
    lookupContainer: string;
    lookupQuery: string;
    lookupSchema: string;
    name: string;
    primaryKey: boolean;
    propertyId: number;
    propertyURI: string;
    rangeURI: string;
    required: boolean;
    scale: number;
    URL: string;

    dataType: PropDescType;
    original: Partial<IDomainField>;
    updatedField: boolean;

    static create(rawField: Partial<IDomainField>): DomainField {
        let dataType = resolveDataType(rawField);

        return new DomainField(Object.assign({}, rawField, {
            dataType,
            lookupContainer: rawField.lookupContainer === null ? undefined : rawField.lookupContainer,
            original: {
                dataType,
                rangeURI: rawField.rangeURI
            }
        }));
    }

    static fromJS(rawFields: Array<IDomainField>): List<DomainField> {
        let fields = List<DomainField>().asMutable();

        for (let i=0; i < rawFields.length; i++) {
            fields.push(DomainField.create(rawFields[i]));
        }

        return fields.asImmutable();
    }

    static serialize(df: DomainField): any {
        let json = df.toJS();

        if (!df.dataType.isLookup()) {
            json.lookupContainer = null;
            json.lookupQuery = null;
            json.lookupSchema = null;
        }
        else if (json.lookupContainer === undefined) {
            json.lookupContainer = null;
        }

        // remove non-serializable fields
        delete json.dataType;
        delete json.original;
        delete json.updatedField;

        return json;
    }

    constructor(values?: {[key:string]: any}) {
        super(values);
    }

    isNew(): boolean {
        return isFieldNew(this);
    }
}

function isFieldNew(field: Partial<IDomainField>): boolean {
    return field.propertyId === undefined;
}

export function resolveAvailableTypes(field: DomainField): List<PropDescType> {
    // field has not been saved -- display all propTypes
    if (field.isNew()) {
        return PROP_DESC_TYPES;
    }

    // field has been saved -- display eligible propTypes
    // compare against original types as the field's values are volatile
    const { rangeURI } = field.original;

    // field has been saved -- display eligible propTypes
    return PROP_DESC_TYPES.filter((type) => {
        if (type.isLookup()) {
            return rangeURI === INT_RANGE_URI || rangeURI === STRING_RANGE_URI;
        }

        return rangeURI === type.rangeURI;
    }).toList();
}

function resolveDataType(rawField: Partial<IDomainField>): PropDescType {
    let type: PropDescType;

    if (!isFieldNew(rawField)) {
        type = PROP_DESC_TYPES.find((type) => {

            // handle matching rangeURI and conceptURI
            if (type.rangeURI === rawField.rangeURI) {
                if (!rawField.lookupQuery &&
                    ((!type.conceptURI && !rawField.conceptURI) || (type.conceptURI === rawField.conceptURI)))
                {
                    return true;
                }
            }
            // handle selected lookup option
            else if (type.isLookup() && rawField.lookupQuery && rawField.lookupQuery !== 'users') {
                return true;
            }
            // handle selected users option
            else if (type.name === 'users' && rawField.lookupQuery && rawField.lookupQuery === 'users') {
                return true;
            }

            return false;
        });
    }

    return type ? type : PROP_DESC_TYPES.get(0);
}

interface IColumnInfoLite {
    friendlyType?: string
    isKeyField?: boolean
    jsonType?: string
    name?: string
}

export class ColumnInfoLite extends Record({
    friendlyType: undefined,
    isKeyField: false,
    jsonType: undefined,
    name: undefined
}) implements IColumnInfoLite {
    friendlyType?: string;
    isKeyField?: boolean;
    jsonType?: string;
    name?: string;

    static create(raw: IColumnInfoLite): ColumnInfoLite {
        return new ColumnInfoLite(raw);
    }

    constructor(values?: {[key:string]: any}) {
        super(values);
    }
}

interface IQueryInfoLite {
    canEdit?: boolean
    canEditSharedViews?: boolean
    columns?: List<ColumnInfoLite>
    description?: string
    hidden?: boolean
    inherit?: boolean
    isInherited?: boolean
    isMetadataOverrideable?: boolean
    isUserDefined?: boolean
    name?: string
    snapshot?: false
    title?: string
    viewDataUrl?: string
}

export class QueryInfoLite extends Record({
    canEdit: false,
    canEditSharedViews: false,
    columns: List(),
    description: undefined,
    hidden: false,
    inherit: false,
    isInherited: false,
    isMetadataOverrideable: false,
    isUserDefined: false,
    name: undefined,
    snapshot: false,
    title: undefined,
    viewDataUrl: undefined
}) implements IQueryInfoLite {
    canEdit?: boolean;
    canEditSharedViews?: boolean;
    columns?: List<ColumnInfoLite>;
    description?: string;
    hidden?: boolean;
    inherit?: boolean;
    isInherited?: boolean;
    isMetadataOverrideable?: boolean;
    isUserDefined?: boolean;
    name?: string;
    snapshot?: false;
    title?: string;
    viewDataUrl?: string;

    static create(raw: IQueryInfoLite): QueryInfoLite {
        return new QueryInfoLite(Object.assign({}, raw, {
            columns: List((raw.columns as any).map(c => ColumnInfoLite.create(c)))
        }));
    }

    constructor(values?: {[key:string]: any}) {
        super(values);
    }

    getLookupInfo(rangeURI?: string): {name: string, type: PropDescType} {
        let pkCols = this.getPkColumns();

        if (pkCols.size > 0 || pkCols.size <= 2) {
            let pk: ColumnInfoLite;

            pkCols.forEach(col => {
                if (col.name.toLowerCase() !== 'container') {
                    pk = col;
                    return false;
                }
            });

            if (pk) {
                let type = PROP_DESC_TYPES.find(propType => propType.name.toLowerCase() === pk.jsonType.toLowerCase());

                // if supplied, apply rangeURI matching filter
                if (type && (rangeURI === undefined || rangeURI === type.rangeURI)) {
                    return {
                        name: this.name,
                        type
                    }
                }
            }
        }

        return undefined;
    }

    getPkColumns(): List<ColumnInfoLite> {
        return this.columns.filter(c => c.isKeyField).toList();
    }
}