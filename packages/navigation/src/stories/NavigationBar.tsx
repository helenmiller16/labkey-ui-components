/*
 * Copyright (c) 2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
import * as React from 'react'
import { storiesOf } from '@storybook/react'
import { boolean, number, text, withKnobs } from '@storybook/addon-knobs'
import { List, Map } from 'immutable'
import { User } from '@glass/base'

import { MenuSectionConfig } from '../components/ProductMenuSection'
import { MenuItemModel, MenuSectionModel, ProductMenuModel } from '../model'
import { NavigationBar } from '../components/NavigationBar'

import './stories.css'

const fruitTree = [
    "Apple",
    "Apricot",
    "Banana",
    "Lemon",
    "Lime",
    "Lychee",
    "Mango",
    "Orange",
    "Pineapple",
    "Plum",
    "Pear",
    "strawberry"
];

const vegetableGarden = [
    "Lettuce",
    "Tomato",
    "Spinach",
    "Corn",
    "Carrots",
    "Broccoli",
    "Cauliflower",
    "Beet",
    "Radish",
    "Beans",
    "Kale"
];

function makeMenuItems(nounPlural: string, options, menuItemLimit) : List<MenuItemModel> {
    let items = List<MenuItemModel>().asMutable();
    for (let i = 0; i < menuItemLimit; i++) {
        items.push(new MenuItemModel({
            key: options[i].toLowerCase(),
            label: options[i],
            url: "http://" + nounPlural.toLowerCase() + "/" + options[i].toLowerCase()
        }))
    }
    return items.asImmutable();
}

storiesOf('NavigationBar', module)
    .addDecorator(withKnobs)
    .add('Without section data', () => {
        const isLoading = boolean('isLoading', true);
        const isLoaded = boolean('isLoaded', false);
        const isError = boolean('isError', false);
        const message = text('error message', 'There was an error loading the menu items.');
        const productId = "testProduct";

        const model = new ProductMenuModel({
            isLoading: isLoading || !isError,
            isLoaded: isLoaded || isError,
            isError,
            message,
            productId,
        });

        const brandIcon = text("brand icon", "http://labkey.wpengine.com/wp-content/uploads/2015/12/cropped-LK-icon.png");
        const brandText = text('brand text', 'Logo');
        const brand = brandIcon ? <img src={brandIcon}  height="38px" width="38px"/> : <b>{brandText}</b>;

        return <NavigationBar
            brand={brand}
            projectName={text('projectName', 'Current Project')}
            menuSectionConfigs={undefined}
            model={model}
            showSearchBox={boolean('showSearchBox', true)}
            onSearch={(value: string) => console.log('Search term: ' + value)}
        />
    })
    .add("With empty section", () => {
        let sections  = List<MenuSectionModel>().asMutable();
        sections.push(new MenuSectionModel({
            label: "Fruits",
            url: undefined,
            items: List<MenuItemModel>(),
            totalCount: 0,
            itemLimit: undefined,
            key: "fruits"
        }));

        const model = new ProductMenuModel({
            isLoading: false,
            isLoaded: true,
            isError: false,
            productId: "emptySection",
            sections
        });

        let sectionConfigs = Map<string, MenuSectionConfig>().asMutable();
        sectionConfigs.set("fruits", new MenuSectionConfig({
            emptyText: text("emptySectionText", "We have no bananas"),
            iconCls:  text('iconClass', "fas fa-user-circle"),
            iconURL: text("iconURL", undefined)
        }));

        return <NavigationBar
                menuSectionConfigs={sectionConfigs}
                model={model}
                showSearchBox={false}
            />
    })
    .add("With sections", () => {
        const fruitGroup = "Fruit";
        const vegGroup = "Vegetables";
        const userGroup = "User";
        let sections  = List<MenuSectionModel>().asMutable();
        const fruitMenuLimit = number("Number of fruits in menu", 4, {
            range: true,
            min: 0,
            max: fruitTree.length,
            step: 1
        }, fruitGroup);
        const totalFruitCount = number("Total number of fruits", 4, {
            range: true,
            min: 0,
            max: fruitTree.length,
            step: 1
        },  fruitGroup);
        sections.push(new MenuSectionModel({
            label: "Fruits",
            url: undefined,
            items: makeMenuItems("fruits", fruitTree, fruitMenuLimit),
            totalCount: totalFruitCount,
            itemLimit: fruitMenuLimit,
            key: "fruits"
        }));

        const vegMenuLimit = number("Number of veggies in menu", 2, {
            range: true,
            min: 0,
            max: vegetableGarden.length,
            step: 1
        },  vegGroup);
        const totalVegCount = number("Total number of veggies", 4, {
            range: true,
            min: 0,
            max: vegetableGarden.length,
            step: 1
        }, vegGroup);

        sections.push(new MenuSectionModel({
            label: "Vegetables",
            items: makeMenuItems("vegetables", vegetableGarden, vegMenuLimit),
            totalCount: totalVegCount,
            itemLimit: vegMenuLimit,
            key: "vegetables"
        }));
        sections.push(new MenuSectionModel({
            key: "user",
            label: "Your Items",
            items: List<MenuItemModel>([
                new MenuItemModel({
                    key: "cart",
                    label: "Shopping Cart"
                }),
                new MenuItemModel( {
                    key: "profile",
                    requiresLogin: true,
                    label: "Profile"
                })
            ])
        }));


        const model = new ProductMenuModel({
            isLoading: false,
            isLoaded: true,
            isError: false,
            productId: "multipleSections",
            sections
        });

        let sectionConfigs = Map<string, MenuSectionConfig>().asMutable();
        sectionConfigs.set("fruits", new MenuSectionConfig({
            iconCls:  text('Fruit Section iconClass', undefined, fruitGroup),
            iconURL: text("Fruit Section iconURL", "http://labkey.wpengine.com/wp-content/uploads/2015/12/cropped-LK-icon.png", fruitGroup),
            maxItemsPerColumn: number("Max Fruits per column", 2, {}, fruitGroup),
            maxColumns: number("Max Fruit columns", 1, {}, fruitGroup),
        }));
        sectionConfigs.set("vegetables", new MenuSectionConfig( {
            iconCls:  text('Veg Section iconClass', undefined, vegGroup),
            iconURL: text("Veg Section iconURL", "http://labkey.wpengine.com/wp-content/uploads/2015/12/cropped-LK-icon.png", vegGroup),
            maxItemsPerColumn: number("Max veggies per column", 2, {}, vegGroup),
            maxColumns: number("Max veggie columns", 1, {}, vegGroup),
        }));
        sectionConfigs.set("user", new MenuSectionConfig({
            iconCls: text('userIconClass', 'fas fa-user-circle', "User")
        }));

        LABKEY['devMode'] = boolean('devMode', false, userGroup);
        const isSignedIn = boolean('User is signed in', true, userGroup);

        return <NavigationBar
            menuSectionConfigs={sectionConfigs.asImmutable()}
            model={model}
            showSearchBox={false}
            user={
                new User( {
                    avatar: undefined,
                    displayName: "Test User",
                    isSignedIn,
                    isGuest: !isSignedIn
                })
            }
        />
    })
;