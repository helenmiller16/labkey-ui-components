import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';

import { AddEntityButton, AddEntityButtonProps } from '../internal/components/buttons/AddEntityButton';

export default {
    title: 'Components/AddEntityButton',
    component: AddEntityButton,
    argTypes: {
        onClick: {
            action: 'click',
            control: { disable: true },
            table: { disable: true },
        },
    },
} as Meta;

export const AddEntityButtonStory: Story<AddEntityButtonProps> = storyProps => <AddEntityButton {...storyProps} />;

AddEntityButtonStory.storyName = 'AddEntityButton';

AddEntityButtonStory.args = {
    disabled: false,
    entity: 'Entity',
    helperBody: 'https://www.labkey.org',
    title: 'Button title',
};
