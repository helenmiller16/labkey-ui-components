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
import { List, Record } from 'immutable'
import { Ajax, Utils } from '@labkey/api'
import { AppURL, buildURL } from '@glass/base'

export class MenuSectionModel extends Record( {
    label: undefined,
    url: undefined,
    items: List<MenuItemModel>(),
    totalCount: 0,
    itemLimit: undefined,
    key: undefined
}) {
    label: string;
    url: string;
    items: List<MenuItemModel>;
    totalCount: number;
    itemLimit: number;
    key: string;

    constructor(values?: {[key:string]: any}) {
        super(values);
    }

    static create(rawData): MenuSectionModel {
        if (rawData) {
            let items;

            if (rawData.items) {
                items = rawData.items.map(i => MenuItemModel.create(i, rawData.key));
            }

            return new MenuSectionModel(Object.assign({}, rawData, {
                items: List(items)
            }));
        }

        return new MenuSectionModel();
    }
}

export class MenuItemModel extends Record ({
    id: undefined,
    key: undefined,
    label: undefined,
    url: undefined,
    orderNum: undefined,
    requiresLogin: false
}) {
    id: number;
    key: string;
    label: string;
    url: string | AppURL;
    orderNum: number;
    requiresLogin: boolean;

    constructor(values?: {[key:string]: any}) {
        super(values);
    }

    static create(rawData, sectionKey: string) : MenuItemModel {
        if (rawData) {
            if (rawData.key && sectionKey !== "user") {
                return new MenuItemModel(Object.assign({}, rawData, {
                    url: AppURL.create(sectionKey, ...rawData.key.split("/"))
                }));
            }
            else {
                return new MenuItemModel(rawData);
            }
        }
        return new MenuItemModel();
    }
}

export class ProductMenuModel extends Record( {
    isError: false,
    isLoaded: false,
    isLoading: false,
    sections: List<MenuSectionModel>(),
    message: undefined,
    productId: undefined

}) {
    isError: boolean;
    isLoaded: boolean;
    isLoading: boolean;
    message: string;
    sections: List<MenuSectionModel>;
    productId: string;

    constructor(values?: {[key: string]: any}) {
        super(values);
    }

    init() {
        if (!this.isLoaded && !this.isLoading) {

            this.getMenuSections()
                .then(sections => {
                    return this.setLoadedSections(sections.asImmutable());
                })
                .catch(reason => {
                    console.error("Problem retrieving product menu data.", reason);
                    return this.setError('Error in retrieving product menu data. Please contact your site administrator.');
                });
        }
    }

    /**
     * Retrieve the product menu sections for this productId
     */
    getMenuSections() : Promise<List<MenuSectionModel>> {
        return new Promise((resolve, reject) =>  {

            return Ajax.request( {
                url: buildURL('product', 'menuSections.api'),
                method: 'GET',
                params: Object.assign({
                    productId: this.productId
                }),
                success: Utils.getCallbackWrapper((response) => {
                    let sections = List<MenuSectionModel>().asMutable();
                    response.forEach(sectionData => {
                        sections.push(MenuSectionModel.create(sectionData));
                    });
                    resolve(sections.asImmutable());
                }),
                failure: Utils.getCallbackWrapper((response) => {
                    reject(response);
                })
            });
        });
    }

    setLoadedSections(sections: List<MenuSectionModel> ) : ProductMenuModel {
        return this.merge( {
            isLoaded: true,
            isLoading: false,
            sections
        }) as ProductMenuModel;
    }

    setError( message: string) : ProductMenuModel {
        return this.merge({
            isLoading: false,
            isLoaded: true,
            isError: true,
            message
        }) as ProductMenuModel;
    }

    getSection(key: string): MenuSectionModel {
        if (this.sections.size > 0) {
            return this.sections
                .filter((section) => section.key.toLowerCase() === key.toLowerCase())
                .first();
        }
    }

    hasSectionItems(key: string): boolean {
        const section = this.getSection(key);
        return this.isLoaded && section && section.totalCount > 0;
    }
}