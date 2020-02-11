import React, { PureComponent } from 'react';
import { InjectedQueryModelProps, withQueryModel } from '../models/QueryModel';
import { storiesOf } from '@storybook/react';

interface ExampleProps extends InjectedQueryModelProps {
    message: string,
}

interface ExampleState {
    loading: boolean,
    data: any,
}

class ExampleComponentImpl extends PureComponent<ExampleProps, ExampleState> {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: null,
        };
    }

    render() {
        const { queryModel } = this.props;
        // Commented out code below will not compile because of ImmutableQueryModel:
        // ERROR in /.../src/stories/QueryModel.tsx(25,20)
        // TS2540: Cannot assign to 'data' because it is a read-only property.
        // queryModel.data = { badIdea: 'I will not compile!'};
        // TS2542: Index signature in type 'Immutable<any>' only permits reading.
        // queryModel.data.foo.bar = 'I will not compile!';
        return <div>{this.props.message} - {queryModel.schemaName} - {queryModel.queryName} - {queryModel.viewName}</div>;
    }
}

const config = {
    id: 'myId',
    schemaName: 'mySchema',
    queryName: 'myQuery',
    viewName: 'myView',
};

// Type safe, compiler will error when missing the props expected by MakeQueryModelProps or any other props from the
// ExampleProps interface. Slightly annoying because you need to pass in the Props type again.
const ExampleComponent = withQueryModel<ExampleProps>(ExampleComponentImpl);

// In the case that you forget to specify the type of your wrapped component it will complain if you forget any props
// from MakeQueryModelProps, but it has no clue if you forget anything from ExampleProps, and it lets you pass in any
// props you want, whether your component uses them or not. As far as I know there is no way to require someone pass
// a type to withQueryModel.
const ExampleComponentTwo = withQueryModel(ExampleComponentImpl);

storiesOf('QueryModel Examples', module)
    .add('Type Safe withQueryModel', () => {
        // Does not compile.
        // return <ExampleComponent />;

        // Does not compile.
        // return <ExampleComponent message="Hello World" />;

        // Does not compile.
        // return <ExampleComponent queryConfig={config} />;

        return <ExampleComponent queryConfig={config} message="Hello World" />;
    })
    .add('Not Type Safe withQueryModel', () => {
        // Compiles, it should not.
        // return <ExampleComponentTwo queryConfig={config} />;

        // Compiles, it should not.
        // return <ExampleComponentTwo queryConfig={config} foo="foo" />;

        // Does not compile.
        // return <ExampleComponent message="Hello World" />;

        // Unfortunately this compiles, it should not.
        return <ExampleComponentTwo queryConfig={config} />;
    });
