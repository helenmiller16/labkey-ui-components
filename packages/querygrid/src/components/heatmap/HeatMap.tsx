/*
 * Copyright (c) 2016-2018 LabKey Corporation. All rights reserved. No portion of this work may be reproduced in
 * any form or by any electronic or mechanical means without written permission from LabKey Corporation.
 */
import * as React from 'react'
import { Link } from 'react-router'
import { fromJS, List, Map } from 'immutable'
import { AppURL, LoadingSpinner, naturalSort, QueryGridModel, SchemaQuery } from '@glass/base'

import { HeatMapDisplay } from './HeatMapDisplay'
import { addDateRangeFilter, last12Months, monthSort } from './utils'
import { gridInit } from "../../actions";
import { getStateQueryGridModel } from "../../models";
import { getQueryGridModel } from "../../global";

export interface HeatMapProps {
    schemaQuery: SchemaQuery
    nounSingular: string
    nounPlural: string
    yAxis: string
    xAxis: string
    measure: string
    yInRangeTotal?: string // property name in 'cell' containing the in-range total amount (not the complete total)
    yTotalLabel?: string
    getCellUrl: (protocolName: string, providerName: string) => AppURL
    getHeaderUrl: (cell: any) => AppURL
    getTotalUrl: (cell: any) => AppURL
    headerClickUrl: AppURL
    emptyDisplay?: any
    navigate?: (url: AppURL) => any
}

export class HeatMap extends React.Component<HeatMapProps, any> {

    componentDidMount() {
        this.initModel();
    }

    componentWillReceiveProps(nextProps: HeatMapProps) {
        this.initModel();
    }

    initModel() {
        const model = this.getQueryGridModel();
        gridInit(model, true, this);
    }

    getQueryGridModel(): QueryGridModel {
        const model = getStateQueryGridModel('heatmap', this.props.schemaQuery, {allowSelection: false});
        return getQueryGridModel(model.getId()) || model;
    }

    _prepareHeatMapData(data): List<Map<string, any>> {
        const { getCellUrl } = this.props;

        // expected pivot column names
        let months = last12Months();
        let pivotColumns  = months.reverse();

        return data
            .sortBy(row => row.getIn(['Protocol', 'displayValue'], naturalSort))
            .map((row: Map<string, any>) => {
            const protocolName = row.getIn(['Protocol', 'displayValue']),
                providerName = row.getIn(['Provider', 'value']),
                completeTotal = row.getIn(['CompleteCount', 'value']),
                inRangeTotal = row.getIn(['InRangeCount', 'value']);

            let url;
            if (protocolName) {
                url = getCellUrl(protocolName, providerName);
            }

            // create cells for the last 12 months including values for which there is no data
            let cells = [];
            for (let i = 0; i < pivotColumns.length; i++) {
                let pivotCol = pivotColumns[i];
                const pivotColName = pivotCol.yearMonth + '::MonthCount';

                // Get the count for the year-month.
                // The pivot column will not be present if no <Protocol>s have run count for that month.
                // The pivot column value will be null if this <Protocol> has no runs, but others do.
                let monthTotal = 0;
                if (row.hasIn([pivotColName, 'value']))
                    monthTotal = row.getIn([pivotColName, 'value']) || 0;

                cells.push(Map({
                    monthName: pivotCol.monthName,
                    monthNum: pivotCol.month,
                    yearNum: pivotCol.year,
                    title: pivotCol.displayValue,
                    providerName,
                    protocolName,
                    monthTotal,
                    completeTotal,
                    inRangeTotal,
                    url
                }));
            }

            return List(cells);

        }).flatten(true);
    }

    _prepareYAxisColumns(heatMapData) {
        const { getHeaderUrl, getTotalUrl } = this.props;
        let yAxisColumnsMap = Map<string, any>().asMutable();

        heatMapData.map((cell: any) => {
            // error check for empty cells or cells without protocols
            if (cell && cell.has('protocolName')) {
                let cellData = fromJS({
                    name: cell.get('protocolName'),
                    renderYCell: this.renderYCell,
                    completeTotal: cell.get('completeTotal'),
                    inRangeTotal: cell.get('inRangeTotal'),
                    headerUrl: getHeaderUrl(cell),
                    totalUrl: getTotalUrl(cell)
                });

                yAxisColumnsMap.set(cell.get('protocolName'), cellData);
            }
        });

        return yAxisColumnsMap.asImmutable();
    }

    renderYCell = (cell) => {
        const url = cell.get('headerUrl');
        const name = cell.get('name') ? cell.get('name') : '<Name not provided>';

        if (url) {
            return <Link to={url.toString()}>{name}</Link>
        }

        return <span>{name}</span>
    };
    
    renderYTotalCell = (cell: Map<string, any>) => {
        const { nounPlural } = this.props;
        let inRangeTotal = cell.get('inRangeTotal'),
            completeTotal = cell.get('completeTotal'),
            url = cell.get('totalUrl');

        if (url) {
            const now = new Date();
            const dateEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            const dateBegin = new Date(dateEnd.getFullYear() - 1, dateEnd.getMonth() + 1, 1);
            const dateUrl = addDateRangeFilter(url, 'Created', dateBegin, dateEnd);

            if (inRangeTotal === completeTotal) {
                return (
                    <span title={"All " + completeTotal + " " + nounPlural + " created in last 12 months"}>
                        <Link to={dateUrl.toString()}>{inRangeTotal}</Link>
                    </span>
                );
            }

            return (
                <span title={inRangeTotal + " of " + completeTotal + " total " + nounPlural + " created in last 12 months"}>
                    <Link to={dateUrl.toString()}>{inRangeTotal}</Link> / <Link to={url.toString()}>{completeTotal}</Link>
                </span>
            );
        }

        return inRangeTotal + " / " + completeTotal;
    };

    onCellClick = (cell: Map<string, any>) => {
        const { navigate } = this.props;

        // only allow click through on cells with a monthTotal
        if (navigate && cell.get('monthTotal') && cell.get('url')) {
            const dateBegin = new Date([
                cell.get('monthNum'),
                1,
                cell.get('yearNum')
            ].join('/'));
            const dateEnd = new Date(dateBegin.getFullYear(), dateBegin.getMonth() + 1, 0);

            const dateUrl = addDateRangeFilter(cell.get('url'), 'Created', dateBegin, dateEnd);
            navigate(dateUrl);
        }
    };

    onHeaderClick = (headerText: string, data: List<Map<string, any>>) => {
        const { navigate, headerClickUrl } = this.props;
        const anyCell = data.filter(d => d.get('monthName') === headerText).first();

        if (navigate && anyCell) {
            const dateBegin = new Date([
                anyCell.get('monthNum'),
                1,
                anyCell.get('yearNum')
            ].join('/'));
            const dateEnd = new Date(dateBegin.getFullYear(), dateBegin.getMonth() + 1, 0);

            const dateUrl = addDateRangeFilter(headerClickUrl, 'Created', dateBegin, dateEnd);
            navigate(dateUrl);
        }
    };

    render() {
        const model = this.getQueryGridModel();

        if (!model || !model.isLoaded) {
            return <LoadingSpinner/>
        }

        const heatMapData = this._prepareHeatMapData(model.getData());

        return <HeatMapDisplay
            {...this.props}
            data={heatMapData}
            yAxisColumns={this._prepareYAxisColumns(heatMapData)}
            xSort={monthSort.bind(this)}
            yTotalCellRenderer={this.renderYTotalCell}
            onCellClick={this.onCellClick}
            onHeaderClick={this.onHeaderClick}
        />;
    }
}