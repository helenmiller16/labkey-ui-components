/*
 * Copyright (c) 2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
import * as React from 'react'
import { storiesOf } from '@storybook/react'
import { text, boolean, withKnobs } from '@storybook/addon-knobs'

import { AssayProtocolModel } from "../models";
import { AssayPropertiesPanel } from "../components/assay/AssayPropertiesPanel"
import './stories.scss'

interface Props {
    data: {}
}

interface State {
    model: AssayProtocolModel
}

class WrappedAssayPropertiesPanel extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            model: AssayProtocolModel.create(props.data)
        }
    }

    onAssayPropertiesChange = (model: AssayProtocolModel) => {
        this.setState(() => ({model}));
    };

    render() {
        return (
            <AssayPropertiesPanel
                model={this.state.model}
                onChange={this.onAssayPropertiesChange}
                asPanel={boolean('asPanel', true)}
                showEditSettings={boolean('showEditSettings', true)}
                initCollapsed={boolean('initCollapsed', false)}
                collapsible={boolean('collapsible', true)}
                markComplete={boolean('markComplete', false)}
            />
        )
    }
}

storiesOf("AssayPropertiesPanel", module)
    .addDecorator(withKnobs)
    .add("with knobs", () => {
        return (
            <WrappedAssayPropertiesPanel
                data={{}}
            />
        )
    })
    .add("with model", () => {
        return (
            <WrappedAssayPropertiesPanel
                data={{
                    protocolId: 0,
                    name: 'name should not be editable',
                    description: 'test description for this assay',
                    editableRuns: true,
                    editableResults: true
                }}
            />
        )
    });