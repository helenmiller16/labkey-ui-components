/*
 * Copyright (c) 2019 LabKey Corporation. All rights reserved. No portion of this work may be reproduced in
 * any form or by any electronic or mechanical means without written permission from LabKey Corporation.
 */
import React from 'react'
import { List, Map } from "immutable";
import { Button, Row, Col, MenuItem } from "react-bootstrap";
import { Filter, ActionURL } from "@labkey/api";
import { CreateUsersModal } from "./CreateUsersModal";
import { QueryGridModel } from "../base/models/model";
import { SCHEMAS } from "../base/models/schemas";
import { getStateQueryGridModel } from "../../models";
import { getQueryGridModel } from "../../global";
import { ManageDropdownButton } from "../buttons/ManageDropdownButton";
import { SelectionMenuItem } from "../menus/SelectionMenuItem";
import { QueryGridPanel } from "../QueryGridPanel";
import { UserDetailsPanel } from "./UserDetailsPanel";
import { SecurityPolicy, SecurityRole } from "../permissions/models";
import { UserActivateChangeConfirmModal } from "./UserActivateChangeConfirmModal";
import { capitalizeFirstChar } from "../../util/utils"
import { getLocation, getRouteFromLocationHash, replaceParameter } from "../../util/URL";
import { getBrowserHistory } from "../../util/global";
import { UserDeleteConfirmModal } from "./UserDeleteConfirmModal";
import { getSelectedUserIds } from "./actions";
import { getSelected } from "../../actions";

const OMITTED_COLUMNS = List(['phone', 'im', 'mobile', 'pager', 'groups', 'active', 'hasPassword', 'firstName', 'lastName', 'description', 'expirationDate']);

interface Props {
    onCreateComplete: (response: any, role: string) => any
    onUsersStateChangeComplete: (response: any) => any

    policy: SecurityPolicy
    rolesByUniqueName: Map<string, SecurityRole>

    // optional array of role options, objects with id and label values (i.e. [{id: "org.labkey.api.security.roles.ReaderRole", label: "Reader (default)"}])
    // note that the createNewUser action will not use this value but it will be passed back to the onCreateComplete
    newUserRoleOptions?: Array<any>

    // option to disable the delete UI pieces for this component
    allowDelete?: boolean
}

interface State {
    usersView: string
    showDialog: string // valid options are 'create', 'deactivate', 'reactivate', 'delete', undefined
    selectedUserId: number
    unlisten: any
}

export class SiteUsersGridPanel extends React.PureComponent<Props, State> {

    static defaultProps = {
        allowDelete: true
    };

    constructor(props: Props) {
        super(props);

        // add a URL listener specifically for the usersView param so that we can change the QueryGridPanel data accordingly without a route change
        const unlisten = getBrowserHistory().listen((location, action) => {
            if (getRouteFromLocationHash(location.hash) === '#/admin/users') {
                // if the usersView param has changed, set state to trigger re-render with proper QueryGridModel
                const usersView = this.getUsersView(ActionURL.getParameters(location.hash).usersView);
                if (this.state.usersView !== usersView) {
                    this.setState((state) => ({
                        usersView,
                        selectedUserId: undefined // clear selected user anytime we change views
                    }));
                }
            }
        });

        this.state = {
            usersView: this.getUsersView(getLocation().query.get('usersView')),
            showDialog: undefined,
            selectedUserId: undefined,
            unlisten
        }
    }

    componentDidMount() {
        this.setLastSelectedId();
    }

    componentDidUpdate(prevProps: Readonly<Props>) {
        this.setLastSelectedId();
    }

    componentWillUnmount() {
        const { unlisten } = this.state;
        if (unlisten) {
            unlisten();
        }
    }

    getUsersView(paramVal: string): string {
        return paramVal === 'inactive' ? paramVal : 'active'; // default to view active users
    }

    getUsersModel(): QueryGridModel {
        const { usersView } = this.state;
        const gridId = 'user-management-users-' + usersView;
        const model = getStateQueryGridModel(gridId, SCHEMAS.CORE_TABLES.USERS, {
            containerPath: '/',
            omittedColumns: OMITTED_COLUMNS,
            baseFilters: List<Filter.IFilter>([Filter.create('active', usersView === 'active')]),
            bindURL: true,
            isPaged: true
        });

        return getQueryGridModel(model.getId()) || model;
    }

    toggleViewActive = () => {
        const currentView = this.state.usersView;
        const newView = currentView === 'active' ? 'inactive' : 'active';
        replaceParameter(getLocation(), 'usersView', newView);
    };

    toggleDialog = (name: string, requiresSelection = false) => {
        if (requiresSelection && this.getUsersModel().selectedIds.size === 0) {
            this.setState(() => ({showDialog: undefined}));
        }
        else {
            this.setState(() => ({showDialog: name}));
        }
    };

    onCreateComplete = (response: any, role: string) => {
        this.toggleDialog(undefined); // close dialog
        this.onRowSelectionChange(this.getUsersModel(), undefined, false); // clear selected user details
        this.props.onCreateComplete(response, role);
    };

    onUsersStateChangeComplete = (response: any, resetSelection = true) => {
        this.toggleDialog(undefined); // close dialog
        if (resetSelection) {
            this.onRowSelectionChange(this.getUsersModel(), undefined, false); // clear selected user details
        }

        this.props.onUsersStateChangeComplete(response);
    };

    onRowSelectionChange = (model, row, checked) => {
        let selectedUserId;

        if (checked) {
            // if a specific row has been selected, use that rows UserId value
            // else use the last userId in the selected array
            if (row) {
                selectedUserId = row.getIn(['UserId', 'value']);
            }
            else if (model.selectedIds.size > 0) {
                selectedUserId = this.getLastSelectedId();
            }
        }

        this.updateSelectedUserId(selectedUserId);
    };

    updateSelectedUserId(selectedUserId: number) {
        if (this.state.selectedUserId !== selectedUserId) {
            this.setState(() => ({selectedUserId}));
        }
    }

    getLastSelectedId(): number {
        const selectedIds = this.getUsersModel().selectedIds;
        return selectedIds.size > 0 ? parseInt(selectedIds.last()) : undefined;
    }

    setLastSelectedId() {
        const model = this.getUsersModel();

        // if the model has already loaded selections, we can use that to reselect the last user
        // otherwise, query the server for the selection key for this model and use that response (issue 39374)
        if (model.selectedLoaded) {
            this.updateSelectedUserId(this.getLastSelectedId());
        }
        else {
            getSelected(model.getId(), model.schema, model.query, model.getFilters(), model.containerPath)
                .then((response) => {
                    const selectedUserId = response.selected.length > 0 ? parseInt(List.of(...response.selected).last()) : undefined;
                    this.updateSelectedUserId(selectedUserId);
                });
        }
    }

    renderButtons = () => {
        const viewActive = this.state.usersView === 'active';

        return (
            <>
                <Button bsStyle={'success'} onClick={() => this.toggleDialog('create')}>
                    Create
                </Button>
                <ManageDropdownButton id={'users-manage-btn'}>
                    {viewActive &&
                        <SelectionMenuItem
                            id={'deactivate-users-menu-item'}
                            text={'Deactivate Users'}
                            onClick={() => this.toggleDialog('deactivate', true)}
                            model={this.getUsersModel()}
                            nounPlural={"users"}
                        />
                    }
                    {this.props.allowDelete &&
                        <SelectionMenuItem
                            id={'delete-users-menu-item'}
                            text={'Delete Users'}
                            onClick={() => this.toggleDialog('delete', true)}
                            model={this.getUsersModel()}
                            nounPlural={"users"}
                        />
                    }
                    {!viewActive &&
                        <SelectionMenuItem
                            id={'reactivate-users-menu-item'}
                            text={'Reactivate Users'}
                            onClick={() => this.toggleDialog('reactivate', true)}
                            model={this.getUsersModel()}
                            nounPlural={"users"}
                        />
                    }
                    <MenuItem
                        id={'viewactive-users-menu-item'}
                        onClick={this.toggleViewActive}
                    >
                        View {(viewActive ? 'Inactive' : 'Active') + ' Users'}
                    </MenuItem>
                </ManageDropdownButton>
            </>
        )
    };

    render() {
        const { newUserRoleOptions, allowDelete } = this.props;
        const { selectedUserId, showDialog, usersView } = this.state;

        return (
            <>
                <Row>
                    <Col xs={12} md={8}>
                        <QueryGridPanel
                            header={capitalizeFirstChar(usersView) + ' Users'}
                            buttons={this.renderButtons}
                            onSelectionChange={this.onRowSelectionChange}
                            model={this.getUsersModel()}
                        />
                    </Col>
                    <Col xs={12} md={4}>
                        <UserDetailsPanel
                            {...this.props}
                            userId={selectedUserId}
                            onUsersStateChangeComplete={this.onUsersStateChangeComplete}
                        />
                    </Col>
                </Row>
                <CreateUsersModal
                    show={showDialog === 'create'}
                    roleOptions={newUserRoleOptions}
                    onComplete={this.onCreateComplete}
                    onCancel={() => this.toggleDialog(undefined)}
                />
                {(showDialog === 'reactivate' || showDialog === 'deactivate') &&
                    <UserActivateChangeConfirmModal
                        userIds={getSelectedUserIds(this.getUsersModel())}
                        reactivate={showDialog === 'reactivate'}
                        onComplete={this.onUsersStateChangeComplete}
                        onCancel={() => this.toggleDialog(undefined)}
                    />
                }
                {allowDelete && showDialog === 'delete' &&
                    <UserDeleteConfirmModal
                        userIds={getSelectedUserIds(this.getUsersModel())}
                        onComplete={this.onUsersStateChangeComplete}
                        onCancel={() => this.toggleDialog(undefined)}
                    />
                }
            </>
        )
    }
}