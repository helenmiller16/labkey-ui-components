import * as React from 'react'
import { fromJS } from 'immutable';
import { mount } from "enzyme";
import { Alert, LoadingSpinner } from "@glass/base";

import { SearchResultCard } from "./SearchResultCard";
import { SearchResultsPanel } from "./SearchResultsPanel";
import { SearchResultsModel } from "../../models";

import entitiesJSON from "../../test/data/searchResults.json";

describe("<SearchResultsPanel/>", () => {

    test("loading", () => {
        const model = SearchResultsModel.create({isLoading: true});
        const component = (
            <SearchResultsPanel model={model}/>
        );

        const wrapper = mount(component);
        expect(wrapper.find(LoadingSpinner)).toHaveLength(1);
        expect(wrapper.find(Alert)).toHaveLength(0);
        expect(wrapper.find(SearchResultCard)).toHaveLength(0);
        wrapper.unmount();
    });

    test("with error", () => {
        const model = SearchResultsModel.create({error: 'Test error message'});
        const component = (
            <SearchResultsPanel model={model}/>
        );

        const wrapper = mount(component);
        expect(wrapper.find(LoadingSpinner)).toHaveLength(0);
        expect(wrapper.find(Alert)).toHaveLength(1);
        expect(wrapper.find(SearchResultCard)).toHaveLength(0);
        wrapper.unmount();
    });

    test("with no search hits", () => {
        const model = SearchResultsModel.create({entities: fromJS({hits: []})});
        const component = (
            <SearchResultsPanel model={model}/>
        );

        const wrapper = mount(component);
        expect(wrapper.find(LoadingSpinner)).toHaveLength(0);
        expect(wrapper.find(Alert)).toHaveLength(0);
        expect(wrapper.find(SearchResultCard)).toHaveLength(0);
        wrapper.unmount();
    });

    test("with search hits", () => {
        const model = SearchResultsModel.create({entities: fromJS(entitiesJSON)});
        const component = (
            <SearchResultsPanel model={model}/>
        );

        const wrapper = mount(component);
        expect(wrapper.find(LoadingSpinner)).toHaveLength(0);
        expect(wrapper.find(Alert)).toHaveLength(0);
        expect(wrapper.find(SearchResultCard)).toHaveLength(46);
        wrapper.unmount();
    });

});