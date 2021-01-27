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
import React from 'react';
import { storiesOf } from '@storybook/react';
import { text, withKnobs } from '@storybook/addon-knobs';

import './stories.scss';
import { ImportWithRenameConfirmModal } from '../internal/components/assay/ImportWithRenameConfirmModal';

storiesOf('ImportWithRenameConfirmModal', module)
    .addDecorator(withKnobs)
    .add('with knobs', () => {
        return (
            <ImportWithRenameConfirmModal
                originalName={text('Original file name', 'original.txt')}
                newName={text('New file name', 'original_1.txt')}
                folderType={text('Folder type', 'Product')}
                onConfirm={() => console.log('confirm')}
                onCancel={() => console.log('cancel')}
            />
        );
    });
