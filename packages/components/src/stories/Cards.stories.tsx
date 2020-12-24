/*
 * Copyright (c) 2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
import React from 'react';
import { Meta } from '@storybook/react/types-6-0';

import { Cards as CardsComponent } from '..';

import { ICON_URL } from './mock';

const cards = [
    {
        title: 'Test Title',
        caption: 'Testing the caption for one of these cards.',
        onClick: i => console.log('clicked: ' + i),
        iconUrl: ICON_URL,
    },
    {
        title: 'My Title is Too Long for Your Little Card',
        caption:
            'What happens when the caption is really long and the card box can not contain all of the caption information that I would really like to tell the user about in this very small space?',
        onClick: i => console.log('clicked: ' + i),
        iconUrl: ICON_URL,
    },
    {
        title: 'Without icon',
        caption: 'This shows what the card will look like with no icon.',
        onClick: i => console.log('clicked: ' + i),
        disabled: true,
    },
    {
        title: 'Without Broken Icon',
        caption: 'This shows what the card will look like with a broken icon src.',
        onClick: i => console.log('clicked: ' + i),
        iconSrc: 'bogus',
        disabled: true,
    },
];

export default {
    title: 'Components/Cards',
    component: CardsComponent,
} as Meta;

export const Cards = () => <CardsComponent cards={cards} />;