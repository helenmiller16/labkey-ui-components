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
import * as React from 'react';
import { Map, fromJS } from "immutable";
import { storiesOf } from "@storybook/react";
import { boolean, number, select, text, withKnobs } from '@storybook/addon-knobs';
import { SampleSetDetailsPanel } from "../components/samples/SampleSetDetailsPanel";

import './stories.scss'

storiesOf('SampleSetDetailsPanel', module)
    .addDecorator(withKnobs)
    .add('for create', () => {
        return <SampleSetDetailsPanel
            onCancel={() => console.log('Cancel clicked')}
            onComplete={() => console.log('Create clicked')}
            nameExpressionInfoUrl={text('nameExpressionInfoUrl', undefined)}
        />
    })
    .add('for update', () => {
        const data = Map<string, any>(fromJS({
            RowId: {value: 1},
            Description: {value: 'The description for my existing sample set.'},
            NameExpression: {value: 'S-${genId}-${randomId}'}
        }));

        return <SampleSetDetailsPanel
            data={data}
            onCancel={() => console.log('Cancel clicked')}
            onComplete={() => console.log('Create clicked')}
            nameExpressionInfoUrl={text('nameExpressionInfoUrl', undefined)}
        />
    });