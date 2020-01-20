import React from 'react';
import { storiesOf } from '@storybook/react';
import { Record } from 'immutable';

interface Nested {
    nestedStr: string,
    nestedNum: number,
}

interface IExample {
    str: string,
    num: number,
    nested?: Nested,
}

class Example extends Record({
    str: '',
    num: 0,
    nested: { nestedStr: '', nestedNum: 0 },
}) implements IExample {
    str: string;
    num: number;
    nested: Nested;

    constructor(values?: IExample) {
        values ? super(values): super();
    }
}

storiesOf('ExampleRecord', module)
    .add('Example Record Not Type Safe', () => {
        const r1 = new Example({str: 'Record 1', num: 42});
        const r2 = r1.set('num', 'lol I am not a number!') as Example;
        // This instantiation of r3 is type safe because our constructor takes IExample interface.
        // const r3 = new Exmaple({str: 'Record 3', num: 42, oops: 'string'});
        const uhOh = r2.get('nun');

        console.log(r1.toJS()); // as expected
        console.log(r2.toJS()); // num is not a number!
        console.log(uhOh); // uhOh is undefined!

        return (
            <div>
                <div>{r1.str} - {r1.num}</div>
                <div>{r2.str} - {r2.num}</div>
                <div>{uhOh}</div>
            </div>
        );
    })
    .add('Example Record just as error prone', () => {
        const r1 = new Example({str: 'Record 1', num: 42});
        const r2 = new Example({str: 'Record 2', num: 42});
        console.log('r1 nested', r1.nested); // as expected
        console.log('r2 nested', r2.nested); // as expected
        r1.nested.nestedNum = 4; // hmmm
        console.log('r2.nested after r1.nested touched', r2.nested); // r2.nested matches r1.nested value.

        return (
            <div>
                <div>{r1.nested.nestedStr} - {r1.nested.nestedNum}</div>
                <div>{r2.nested.nestedStr} - {r2.nested.nestedNum}</div>
            </div>
        );
    });
