/*
 * Copyright (c) 2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
import * as React from 'react'
import { storiesOf } from '@storybook/react'
import { boolean, button, number, radios, select, text, withKnobs } from '@storybook/addon-knobs'

import { ToggleButtons } from "../components/buttons/ToggleButtons";
import './stories.css'

interface State {
    selected: string
}

class WrappedToggleButtons extends React.Component<any, State>
{
    constructor(props: any) {
        super(props);

        this.state = {
            selected: undefined
        }
    }

    onClick = (selected: string) => {
        this.setState(() => ({selected}));
    };

    render() {
        return (
            <ToggleButtons
                first={text('first button text', 'TSV')}
                second={text('second button text', 'CSV')}
                onClick={this.onClick}
                active={this.state.selected}
            />
        );
    }
}

storiesOf("ToggleButtons", module)
    .addDecorator(withKnobs)
    .add("with knobs", () => {
        return <WrappedToggleButtons/>
    });