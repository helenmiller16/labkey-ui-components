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
import { Filter } from '@labkey/api';

import { AppURL } from './AppURL';

describe('AppURL', () => {
    test('Empty values', () => {
        expect(AppURL.create().toHref()).toEqual('#');
        expect(() => AppURL.create('')).toThrow('AppURL: Unable to create URL with empty parts. Parts are [].');
        expect(() => AppURL.create('path', undefined)).toThrow(
            'AppURL: Unable to create URL with empty parts. Parts are [path, undefined].'
        );
    });

    test('Expected paths', () => {
        expect(AppURL.create('registry', 'molecule').addParam('RowId', 4).toHref()).toBe('#/registry/molecule?RowId=4');
        expect(AppURL.create('registry', 'vector', 'new').toHref()).toBe('#/registry/vector/new');
    });

    test('addFilters', () => {
        const url = AppURL.create('somePath').toHref();
        expect(
            AppURL.create('somePath').addFilters(Filter.create('Status', 'closed', Filter.Types.NOT_EQUAL)).toHref()
        ).toBe(url + '?query.Status~neq=closed');
        expect(
            AppURL.create('somePath')
                .addFilters(
                    Filter.create('Status', 'open', Filter.Types.NOT_EQUAL),
                    Filter.create('RowId', '10;11;12', Filter.Types.IN),
                    Filter.create('Bob', ['a', 20, 30], Filter.Types.IN)
                )
                .toHref()
        ).toBe(url + '?query.Status~neq=open&query.RowId~in=10;11;12&query.Bob~in=a;20;30');
    });

    test('addParam', () => {
        const url = AppURL.create('somePath').toHref();
        const expected = url + '?foo=fooval';
        expect(AppURL.create('somePath').addParam('foo', 'fooval').toHref()).toBe(expected);

        // should undefined be an acceptable key?
        expect(AppURL.create('somePath').addParam(undefined, 'undef').toHref()).toBe('#/somePath?undefined=undef');
    });

    test('addParams', () => {
        const actual = AppURL.create('somePath')
            .addParams({
                undef: undefined,
                val: 23,
                booze: 'gin',
                mix: 'tonic',
            })
            .toHref();

        // Check each parameter as order of params is non-deterministic
        expect(actual).toContain('undef=undefined');
        expect(actual).toContain('val=23');
        expect(actual).toContain('booze=gin');
        expect(actual).toContain('mix=tonic');
    });
});