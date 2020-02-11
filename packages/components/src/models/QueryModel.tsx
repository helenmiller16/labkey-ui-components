import React, { PureComponent, ComponentType } from 'react';

export interface QueryConfig {
    // Not the final design, for illustration purposes only.
    id: string;
    schemaName: string;
    queryName: string;
    viewName: string;
}

export interface QueryModel extends QueryConfig {
    // Not the final design, for illustration purposes only.
    data: { [key: string]: any };
}

type ImmutableQueryModel = Immutable<QueryModel>;

export interface QueryModelActions {
    // Not the final design, for illustration purposes only.
    load: () => void;
    loadPage: (pageNumber: number) => void;
    sort: (column: any, direction: string) => void;
    addFilter: (filter: any) => void;
}

type ImmutableQueryModelActions = Immutable<QueryModelActions>;

export interface InjectedQueryModelProps {
    // Probably the final design
    queryModel: ImmutableQueryModel;
    actions: ImmutableQueryModelActions;
}

export interface MakeQueryModelProps {
    // Probably the final design
    queryConfig: QueryConfig;
}

// See the comments in withQueryModel below.
export type WithQueryModelProps<Props extends InjectedQueryModelProps> = Omit<Props, keyof InjectedQueryModelProps> & MakeQueryModelProps;

/**
 * The actual implementation of withQueryModel will need to track multiple QueryModels, so instead this will probably be
 * queryModels: { [id: string]: QueryModel}.
 *
 *  We would also make a wrapper that just pulls out the only QueryModel for the single case. It could also handle
 *  the case where we swap queryModels. In that specific case it may make sense to keep the cached one around in case we
 *  swap back to the first one. Not sure yet.
 */
interface QueryModelState {
    queryModel?: QueryModel;
}

export function withQueryModel<P extends InjectedQueryModelProps>(ComponentToWrap: ComponentType<P>): ComponentType<WithQueryModelProps<P>> {
    // The components we're wrapping should extend InjectedQueryModelProps so they can receive a QueryModel and Actions
    // object. The wrapped component won't expect a QueryModel or Actions object as props, instead it will only expect a
    // QueryConfig, which is converted into a QueryModel and Actions object by withQueryModel. So in effect:
    // MyComponent<Props extends InjectedQueryModelProps> becomes MyComponent<Props extends MakeQueryModelProps>
    // type WithQueryModelProps = Omit<Props, keyof InjectedQueryModelProps> & MakeQueryModelProps;
    class ComponentWithQueryModel extends React.PureComponent<WithQueryModelProps<P>, QueryModelState> {
        actions: QueryModelActions;

        constructor(props) {
            super(props);
            this.state = {
                queryModel: {
                    id: 'someId',
                    schemaName: 'foo',
                    queryName: 'bar',
                    viewName: '~~default~~',
                    data: {},
                },
            };

            // Bundled here so we can pass it as an object without having to construct it every render, this helps
            // with PureComponents.
            this.actions = {
                load: this.load,
                loadPage: this.loadPage,
                sort: this.sort,
                addFilter: this.addFilter,
            };
        }

        load = () => {
            console.log('load model');
        };

        loadPage = (pageNumber: number) => {
            console.log('loadPage', pageNumber)
        };

        sort = (column: any, direction: string) => {
            console.log('sort', column, direction);
        };

        addFilter = (filter: any) => {
            console.log('addFilter', filter);
        };

        render () {
            // queryConfig purposely unused, we don't want to pass it to consumers.
            const { queryConfig, ...props } = this.props;
            const { queryModel } = this.state;
            // If we don't first cast this to unknown then the compiler will bail on the cast to Props below. This is
            // probably a compiler bug, because if you make queryConfig an optional property (which we don't want to do)
            // then the compiler will not bail on the cast to Props below. By casting to unknown first we're telling
            // TypeScript to forget what it thinks it knows. We should not normally do this, but there is no other way
            // to get this to compile, despite it being correct.
            // There is an issue open on the TypeScript GitHub that is most likely the reason why we need to cast to
            // unknown: https://github.com/Microsoft/TypeScript/issues/28938
            const unknownProps = props as unknown;
            return <ComponentToWrap {...unknownProps as P} queryModel={queryModel} actions={this.actions} />;
        }
    }

    return ComponentWithQueryModel;
}
