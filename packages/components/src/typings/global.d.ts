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

import { List, Map } from "immutable";
import { LookupStore, EditorModel } from "../models";
import { Lineage } from "../components/lineage/models";
import { QueryGridModel } from "../components/base/models/model";
import { IUser } from "../components/forms/model";
import { NotificationItemModel } from "../components/notifications/model";

// Typescript helper definition of global state for reactn
declare module 'reactn/default' {
    export interface State {
        // src/global.ts
        QueryGrid_editors: Map<string, EditorModel>,
        QueryGrid_lineageResults: Map<string, Lineage>,
        QueryGrid_lookups: Map<string, LookupStore>,
        QueryGrid_metadata: Map<string, any>,
        QueryGrid_models: Map<string, QueryGridModel>,
        QueryGrid_columnrenderers: Map<string, any>,
        QueryGrid_users: Map<string, List<IUser>>,

        // src/util/global.ts
        BrowserHistory: any // TODO what type to use here?

        // src/components/notifications/global.ts
        Notifications: Map<string, NotificationItemModel>
    }
}