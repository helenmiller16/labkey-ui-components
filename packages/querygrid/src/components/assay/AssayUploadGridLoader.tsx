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
import * as React from 'react'
import { Map, OrderedMap } from 'immutable'
import {
    QueryGridModel,
    IGridLoader,
    IGridResponse,
    AssayDomainTypes,
    AssayDefinitionModel,
    GRID_EDIT_INDEX,
    generateId
} from '@glass/base'

import { AssayWizardModel } from "./models";

const EMPTY_GRID_ROW = OrderedMap<any, any>({
    [[GRID_EDIT_INDEX, generateId()].join('|')]: Map<string, any>()
});

export class AssayUploadGridLoader implements IGridLoader {

    model: AssayWizardModel;
    assayDefinition: AssayDefinitionModel;

    constructor(model: AssayWizardModel, assayDefinition: AssayDefinitionModel) {
        this.model = model;
        this.assayDefinition = assayDefinition;
    }

    fetch(gridModel: QueryGridModel): Promise<IGridResponse> {
        return new Promise((resolve) => {
            const sampleColumnData = this.assayDefinition.getSampleColumn();
            const sampleColInResults = sampleColumnData && sampleColumnData.domain === AssayDomainTypes.RESULT;
            const hasSamples = sampleColInResults && this.model.selectedSamples;

            // We only care about passing samples to the data grid if there is a sample column in the results domain.
            const data = hasSamples ? this.model.selectedSamples : EMPTY_GRID_ROW;

            resolve({
                data,
                dataIds: data.keySeq().toList(),
            });
        });
    }
}