import React from 'react';
import { PermissionTypes } from '@labkey/api';

import {
    TEST_USER_APP_ADMIN,
    TEST_USER_ASSAY_DESIGNER,
    TEST_USER_EDITOR,
    TEST_USER_READER,
} from '../../../test/data/users';
import { mountWithServerContext } from '../../testHelpers';

import { RequiresPermission } from './Permissions';

const CONTENT = <div className="requires-permission-content" />;
const CONTENT_SELECTOR = 'div.requires-permission-content';

describe('<RequiresPermission/>', () => {
    test('does not have permission', () => {
        // Act
        const wrapper = mountWithServerContext(
            <RequiresPermission perms={PermissionTypes.Admin}>{CONTENT}</RequiresPermission>,
            { user: TEST_USER_READER }
        );

        // Assert
        expect(wrapper.find(CONTENT_SELECTOR).exists()).toBe(false);
    });
    test('has permission', () => {
        // Act
        const wrapper = mountWithServerContext(
            <RequiresPermission perms={PermissionTypes.Admin}>{CONTENT}</RequiresPermission>,
            { user: TEST_USER_APP_ADMIN }
        );

        // Assert
        expect(wrapper.find(CONTENT_SELECTOR).exists()).toBe(true);
    });
    test('does not have all permissions', () => {
        // Act
        // TEST_USER_ASSAY_DESIGNER does not have PermissionTypes.Delete
        const wrapper = mountWithServerContext(
            <RequiresPermission perms={[PermissionTypes.Delete, PermissionTypes.DesignAssay]}>
                {CONTENT}
            </RequiresPermission>,
            { user: TEST_USER_ASSAY_DESIGNER }
        );

        // Assert
        expect(wrapper.find(CONTENT_SELECTOR).exists()).toBe(false);
    });
    test('has all permissions', () => {
        // Act
        const wrapper = mountWithServerContext(
            <RequiresPermission perms={[PermissionTypes.Read, PermissionTypes.Update, PermissionTypes.Delete]}>
                {CONTENT}
            </RequiresPermission>,
            { user: TEST_USER_EDITOR }
        );

        // Assert
        expect(wrapper.find(CONTENT_SELECTOR).exists()).toBe(true);
    });
});
