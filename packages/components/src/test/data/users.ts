import { List } from 'immutable';

import { User } from '../..';

export const TEST_USER_GUEST = new User({
    canDelete: false,
    canDeleteOwn: false,
    canInsert: false,
    canUpdate: false,
    canUpdateOwn: false,
    isAdmin: false,
    isAnalyst: false,
    isDeveloper: false,
    isGuest: true,
    isRootAdmin: false,
    isSignedIn: false,
    isSystemAdmin: false,
    isTrusted: false,
    permissionsList: List<string>(['org.labkey.api.security.permissions.ReadPermission']),
});

export const TEST_USER_READER = new User({
    id: 1200,
    canDelete: false,
    canDeleteOwn: false,
    canInsert: false,
    canUpdate: false,
    canUpdateOwn: false,
    displayName: 'ReaderDisplayName',
    isAdmin: false,
    isAnalyst: false,
    isDeveloper: false,
    isGuest: false,
    isRootAdmin: false,
    isSignedIn: true,
    isSystemAdmin: false,
    isTrusted: false,
    permissionsList: List<string>(['org.labkey.api.security.permissions.ReadPermission']),
});

export const TEST_USER_AUTHOR = new User({
    id: 1300,
    canDelete: false,
    canDeleteOwn: false,
    canInsert: true,
    canUpdate: false,
    canUpdateOwn: false,
    displayName: 'AuthorDisplayName',
    isAdmin: false,
    isAnalyst: true,
    isDeveloper: false,
    isGuest: false,
    isRootAdmin: false,
    isSignedIn: true,
    isSystemAdmin: false,
    isTrusted: true,
    permissionsList: List<string>([
        'org.labkey.api.security.permissions.ReadPermission',
        'org.labkey.api.security.permissions.InsertPermission',
    ]),
});

export const TEST_USER_EDITOR = new User({
    id: 1100,
    canDelete: true,
    canDeleteOwn: true,
    canInsert: true,
    canUpdate: true,
    canUpdateOwn: true,
    displayName: 'EditorDisplayName',
    isAdmin: false,
    isAnalyst: true,
    isDeveloper: false,
    isGuest: false,
    isRootAdmin: false,
    isSignedIn: true,
    isSystemAdmin: false,
    isTrusted: true,
    permissionsList: List<string>([
        'org.labkey.api.security.permissions.DeletePermission',
        'org.labkey.api.security.permissions.ReadPermission',
        'org.labkey.api.security.permissions.InsertPermission',
        'org.labkey.api.security.permissions.UpdatePermission',
    ]),
});

export const TEST_USER_ASSAY_DESIGNER = new User({
    id: 1400,
    canDelete: false,
    canDeleteOwn: false,
    canInsert: false,
    canUpdate: false,
    canUpdateOwn: false,
    displayName: 'AssayDesignerDisplayName',
    isAdmin: false,
    isAnalyst: false,
    isDeveloper: false,
    isGuest: false,
    isRootAdmin: false,
    isSignedIn: true,
    isSystemAdmin: false,
    isTrusted: false,
    permissionsList: List<string>([
        'org.labkey.api.security.permissions.ReadPermission',
        'org.labkey.api.assay.security.DesignAssayPermission',
    ]),
});

export const TEST_USER_FOLDER_ADMIN = new User({
    id: 1005,
    canDelete: true,
    canDeleteOwn: true,
    canInsert: true,
    canUpdate: true,
    canUpdateOwn: true,
    displayName: 'FolderAdminDisplayName',
    isAdmin: true,
    isAnalyst: true,
    isDeveloper: true,
    isGuest: false,
    isRootAdmin: false,
    isSignedIn: true,
    isSystemAdmin: false,
    isTrusted: true,
    permissionsList: List<string>([
        'org.labkey.api.security.permissions.DeletePermission',
        'org.labkey.api.security.permissions.ReadPermission',
        'org.labkey.api.security.permissions.DesignDataClassPermission',
        'org.labkey.api.security.permissions.DesignSampleSetPermission',
        'org.labkey.api.assay.security.DesignAssayPermission',
        'org.labkey.api.security.permissions.InsertPermission',
        'org.labkey.api.security.permissions.UpdatePermission',
        'org.labkey.api.security.permissions.AdminPermission',
    ]),
});

export const TEST_USER_APP_ADMIN = new User({
    id: 1005,
    canDelete: true,
    canDeleteOwn: true,
    canInsert: true,
    canUpdate: true,
    canUpdateOwn: true,
    displayName: 'AppAdminDisplayName',
    isAdmin: true,
    isAnalyst: false,
    isDeveloper: false,
    isGuest: false,
    isRootAdmin: true,
    isSignedIn: true,
    isSystemAdmin: false,
    isTrusted: false,
    permissionsList: List<string>([
        'org.labkey.api.security.permissions.DeletePermission',
        'org.labkey.api.security.permissions.ReadPermission',
        'org.labkey.api.security.permissions.DesignDataClassPermission',
        'org.labkey.api.security.permissions.DesignSampleSetPermission',
        'org.labkey.api.assay.security.DesignAssayPermission',
        'org.labkey.api.security.permissions.InsertPermission',
        'org.labkey.api.security.permissions.UpdatePermission',
        'org.labkey.api.security.permissions.AdminPermission',
        'org.labkey.api.security.permissions.UserManagementPermission',
        'org.labkey.api.security.permissions.ApplicationAdminPermission',
    ]),
});
