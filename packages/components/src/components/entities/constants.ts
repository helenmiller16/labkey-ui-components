import { DELETE_SAMPLES_TOPIC, SCHEMAS } from '../..';
import { EntityDataType } from './models';

export const DATA_DELETE_CONFIRMATION_ACTION = 'getDataDeleteConfirmationData.api';
export const SAMPLE_DELETE_CONFIRMATION_ACTION = 'getMaterialDeleteConfirmationData.api';

export const SampleTypeDataType : EntityDataType = {
    typeListingSchemaQuery: SCHEMAS.EXP_TABLES.SAMPLE_SETS,
    instanceSchemaName: SCHEMAS.SAMPLE_SETS.SCHEMA,
    deleteConfirmationActionName: SAMPLE_DELETE_CONFIRMATION_ACTION,
    nounSingular: "sample",
    nounPlural: "samples",
    nounAsParentSingular: "Parent",
    descriptionSingular: "parent sample type",
    descriptionPlural: "parent sample types",
    uniqueFieldKey: 'Name',
    dependencyText: "derived sample or assay data dependencies",
    deleteHelpLinkTopic: DELETE_SAMPLES_TOPIC
};

export const DataClassDataType : EntityDataType = {
    typeListingSchemaQuery: SCHEMAS.EXP_TABLES.DATA_CLASSES,
    instanceSchemaName: SCHEMAS.DATA_CLASSES.SCHEMA,
    deleteConfirmationActionName: DATA_DELETE_CONFIRMATION_ACTION,
    nounSingular: "data",
    nounPlural: "data",
    nounAsParentSingular: "Parent",
    descriptionSingular: "parent type",
    descriptionPlural: "parent types",
    uniqueFieldKey: 'Name',
    dependencyText: "derived sample dependencies",
    deleteHelpLinkTopic: "dataClass" // no topic specific to deleting data classes yet, so we refer to data classes in general
};