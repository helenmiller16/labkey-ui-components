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
import { List } from 'immutable';

import { UserActivateChangeConfirmModal } from '../internal/components/user/UserActivateChangeConfirmModal';
import './stories.scss';

storiesOf('UserActivateChangeConfirmModal', module)
    .add('reactivate - single user selected', () => {
        return (
            <UserActivateChangeConfirmModal
                userIds={List<number>([1])}
                reactivate={true}
                onComplete={response => console.log('complete', response)}
                onCancel={() => console.log('cancel')}
            />
        );
    })
    .add('reactivate - multiple user selected', () => {
        return (
            <UserActivateChangeConfirmModal
                userIds={List<number>([1, 2])}
                reactivate={true}
                onComplete={response => console.log('complete', response)}
                onCancel={() => console.log('cancel')}
            />
        );
    })
    .add('deactivate - single user selected', () => {
        return (
            <UserActivateChangeConfirmModal
                userIds={List<number>([1])}
                reactivate={false}
                onComplete={response => console.log('complete', response)}
                onCancel={() => console.log('cancel')}
            />
        );
    })
    .add('deactivate - multiple user selected', () => {
        return (
            <UserActivateChangeConfirmModal
                userIds={List<number>([1, 2])}
                reactivate={false}
                onComplete={response => console.log('complete', response)}
                onCancel={() => console.log('cancel')}
            />
        );
    });
