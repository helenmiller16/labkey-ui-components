import React from 'reactn';

import { Button, Form, Panel } from 'react-bootstrap';

import { Map, OrderedMap } from 'immutable'

import {
    AddEntityButton,
    Alert,
    capitalizeFirstChar,
    IGridLoader,
    IGridResponse,
    LoadingSpinner,
    Progress,
    QueryColumn,
    QueryGridModel,
    QueryInfo,
    RemoveEntityButton,
    SchemaQuery
} from '@glass/base';

import { addColumns, changeColumn, gridInit, gridShowError, queryGridInvalidate, removeColumn, } from '../../actions';
import { getEditorModel, getQueryGridModel, removeQueryGridModel } from '../../global';

import { getStateQueryGridModel } from '../../model'

import { EditableColumnMetadata } from "../editable/EditableGrid"
import { EditableGridPanel } from '../editable/EditableGridPanel'
import { getQueryDetails, InsertRowsResponse } from '../../query/api'
import { Location } from '../../util/URL'
import { SCHEMAS } from '../../query/schemas'
import { SelectInput } from '../forms/SelectInput'

import {
    GenerateSampleResponse,
    IParentOption,
    ISampleSetOption,
    SampleIdCreationModel,
    SampleSetOption,
    SampleSetParentType
} from './models';
import { initSampleSetInsert } from './actions';


class SampleGridLoader implements IGridLoader {

    model: SampleIdCreationModel;

    constructor(model: SampleIdCreationModel) {
        this.model = model;
    }

    fetch(gridModel: QueryGridModel): Promise<IGridResponse> {
        const data = this.model.getGridValues(gridModel.queryInfo);

        return Promise.resolve({
            data,
            dataIds: data.keySeq().toList()
        });
    }
}

interface SampleInsertPageProps {
    afterSampleCreation?: (sampleSetName, filter, sampleCount) => void
    location?: Location
    onCancel?: () => void
}

interface StateProps {
    insertModel: SampleIdCreationModel
    originalQueryInfo?: QueryInfo
}

export class SampleInsertPanel extends React.Component<SampleInsertPageProps, StateProps> {

    constructor(props: any) {
        super(props);

        this.insertRowsFromGrid = this.insertRowsFromGrid.bind(this);
        this.deriveSampleIds = this.deriveSampleIds.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.addParent = this.addParent.bind(this);
        this.changeTargetSampleSet = this.changeTargetSampleSet.bind(this);
        this.onRowCountChange = this.onRowCountChange.bind(this);

        this.state = {
            insertModel: undefined
        };
    }

    componentWillMount() {
        this.init(this.props)
    }

    componentWillReceiveProps(nextProps: SampleInsertPageProps) {
        this.init(nextProps)
    }

    componentWillUnmount() {
        this.removeQueryGridModel();
    }

    removeQueryGridModel() {
        const gridModel = this.getQueryGridModel();

        if (gridModel) {
            removeQueryGridModel(gridModel);
        }
    }

    static getQueryParameters(query: any) {
        const { parent, selectionKey, target } = query;
        let parents;
        if (parent) {
            parents = parent.split(';');
        }

        return {
            parents,
            selectionKey,
            target
        }
    }

    init(props: SampleInsertPageProps) {

        const queryParams = props.location ? SampleInsertPanel.getQueryParameters(props.location.query) : {
            parents: undefined,
            selectionKey: undefined,
            target: undefined
        };

        let { insertModel } = this.state;

        if (insertModel
            && (insertModel.targetSampleSet && insertModel.targetSampleSet.value === queryParams.target || !insertModel.targetSampleSet && !queryParams.target)
            && insertModel.selectionKey === queryParams.selectionKey
            && insertModel.parents === queryParams.parents
        )
            return;

        insertModel = new SampleIdCreationModel({
            parents: queryParams.parents,
            initialSampleSet: queryParams.target,
            selectionKey: queryParams.selectionKey,
            sampleCount: 0,
        });

        initSampleSetInsert(insertModel).then((partialModel) => {
            let updatedModel = insertModel.merge(partialModel) as SampleIdCreationModel;
            this.gridInit(updatedModel);
        });
    }

    gridInit(insertModel: SampleIdCreationModel) {
        const schemaQuery = insertModel.getSchemaQuery();
        if (schemaQuery) {
            getQueryDetails(schemaQuery.toJS()).then(originalQueryInfo => {
                this.setState(() => {
                    return {
                        insertModel,
                        originalQueryInfo,
                    }
                });
                gridInit(this.getQueryGridModel(), true, this);
            }).catch((reason) => {
                this.setState(() => {
                    return {
                        insertModel: insertModel.merge({
                            isError: true,
                            errors: "Problem retrieving data for sample set '" + insertModel.getTargetSampleSetName() + "'."
                        }) as SampleIdCreationModel
                    }
                })
            });
        }
        else {
            this.setState(() => {
                return {
                    insertModel
                }
            });
            gridInit(this.getQueryGridModel(), true, this);
        }
    }

    getQueryGridModel(): QueryGridModel {
        const { insertModel } = this.state;

        if (insertModel) {
            const sampleSetName = insertModel ? insertModel.getTargetSampleSetName() : undefined;
            const gridId = sampleSetName ? 'insert-sample-set-' + sampleSetName : undefined;
            if (gridId) {
                const queryInfoWithParents = this.getGridQueryInfo();
                const model = getStateQueryGridModel(gridId, SchemaQuery.create('samples', sampleSetName),
                    {
                        editable: true,
                        loader: new SampleGridLoader(insertModel),
                        queryInfo: queryInfoWithParents
                    });

                return getQueryGridModel(model.getId()) || model;
            }
            else {
                return undefined;
            }
        }
    }

    static convertParentInputSchema(parentSchema: string): string {
        return parentSchema === SCHEMAS.DATA_CLASSES.SCHEMA ? QueryColumn.DATA_INPUTS : QueryColumn.MATERIAL_INPUTS;
    }

    createParentColumnName(parent: SampleSetParentType) {
        const parentInputType = SampleInsertPanel.convertParentInputSchema(parent.schema);
        const formattedQueryName = capitalizeFirstChar(parent.query);
        // Issue 33653: query name is case-sensitive for some data inputs (sample parents), so leave it
        // capitalized here and we lower it where needed
        return [parentInputType, formattedQueryName].join('/');
    }

    // TODO: We should stop generating this on the client and retrieve the actual ColumnInfo from the server
    static generateParentColumn(parent: SampleSetParentType): QueryColumn {
        const parentInputType = SampleInsertPanel.convertParentInputSchema(parent.schema);
        const formattedQueryName = capitalizeFirstChar(parent.query);
        // Issue 33653: query name is case-sensitive for some data inputs (sample parents), so leave it
        // capitalized here and we lower it where needed
        const parentColName = [parentInputType, formattedQueryName].join('/');

        // 32671: Sample import and edit grid key ingredients on scientific name
        let displayColumn = 'Name';
        if (parent.schema && parent.query &&
            parent.schema.toLowerCase() === SCHEMAS.DATA_CLASSES.INGREDIENTS.schemaName.toLowerCase() &&
            parent.query.toLowerCase() === SCHEMAS.DATA_CLASSES.INGREDIENTS.queryName.toLowerCase()) {
            displayColumn ='scientificName';
        }

        return QueryColumn.create({
            caption: formattedQueryName + ' Parents',
            description: 'Contains optional parent entity for this ' + formattedQueryName,
            fieldKeyArray: [parentColName],
            fieldKey: parentColName,
            lookup: {
                displayColumn,
                isPublic: true,
                keyColumn: 'RowId',
                multiValued: 'junction',
                queryName: parent.query,
                schemaName: parent.schema,
                table: parentInputType
            },
            name: parentColName,
            required: false,
            shownInInsertView: true,
            type: 'Text (String)',
            userEditable: true
        });
    }

    getParentColumns() : OrderedMap<string, QueryColumn> {

        const { insertModel } = this.state;

        let columns = OrderedMap<string, QueryColumn>();
        insertModel.sampleParents.forEach((parent) => {
            if (parent.schema && parent.query) {
                const column = SampleInsertPanel.generateParentColumn(parent);
                // Issue 33653: query name is case-sensitive for some data inputs (sample parents)
                columns = columns.set(column.name.toLowerCase(), column);
            }
        });
        return columns;
    }

    getGridQueryInfo(): QueryInfo {
        const { insertModel, originalQueryInfo } = this.state;

        if (originalQueryInfo) {
            const nameIndex = Math.max(0, originalQueryInfo.columns.toList().findIndex((column) => (column.fieldKey === "Name")));
            const newColumnIndex = nameIndex + insertModel.sampleParents.filter((parent) => parent.query !== undefined).count();
            const columns = originalQueryInfo.insertColumns(newColumnIndex, this.getParentColumns());
            return originalQueryInfo.merge({columns}) as QueryInfo;
        }
        return undefined;
    }

    changeTargetSampleSet(fieldName: string, formValue: any, selectedOption: ISampleSetOption): void {
        const { insertModel } = this.state;
        const updatedModel = insertModel.merge({
            targetSampleSet: new SampleSetOption(selectedOption),
            isError: false,
            errors: undefined
        }) as SampleIdCreationModel;
        if (insertModel) {
            this.setState(() => {
                return {
                    originalQueryInfo: undefined,
                    insertModel: updatedModel
                }
            }, () => {
                this.gridInit(updatedModel);
            });
        }
    }

    addParent() {
        const { insertModel } = this.state;
        const nextIndex = insertModel.sampleParents.size + 1;
        const updatedParents = insertModel.sampleParents.push(SampleSetParentType.create({index: nextIndex}));

        this.setState(() => {
            return {
                insertModel: insertModel.set('sampleParents', updatedParents) as SampleIdCreationModel
            }
        });
    }

    changeParent(index: number, fieldName: string, formValue: any, parent: IParentOption): void {
        const { insertModel } = this.state;
        let column;
        let parentColumnName;
        let existingParent;
        const queryGridModel = this.getQueryGridModel();
        if (queryGridModel) {

            let updatedModel = insertModel;
            if (parent) {

                const existingParentKey = insertModel.sampleParents.findKey(parent => parent.get('index') === index);
                existingParent = insertModel.sampleParents.get(existingParentKey);
                const parentType = SampleSetParentType.create({
                    index,
                    key: existingParent.key,
                    query: parent.query,
                    schema: parent.schema
                });
                updatedModel = insertModel.mergeIn([
                    'sampleParents',
                    existingParentKey
                ], parentType) as SampleIdCreationModel;
                column = SampleInsertPanel.generateParentColumn(parentType);
            }
            else {
                let parentToResetKey = insertModel.sampleParents.findKey(parent => parent.get('index') === index);
                const existingParent = insertModel.sampleParents.get(parentToResetKey);
                parentColumnName = this.createParentColumnName(existingParent);
                updatedModel = insertModel.mergeIn([
                    'sampleParents',
                    parentToResetKey
                ], SampleSetParentType.create({
                    key: existingParent.key,
                    index,
                })) as SampleIdCreationModel;
            }
            this.setState(() => {
                return {
                    insertModel: updatedModel,
                }
            }, () => {

                if (column && existingParent) {
                    if (existingParent.query !== undefined) {
                        changeColumn(queryGridModel, this.createParentColumnName(existingParent), column);
                    }
                    else {
                        let columnMap = OrderedMap<string, QueryColumn>();

                        // if there is no "Name" column (may not happen? legacy?), we'll put the columns at the beginning
                        // this is probably pretty expensive to create a list in order to find the index, but ...
                        const nameIndex = Math.max(0, queryGridModel.queryInfo.columns.toList().findIndex((column) => (column.fieldKey === "Name")));

                        const newColumnIndex = nameIndex + 1 + insertModel.sampleParents.filter((parent) => parent.query !== undefined).count();
                        addColumns(queryGridModel, newColumnIndex, columnMap.set(column.fieldKey.toLowerCase(), column));
                    }
                }
                else {
                    removeColumn(queryGridModel,  parentColumnName);
                }
            })
        }
    }

    removeParent(index) {
        const { insertModel } = this.state;
        let parentToResetKey = insertModel.sampleParents.findKey(parent => parent.get('index') === index);
        let parentColumnName = this.createParentColumnName(insertModel.sampleParents.get(parentToResetKey));
        const sampleParents = this.state.insertModel.sampleParents
            .filter(parent => parent.index !== index)
            .map((parent, key) => parent.set('index', (key + 1)));

        const updatedModel = this.state.insertModel.merge({
            sampleParents,
        }) as SampleIdCreationModel;
        this.setState(() => {
            return {
                insertModel: updatedModel,
            }
        }, () => {
            removeColumn(this.getQueryGridModel(),  parentColumnName);
        });
    }

    renderParentSelections() {
        const { insertModel } = this.state;

        if (insertModel) {
            const {isInit, targetSampleSet, sampleParents} = insertModel;

            if (isInit && targetSampleSet) {
                return (
                    <>
                        {sampleParents.map((sampleParent) => {
                            const { index, key, query } = sampleParent;
                            return (
                                <div className="form-group row" key={key}>
                                    <SelectInput
                                        formsy={false}
                                        containerClass=''
                                        inputClass="col-sm-5"
                                        label={"Parent " + index + " Type"}
                                        labelClass="col-sm-3"
                                        name={"parent-type-select-" + index}
                                        onChange={this.changeParent.bind(this, index)}
                                        options={insertModel.getParentOptions(index)}
                                        value={query}
                                    />

                                    <RemoveEntityButton
                                        entity="Parent"
                                        index={index}
                                        onClick={this.removeParent.bind(this, index)}/>
                                </div>
                            )
                        }).toArray()}
                        <div className="col-sm-12">
                            <AddEntityButton
                                entity="Parent"
                                onClick={this.addParent}/>
                        </div>
                    </>
                );
            }
        }
    }

    renderHeader() {
        const { insertModel } = this.state;

        if (!insertModel)
            return null;

        // TODO the name here is not necessarily the same as shown in the navigation menu.  It is not
        // split at CamelCase boundary.
        const name = insertModel.getTargetSampleSetName();
        const headingSuffix = name ? "for '" + name +"'" : "";
        const textPrefix = name ? "Choose" : "Choose the target sample set, then choose";
        return (
            <>
                <h3>Create Samples {headingSuffix}</h3>
                <div className="sample-insert--header">
                    {textPrefix} parent types for the samples to be generated and enter other data for the samples.&nbsp;
                    {name &&
                        <>
                            Specific parents can be chosen in the grid or bulk insert area.
                            <br/><br/>
                        {this.isNameRequired() ?
                            <>
                                A sample ID is required for each new sample since this sample set has no name expression.
                                You can provide a name expression by editing the sample set definition.
                            </> :
                            <>
                                Sample IDs will be generated for any samples that have no sample ID provided in the grid.
                            </>
                        }
                        </>}
                    <br/>
                    <br/>
                </div>

                {insertModel.isInit && (
                    <SelectInput
                        formsy={false}
                        inputClass="col-md-5 col-sm-9"
                        label="Target Sample Set"
                        labelClass="col-md-3 col-sm-3"
                        name="targetSampleSet"
                        onChange={this.changeTargetSampleSet}
                        options={insertModel.sampleSetOptions.toArray()}
                        required
                        value={insertModel && insertModel.hasTargetSampleSet() ? insertModel.targetSampleSet.label : undefined}/>
                )}
                {insertModel.isError ? this.renderError() : (insertModel.hasTargetSampleSet() ? this.renderParentSelections()
                    : (
                    <div className="col-sm-offset-3">Select a Sample Set</div>
                ))}
            </>
        )
    }

    onRowCountChange(rowCount: number) {
        const { insertModel } = this.state;
        const queryModel = this.getQueryGridModel();
        const editorModel = getEditorModel(queryModel.getId());
        if (editorModel) {
            this.setState(() => {
                return {
                    insertModel: insertModel.set('sampleCount', editorModel.rowCount) as SampleIdCreationModel
                }
            });
        }
    }

    onCancel() {
        if (this.props.onCancel) {
            this.removeQueryGridModel();
            this.props.onCancel();
        } else {
            const { insertModel } = this.state;
            const updatedModel = insertModel.merge({
                isError: false,
                errors: undefined,
            }) as SampleIdCreationModel;
            this.setState(() => {
                return {
                    insertModel: updatedModel
                }
            });
            queryGridInvalidate(updatedModel.getSchemaQuery());
            this.gridInit(updatedModel);
        }
    }

    insertRowsFromGrid() {
        const { insertModel } = this.state;
        const queryGridModel = this.getQueryGridModel();
        const editorModel = getEditorModel(queryGridModel.getId());
        const errors =  editorModel.getValidationErrors(queryGridModel, "Name");
        if (errors.length > 0) {
            gridShowError(queryGridModel, {
                message: errors.join("  ")
            });
            return;
        }

        this.setState(() => {
            return {
                insertModel: insertModel.merge({
                    isSubmitting: true
                }) as SampleIdCreationModel
            }
        });
        insertModel.postSampleGrid(this.getQueryGridModel()).then((response: InsertRowsResponse) => {
            if (response && response.rows) {

                this.setState(() => {
                    return {
                        insertModel: insertModel.merge({
                            isSubmitting: false
                        }) as SampleIdCreationModel
                    }
                });
                if (this.props.afterSampleCreation) {
                    this.props.afterSampleCreation(insertModel.getTargetSampleSetName(), response.getFilter(), response.rows.length);
                }
            }
            else {
                gridShowError(queryGridModel, {
                    message: 'Insert response has unexpected format. No "rows" available.'
                });
            }
        }).catch((error: InsertRowsResponse) => {
            this.setState(() => {
                return {
                    insertModel: insertModel.merge({
                        isSubmitting: false
                    }) as SampleIdCreationModel
                }
            });
            gridShowError(queryGridModel, {
                message: error.error.exception
            });
        });
    }

    deriveSampleIds(count: number) {
        const { insertModel } = this.state;
        this.setState(() => {
            return {
                insertModel: insertModel.merge({
                    isSubmitting: true
                }) as SampleIdCreationModel
            }
        });
        insertModel.deriveSamples(count).then((result: GenerateSampleResponse) => {
            this.setState(() => {
                return {
                    insertModel: insertModel.merge({
                        isSubmitting: false
                    }) as SampleIdCreationModel
                }
            });
            if (this.props.afterSampleCreation) {
                this.props.afterSampleCreation(insertModel.getTargetSampleSetName(), result.getFilter(), result.data.materialOutputs.length);
            }
        }).catch((reason) => {
            gridShowError(this.getQueryGridModel(), reason);
            this.setState(() => {
                return {
                    insertModel: insertModel.merge({
                        isSubmitting: false
                    }) as SampleIdCreationModel
                }
            })
        });
    }

    isNameRequired() {
        const queryGridModel = this.getQueryGridModel();
        if (queryGridModel && queryGridModel.queryInfo) {
            const nameColumn = queryGridModel.queryInfo.columns.find((column) => (column.fieldKey.toLowerCase() === "name"));
            return nameColumn ? nameColumn.required : false;
        }
        return false;
    }

    renderButtons() {
        const { insertModel } = this.state;
        const queryModel = this.getQueryGridModel();
        const editorModel = queryModel ? getEditorModel(queryModel.getId()) : undefined;
        if (insertModel && insertModel.isInit) {
            const noun = insertModel.sampleCount == 1 ? "Sample" : "Samples";
            return (
                <div className="form-group no-margin-bottom">

                    <div className="pull-left">
                        <Button className={"test-loc-cancel-button"} onClick={this.onCancel}>Cancel</Button>
                    </div>
                    <div className="btn-group pull-right">
                        <Button
                            className={"test-loc-submit-button"}
                            bsStyle="success"
                            disabled={insertModel.isSubmitting || insertModel.sampleCount === 0 || !editorModel }
                            onClick={this.insertRowsFromGrid}
                            >
                            {insertModel.isSubmitting ? "Creating..." : "Finish Creating " + insertModel.sampleCount + " " + noun}
                        </Button>
                    </div>
                </div>
            );
        }
        return null;
    }

    renderError() {
        const { insertModel } = this.state;
        if (insertModel.isError) {
            return <Alert>{insertModel.errors ? insertModel.errors : 'Something went wrong loading the data for this page.  Please try again.'}</Alert>
        }
    }

    render() {

        const { insertModel } = this.state;

        if (!insertModel)
            return <LoadingSpinner wrapperClassName="loading-data-message"/>;

        const bulkUpdateProps = {
            title: "Bulk Creation of Samples",
            header: "Choose parents, etc.",
        };
        let addControlProps = {
            nounSingular: "sample",
            nounPlural: "samples"
        };
        if (!this.isNameRequired()) {
            addControlProps['quickAddText'] = "Bypass the grid";
            addControlProps['onQuickAdd'] = this.deriveSampleIds
        }
        let columnMetadata = Map<string, EditableColumnMetadata>();
        if (!this.isNameRequired()) {
            columnMetadata = columnMetadata.set("Name", {
                readOnly: false,
                placeholder: "[generated id]"
            })
        }
        const queryGridModel = this.getQueryGridModel();

        return (
            <Panel>
                <Panel.Body>
                    <Form>
                        {this.renderHeader()}
                        {queryGridModel && queryGridModel.isLoaded ?
                            <EditableGridPanel
                                addControlProps={addControlProps}
                                allowBulkRemove={true}
                                allowBulkUpdate={true}
                                bulkUpdateText={"Bulk Insert"}
                                bulkUpdateProps={bulkUpdateProps}
                                columnMetadata={columnMetadata}
                                onRowCountChange={this.onRowCountChange}
                                model={queryGridModel}
                            />
                            :
                             !insertModel.isError && insertModel.targetSampleSet && insertModel.targetSampleSet.value ? <LoadingSpinner wrapperClassName="loading-data-message"/> : null
                        }
                        {this.renderButtons()}
                    </Form>
                </Panel.Body>
                <Progress
                    estimate={insertModel.sampleCount * 20}
                    modal={true}
                    title="Generating samples"
                    toggle={insertModel.isSubmitting} />
            </Panel>
        )
    }
}