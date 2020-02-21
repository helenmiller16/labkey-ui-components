import React, { ComponentType, PureComponent } from 'react';
import { DefaultQueryModelLoader, QueryConfig, QueryModel, QueryModelLoader } from './QueryModel';
import { DeepReadonly } from './DeepReadonly';

export interface QueryModelActions {
    // Not the final design, for illustration purposes only.
    load: () => void;
    loadPage: (pageNumber: number) => void;
    sort: (column: any, direction: string) => void;
    addFilter: (filter: any) => void;
}

export interface InjectedQueryModelProps {
    // Probably the final design
    queryModel: DeepReadonly<QueryModel>;
    actions: Readonly<QueryModelActions>;
}

export interface MakeQueryModelProps {
    // Probably the final design
    queryConfig: QueryConfig;
    modelLoader?: QueryModelLoader;
}

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

export function withQueryModel<Props>(ComponentToWrap: ComponentType<Props & InjectedQueryModelProps>): ComponentType<Props & MakeQueryModelProps> {
    // The components we're wrapping should extend InjectedQueryModelProps so they can receive a QueryModel and Actions
    // object. The wrapped component won't expect a QueryModel or Actions object as props, instead it will only expect a
    // QueryConfig, which is converted into a QueryModel and Actions object by withQueryModel. So in effect:
    // MyComponent<Props & InjectedQueryModelProps> becomes MyComponent<Props & MakeQueryModelProps>

    class ComponentWithQueryModel extends PureComponent<Props & MakeQueryModelProps, QueryModelState> {
        actions: QueryModelActions;
        // Note: the default props are not actually empty! They get overridden below the class definition. This is due
        // to a bug in TypeScript, if we were to actually define defaultProps here this code will not compile. By
        // setting defaultProps outside the class definition it does compile. We have to add an empty definition here
        // because if we don't then the attribute doesn't exist on the class, so it won't compile if we try to add it
        // outside of the class definition.
        static defaultProps = {};

        constructor(props: Props & MakeQueryModelProps) {
            super(props);

            this.state = {
                queryModel: {
                    ...props.queryConfig,
                    data: null,
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
            // queryConfig & modelLoader purposely unused, we don't want to pass them to consumers.
            const { queryConfig, modelLoader, ...props } = this.props;
            const { queryModel } = this.state;
            return <ComponentToWrap {...props as Props} queryModel={queryModel} actions={this.actions} extra={3} />;
        }
    }

    // If we override default props here then it compiles. If we define it above it does not compile. TypeScript cannot
    // handle Partial<T & U> where T is a generic and U is known, even if you're only setting attributes from U. In this
    // case defaultProps is Partial<Props & MakeQueryModelProps>.
    // https://stackoverflow.com/questions/59279796/typescript-partial-of-a-generic-type
    ComponentWithQueryModel.defaultProps = {
        modelLoader: DefaultQueryModelLoader,
    };

    return ComponentWithQueryModel;
}
