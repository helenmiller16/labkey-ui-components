/*
 * Copyright (c) 2016-2018 LabKey Corporation. All rights reserved. No portion of this work may be reproduced in
 * any form or by any electronic or mechanical means without written permission from LabKey Corporation.
 */
import { List } from 'immutable';
import { Security } from '@labkey/api';

import {
    MENU_INVALIDATE,
    MENU_LOADING_END,
    MENU_LOADING_ERROR,
    MENU_LOADING_START,
    MENU_RELOAD,
    SET_RELOAD_REQUIRED,
    UPDATE_USER_DISPLAY_NAME,
    USER_PERMISSIONS_REQUEST,
    USER_PERMISSIONS_SUCCESS,
    SERVER_NOTIFICATIONS_LOADING_START,
    SERVER_NOTIFICATIONS_LOADING_END,
    SERVER_NOTIFICATIONS_LOADING_ERROR,
    SERVER_NOTIFICATIONS_INVALIDATE,
    RESET_QUERY_GRID_STATE,
} from './constants';
import { ServerActivity } from "../components/notifications/model";

function successUserPermissions(response) {
    return {
        type: USER_PERMISSIONS_SUCCESS,
        response,
    };
}

function fetchUserPermissions() {
    return new Promise((resolve, reject) => {
        Security.getUserPermissions({
            success: data => {
                resolve(data);
            },
            failure: error => {
                reject(error);
            },
        });
    });
}

export function getUserPermissions() {
    return dispatch => {
        dispatch({
            type: USER_PERMISSIONS_REQUEST,
        });

        return fetchUserPermissions()
            .then(response => {
                dispatch(successUserPermissions(response));
            })
            .catch(error => {
                console.error(error);
            });
    };
}

export function updateUserDisplayName(displayName: string) {
    return {
        type: UPDATE_USER_DISPLAY_NAME,
        displayName,
    };
}

export function setReloadRequired() {
    return {
        type: SET_RELOAD_REQUIRED,
    };
}

export function doResetQueryGridState() {
    return {
        type: RESET_QUERY_GRID_STATE
    };
}

export function menuInit(currentProductId: string, userMenuProductId: string, productIds?: List<string>) {
    return (dispatch, getState) => {
        let menu = getState().routing.menu;
        if ((!menu.isLoaded && !menu.isLoading) || menu.needsReload) {
            if (!menu.needsReload) {
                dispatch({
                    type: MENU_LOADING_START,
                    currentProductId,
                    userMenuProductId,
                    productIds, // when undefined, this returns all menu sections for modules in this container
                });
            }
            menu = getState().routing.menu;
            menu.getMenuSections()
                .then(sections => {
                    dispatch({
                        type: MENU_LOADING_END,
                        sections,
                    });
                })
                .catch(reason => {
                    console.error('Problem retrieving product menu data.', reason);
                    dispatch({
                        type: MENU_LOADING_ERROR,
                        message: 'Error in retrieving product menu data. Please contact your site administrator.',
                    });
                });
        }
    };
}

export function menuInvalidate() {
    return (dispatch, getState) => {
        dispatch({ type: MENU_INVALIDATE });
    };
}

// an alternative to menuInvalidate, which doesn't erase current menu during reload
export function menuReload() {
    return (dispatch, getState) => {
        dispatch({ type: MENU_RELOAD });
    };
}

export function serverNotificationInit(serverActivitiesLoaderFn: (maxRows?: number) => Promise<ServerActivity>) {
    return (dispatch, getState) => {
        let serverNotificationModel = getState().serverNotifications;
        if (serverNotificationModel && !serverNotificationModel.isLoaded && !serverNotificationModel.isLoading) {
            dispatch({
                type: SERVER_NOTIFICATIONS_LOADING_START,
                serverActivitiesLoaderFn
            });
            serverActivitiesLoaderFn()
                .then(serverActivity => {
                    dispatch({
                        type: SERVER_NOTIFICATIONS_LOADING_END,
                        serverActivity,
                    });
                })
                .catch(reason => {
                    console.error('Unable to retrieve notifications.', reason);
                    dispatch({
                        type: SERVER_NOTIFICATIONS_LOADING_ERROR,
                        message: 'Unable to retrieve notifications.',
                    });
                });
        }
    };
}

export function serverNotificationInvalidate() {
    return (dispatch, getState) => {
        dispatch({ type: SERVER_NOTIFICATIONS_INVALIDATE });
    };
}
