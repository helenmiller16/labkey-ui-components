import React, { PureComponent } from 'react';
import { InjectedQueryModelProps, withQueryModel } from '../models/withQueryModel';
import { storiesOf } from '@storybook/react';

interface ExampleProps {
    message: string,
}

class ExampleComponentImpl extends PureComponent<ExampleProps & InjectedQueryModelProps, {}> {
    render() {
        const { queryModel } = this.props;
        // Commented out code below will not compile because of ImmutableQueryModel:
        // ERROR in /.../src/stories/QueryModel.tsx(25,20)
        // TS2540: Cannot assign to 'data' because it is a read-only property.
        // queryModel.data = { badIdea: 'I will not compile!'};
        return <div>{this.props.message} - {queryModel.schemaName} - {queryModel.queryName} - {queryModel.viewName}</div>;
    }
}

const config = {
    id: 'myId',
    schemaName: 'mySchema',
    queryName: 'myQuery',
    viewName: '~~DETAILS~~',
};

// Type safe, compiler will error when missing the props expected by MakeQueryModelProps or any other props from the
// ExampleProps interface.
const ExampleComponent = withQueryModel<ExampleProps>(ExampleComponentImpl);

// Still type safe! Previous, more complicated version of HOC this was not type safe if you forgot <ExampleProps>.
const ExampleComponentTwo = withQueryModel(ExampleComponentImpl);
// Does not compile, missing all props
// const ex1 = <ExampleComponentTwo />;

// Does not compile, missing queryConfig
// const ex2 = <ExampleComponentTwo message="Hello World" />;

// Does not compile, missing message
// const ex3 <ExampleComponentTwo queryConfig={config} />;

// Does not compile, extra attribute foo
// const ex4 = <ExampleComponentTwo queryConfig={config} foo="foo" />;

storiesOf('QueryModel Examples', module)
    .add('Type Safe withQueryModel', () => {
        // Does not compile.
        // return <ExampleComponent />;

        // Does not compile.
        // return <ExampleComponent message="Hello World" />;

        // Does not compile.
        // return <ExampleComponent queryConfig={config} />;

        // Does not compile:
        // return <ExampleComponent queryConfig={config} message="" foo="foo" />;

        return <ExampleComponent queryConfig={config} message="Hello World" />;
    });
