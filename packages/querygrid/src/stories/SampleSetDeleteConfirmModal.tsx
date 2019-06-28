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
import { storiesOf } from "@storybook/react";
import { boolean, number, select, text, withKnobs } from '@storybook/addon-knobs';
import { SampleSetDeleteConfirmModal } from "../components/samples/SampleSetDeleteConfirmModal";

import './stories.scss'

storiesOf('SampleDeleteConfirmModal', module)
    .addDecorator(withKnobs)
    .add('with knobs', () => {
        return <SampleSetDeleteConfirmModal
            rowId={0}
            showDependenciesLink={boolean('showDependenciesLink', false)}
            onConfirm={() => console.log('confirm')}
            onCancel={() => console.log('cancel')}
        />
    });