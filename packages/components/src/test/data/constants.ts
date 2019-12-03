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
import { List, Map } from 'immutable';

import { AssayWizardModel } from '../../components/assay/models';
import assayWizardJSON from './assayWizardModel.json';
import { AssayDefinitionModel, AssayDomainTypes, QueryInfo } from '../../components/base/models/model';
import { IFile } from '../../components/files/models';

export const GRID_DATA = Map<any, Map<string, any>>({
    "1": Map<string, any>({
    GRID_EDIT_INDEX: 1,
    "rowid": "1",
    "Name": "name one",
    "Description": "first description"
}),
    "2": Map<any, Map<string, any>>({
    GRID_EDIT_INDEX: 2,
    "rowid": "2",
    "Name": "name two",
    "Description": "second description"
})
});

export const ASSAY_DEFINITION_MODEL = AssayDefinitionModel.create(assayWizardJSON.assayDef);
export const ASSAY_WIZARD_MODEL = new AssayWizardModel({
    isInit: true,
    assayDef: ASSAY_DEFINITION_MODEL,
    batchColumns: ASSAY_DEFINITION_MODEL.getDomainColumns(AssayDomainTypes.BATCH),
    runColumns: ASSAY_DEFINITION_MODEL.getDomainColumns(AssayDomainTypes.RUN),
    queryInfo: QueryInfo.create(assayWizardJSON.queryInfo)
});

export const FILES_DATA = List<IFile>([
    {
        name: "exam.xlsx",
        description: "i'm an excel file",
        created: "2019-11-08 12:26:30.064",
        createdById: 1005,
        createdBy: "Vader",
        iconFontCls: "fa fa-file-excel-o",
        downloadUrl: "/labkey/sm/sampleManagement-downloadAttachments.view?jobId=282&names=exam.xlsx&returnUrl=%2Flabkey%2Fgpat3%2FsampleManagement-appDev.view%23%2Fworkflow%2F282%2Ffiles"
    },{
        "name": "xray.gif",
        description: "i'm gif",
        "created": "2019-11-14 15:47:51.931",
        "createdById": 1100,
        "createdBy": "Skywalker",
        "iconFontCls": "fa fa-file-image-o",
        "downloadUrl": "/labkey/sm/sampleManagement-downloadAttachments.view?jobId=282&names=xray.gif&returnUrl=%2Flabkey%2Fgpat3%2FsampleManagement-appDev.view%23%2Fworkflow%2F282%2Ffiles"
    },{
        "name": "report.json",
        description: "i'm a json file",
        "created": "2019-11-14 15:48:11.472",
        "createdById": 1005,
        "createdBy": "Vader",
        "iconFontCls": "fa fa-file-o",
        "downloadUrl": "/labkey/sm/sampleManagement-downloadAttachments.view?jobId=282&names=sreport.json&returnUrl=%2Flabkey%2Fgpat3%2FsampleManagement-appDev.view%23%2Fworkflow%2F282%2Ffiles"
    }
]);