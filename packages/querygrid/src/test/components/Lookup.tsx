import * as React from "react";
import { List } from "immutable";
import { Container, SchemaDetails } from "@glass/base";

import { ILookupContext, LookupContextProvider } from "../../components/domainproperties/Lookup/Context";
import { processContainers, processQueries, handleSchemas } from "../../components/domainproperties/actions";
import { QueryInfoLite } from "../../components/domainproperties/models";

import containerData from "../data/project-getContainers.json";
import queryData from "../data/query-getQueries.json";
import schemaData from "../data/query-getSchemas.json";

export class MockLookupProvider extends React.Component<any, ILookupContext> {

    constructor(props) {
        super(props);

        this.state = {
            activeContainer: new Container({
                id: 'e0ea3e55-3420-1035-8057-68fea9bfb3a0',
                name: 'My Study',
                path: '/StudyVerifyProject/My Study'
            }),
            fetchContainers: () => Promise.resolve<List<Container>>(processContainers(containerData)),
            fetchQueries: (containerPath: string, schemaName: string) => {
                const data = queryData.queriesBySchema[schemaName];
                return Promise.resolve<List<QueryInfoLite>>(processQueries(data));
            },
            fetchSchemas: (containerPath: string) => {
                const path = containerPath ? containerPath : this.state.activeContainer.path;
                const data = schemaData.schemasByContainerPath[path];
                return Promise.resolve<List<SchemaDetails>>(handleSchemas(data));
            }
        };
    }

    render() {
        return (
            <LookupContextProvider value={this.state}>
                {this.props.children}
            </LookupContextProvider>
        )
    }
}