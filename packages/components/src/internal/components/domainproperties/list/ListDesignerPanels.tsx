import React from 'react';
import { List } from 'immutable';
import { ActionURL } from '@labkey/api';

import { DomainDesign, DomainFieldIndexChange, IAppDomainHeader } from '../models';
import DomainForm from '../DomainForm';
import { getDomainPanelStatus, saveDomain } from '../actions';
import { importData } from '../../../query/api';

import { Progress } from '../../base/Progress';
import { BaseDomainDesigner, InjectedBaseDomainDesignerProps, withBaseDomainDesigner } from '../BaseDomainDesigner';
import { resolveErrorMessage } from '../../../util/messaging';

import { SetKeyFieldNamePanel } from './SetKeyFieldNamePanel';
import { ListModel } from './models';
import { ListPropertiesPanel } from './ListPropertiesPanel';

interface Props {
    initModel?: ListModel;
    onChange?: (model: ListModel) => void;
    onCancel: () => void;
    onComplete: (model: ListModel, fileImportError?: string) => void;
    useTheme?: boolean;
    containerTop?: number; // This sets the top of the sticky header, default is 0
    successBsStyle?: string;
    saveBtnText?: string;
}

interface State {
    model: ListModel;
    file: File;
    shouldImportData: boolean;
}

class ListDesignerPanelsImpl extends React.PureComponent<Props & InjectedBaseDomainDesignerProps, State> {
    constructor(props: Props & InjectedBaseDomainDesignerProps) {
        super(props);

        this.state = {
            model: props.initModel || ListModel.create({}),
            file: undefined,
            shouldImportData: false,
        };
    }

    onPropertiesChange = (model: ListModel) => {
        const { onChange } = this.props;

        this.setState(
            () => ({ model }),
            () => {
                if (onChange) {
                    onChange(model);
                }
            }
        );
    };

    onDomainChange = (domain: DomainDesign, dirty: boolean, rowIndexChange?: DomainFieldIndexChange) => {
        const { onChange } = this.props;
        const { model } = this.state;

        // Issue 40262: If we have a titleColumn selected and the name changes (not the row index), update the titleColumn
        let titleColumn = model.titleColumn;
        if (titleColumn && !rowIndexChange) {
            const index = model.domain.findFieldIndexByName(titleColumn);
            titleColumn = index > -1 ? domain.fields.get(index).name : undefined;
        }

        this.setState(
            state => ({
                model: state.model.merge({ domain, titleColumn }) as ListModel,
            }),
            () => {
                // Issue 39918: use the dirty property that DomainForm onChange passes
                if (onChange && dirty) {
                    onChange(this.state.model);
                }
            }
        );
    };

    setFileImportData = (file: File, shouldImportData: boolean) => {
        this.setState({ file, shouldImportData });
    };

    handleFileImport() {
        const { setSubmitting } = this.props;
        const { file, model } = this.state;

        importData({
            schemaName: 'lists',
            queryName: model.name,
            file,
            importUrl: ActionURL.buildURL('list', 'UploadListItems', LABKEY.container.path, { name: model.name }),
        })
            .then(response => {
                setSubmitting(false, () => {
                    this.props.onComplete(model);
                });
            })
            .catch(error => {
                console.error(error);
                setSubmitting(false, () => {
                    this.props.onComplete(model, resolveErrorMessage(error));
                });
            });
    }

    onFinish = () => {
        const { setSubmitting } = this.props;
        const { model } = this.state;
        const isValid = model.isValid();

        this.props.onFinish(isValid, this.saveDomain);

        if (!isValid) {
            const exception = !model.hasValidKeyType()
                ? 'You must specify a key field for your list in the fields panel to continue.'
                : model.domain.getFirstFieldError();
            const updatedModel = model.set('exception', exception) as ListModel;
            setSubmitting(false, () => {
                this.setState(() => ({ model: updatedModel }));
            });
        }
    };

    saveDomain = () => {
        const { setSubmitting } = this.props;
        const { model, shouldImportData } = this.state;

        saveDomain(model.domain, model.getDomainKind(), model.getOptions(), model.name)
            .then(response => {
                let updatedModel = model.set('exception', undefined) as ListModel;
                updatedModel = updatedModel.merge({ domain: response }) as ListModel;
                this.setState(() => ({ model: updatedModel }));

                // If we're importing List file data, import file contents
                if (shouldImportData) {
                    this.handleFileImport();
                } else {
                    setSubmitting(false, () => {
                        this.props.onComplete(updatedModel);
                    });
                }
            })
            .catch(response => {
                const exception = resolveErrorMessage(response);
                const updatedModel = exception
                    ? (model.set('exception', exception) as ListModel)
                    : (model.merge({ domain: response, exception: undefined }) as ListModel);

                setSubmitting(false, () => {
                    this.setState(() => ({ model: updatedModel }));
                });
            });
    };

    headerRenderer = (config: IAppDomainHeader) => {
        return <SetKeyFieldNamePanel model={this.state.model} onModelChange={this.onPropertiesChange} {...config} />;
    };

    render() {
        const {
            onCancel,
            useTheme,
            containerTop,
            successBsStyle,
            visitedPanels,
            currentPanelIndex,
            firstState,
            validatePanel,
            submitting,
            onTogglePanel,
            saveBtnText,
        } = this.props;
        const { model, file } = this.state;

        return (
            <BaseDomainDesigner
                name={model.name}
                exception={model.exception}
                domains={List.of(model.domain)}
                hasValidProperties={model.hasValidProperties()}
                visitedPanels={visitedPanels}
                submitting={submitting}
                onCancel={onCancel}
                onFinish={this.onFinish}
                saveBtnText={saveBtnText}
                successBsStyle={successBsStyle}
            >
                <ListPropertiesPanel
                    model={model}
                    onChange={this.onPropertiesChange}
                    controlledCollapse={true}
                    initCollapsed={currentPanelIndex !== 0}
                    panelStatus={
                        model.isNew()
                            ? getDomainPanelStatus(0, currentPanelIndex, visitedPanels, firstState)
                            : 'COMPLETE'
                    }
                    validate={validatePanel === 0}
                    onToggle={(collapsed, callback) => {
                        onTogglePanel(0, collapsed, callback);
                    }}
                    useTheme={useTheme}
                    successBsStyle={successBsStyle}
                />
                <DomainForm
                    key={model.domain.domainId || 0}
                    domainIndex={0}
                    domain={model.domain}
                    headerTitle="Fields"
                    todoIconHelpMsg="This section does not contain any user-defined fields and requires a selection for the Key Field Name property."
                    helpNoun="list"
                    helpTopic={null} // null so that we don't show the "learn more about this tool" link for this domains
                    onChange={this.onDomainChange}
                    setFileImportData={this.setFileImportData}
                    controlledCollapse={true}
                    initCollapsed={currentPanelIndex !== 1}
                    validate={validatePanel === 1}
                    panelStatus={
                        model.isNew()
                            ? getDomainPanelStatus(1, currentPanelIndex, visitedPanels, firstState)
                            : 'COMPLETE'
                    }
                    showInferFromFile={true}
                    containerTop={containerTop}
                    onToggle={(collapsed, callback) => {
                        onTogglePanel(1, collapsed, callback);
                    }}
                    useTheme={useTheme}
                    successBsStyle={successBsStyle}
                    appDomainHeaderRenderer={model.isNew() && model.domain.fields.size > 0 && this.headerRenderer}
                />
                <Progress
                    modal={true}
                    delay={1000}
                    estimate={file ? file.size * 0.005 : undefined}
                    title="Importing data from selected file..."
                    toggle={submitting && file !== undefined}
                />
            </BaseDomainDesigner>
        );
    }
}

export const ListDesignerPanels = withBaseDomainDesigner<Props>(ListDesignerPanelsImpl);