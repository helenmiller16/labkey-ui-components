/*
 * Copyright (c) 2019 LabKey Corporation. All rights reserved. No portion of this work may be reproduced in
 * any form or by any electronic or mechanical means without written permission from LabKey Corporation.
 */
import { Record } from 'immutable';
import { ActionURL, getServerContext } from '@labkey/api';

import { Container, User } from '../..';

const user = new User(getServerContext().user);

export class AppModel extends Record({
    container: new Container(getServerContext().container),
    contextPath: ActionURL.getContextPath(),
    initialUserId: user.id,
    logoutReason: undefined,
    reloadRequired: false,
    requestPermissions: true,
    user,
    needsInvalidateQueryGrid: false,
}) {
    container: Container;
    contextPath: string;
    initialUserId: number;
    logoutReason: LogoutReason;
    reloadRequired: boolean;
    requestPermissions: boolean;
    user: User;
    needsInvalidateQueryGrid: boolean; // separate query grid invalidate from menu reload, allow grid to invalidate on route change, to avoid invalid query grid state

    hasUserChanged(): boolean {
        return this.initialUserId !== this.user.id;
    }

    shouldReload(): boolean {
        return this.reloadRequired || this.hasUserChanged();
    }

    getLogoutTitle(): string {
        if (this.logoutReason === LogoutReason.SERVER_LOGOUT) {
            return 'Logged Out';
        }

        if (this.logoutReason === LogoutReason.SESSION_EXPIRED) {
            return 'Session Expired';
        }

        if (this.logoutReason === LogoutReason.SERVER_UNAVAILABLE) {
            return 'Server Unavailable';
        }

        return undefined;
    }

    getLogoutReason(): string {
        if (this.logoutReason === LogoutReason.SERVER_LOGOUT) {
            return 'You have been logged out. Please reload the page to continue.';
        }

        if (this.logoutReason === LogoutReason.SESSION_EXPIRED) {
            return 'Your session has expired. Please reload the page to continue.';
        }

        if (this.logoutReason === LogoutReason.SERVER_UNAVAILABLE) {
            return 'The server is currently unavailable. Please try reloading the page to continue.';
        }

        return undefined;
    }

    shouldInvalidateQueryGrid(): boolean {
        return this.needsInvalidateQueryGrid;
    }

}

export enum LogoutReason {
    SERVER_LOGOUT,
    SESSION_EXPIRED,
    SERVER_UNAVAILABLE,
}
