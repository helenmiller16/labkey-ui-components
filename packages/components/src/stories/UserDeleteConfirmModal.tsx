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
import { List } from 'immutable'
import { QueryGridModel } from "../components/base/models/model";
import { UserDeleteConfirmModal } from '../components/user/UserDeleteConfirmModal';
import './stories.scss';

storiesOf('UserDeleteConfirmModal', module)
    .add("single user selected", () => {
        return <UserDeleteConfirmModal
            model={new QueryGridModel({selectedIds: List<string>(['test1'])})}
            onComplete={(response) => console.log('complete', response)}
            onCancel={() => console.log('cancel')}
        />
    })
    .add("multiple user selected", () => {
        return <UserDeleteConfirmModal
            model={new QueryGridModel({selectedIds: List<string>(['test1', 'test2'])})}
            onComplete={(response) => console.log('complete', response)}
            onCancel={() => console.log('cancel')}
        />
    });
