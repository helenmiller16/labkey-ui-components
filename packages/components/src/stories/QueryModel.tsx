import React, { PureComponent } from 'react';
import { InjectedQueryModelProps, withQueryModel } from '../models/withQueryModel';
import { storiesOf } from '@storybook/react';
import { LoadingSpinner } from '..';

interface ExampleProps {
    message: string,
}

class ExampleComponentImpl extends PureComponent<ExampleProps & InjectedQueryModelProps, {}> {
    render() {
        const { message, queryModel, actions } = this.props;
        // Commented out code below will not compile because of ImmutableQueryModel:
        // ERROR in /.../src/stories/QueryModel.tsx(25,20)
        // TS2540: Cannot assign to 'data' because it is a read-only property.
        // queryModel.data = { badIdea: 'I will not compile!'};
        const { loadingRows, loadingSelections } = queryModel;
        const { schemaName, queryName, viewName, offset, maxRows, rowCount } = queryModel;

        return (
            <div>
                <div className="example-component-message">
                    {message}
                </div>

                <div className="query-model-info">
                    <div>Schema Name: {schemaName}</div>
                    <div>Query Name: {queryName}</div>
                    <div>View Name: {viewName}</div>
                    <div>Offset: {queryModel.offset}</div>
                    <div>
                        <button disabled={offset === 0} onClick={actions.prevPage}>Previous</button>
                        <span>&nbsp;</span>
                        <button disabled={(offset + maxRows) >= rowCount} onClick={actions.nextPage}>Next</button>
                    </div>
                </div>

                <div>
                    {loadingRows ? <LoadingSpinner msg="loading page" /> : <span>&nbsp;</span>}
                </div>

                <ul className="query-model-rows">
                    {queryModel.rows?.map((row, idx) => {
                        const rowId = row.RowId.value;
                        const name = row.Name.displayValue || row.Name.value;
                        const expirationTime = row.expirationTime.value;
                        // The key below is wonky because our test data has a bunch of duplicate rowIds
                        return (
                            <li key={`${rowId}-${idx}`}>
                                {name} - {expirationTime}
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    }
}

const config = {
    id: 'myId',
    schemaName: 'exp.data',
    queryName: 'mixturespaging',
    viewName: '~~DEFAULT~~',
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
