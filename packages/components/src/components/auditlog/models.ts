/*
 * Copyright (c) 2016-2018 LabKey Corporation. All rights reserved. No portion of this work may be reproduced in
 * any form or by any electronic or mechanical means without written permission from LabKey Corporation.
 */
import { fromJS, Map, Record } from 'immutable';

export class AuditDetailsModel extends Record({
    rowId: undefined,
    comment: undefined,
    eventUserId: undefined,
    eventDateFormatted: undefined,
    oldData: undefined,
    newData: undefined,
}) {
    rowId?: number;
    comment?: string;
    eventUserId?: number;
    eventDateFormatted?: string;
    oldData?: Map<string, string>;
    newData?: Map<string, string>;

    constructor(values?: { [key: string]: any }) {
        super(values);
    }

    static create(raw: any): AuditDetailsModel {
        return new AuditDetailsModel({
            ...raw,
            oldData: raw.oldData ? fromJS(raw.oldData) : undefined,
            newData: raw.newData ? fromJS(raw.newData) : undefined,
        });
    }

    isUpdate() {
        return this.oldData && this.newData && this.oldData.size > 0 && this.newData.size > 0;
    }

    isInsert() {
        return this.oldData && this.newData && this.oldData.size === 0 && this.newData.size > 0;
    }

    isDelete() {
        return this.oldData && this.newData && this.oldData.size > 0 && this.newData.size === 0;
    }

    getActionLabel() {
        if (this.isUpdate()) return 'Updated';
        else if (this.isInsert()) return 'Created';
        else if (this.isDelete()) return 'Deleted';
        else return 'Updated';
    }
}