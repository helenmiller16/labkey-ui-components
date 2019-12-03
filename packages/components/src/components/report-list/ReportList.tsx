/*
 * Copyright (c) 2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React from 'react';
import { Link } from 'react-router';
import { Image, Media, Modal, Panel } from 'react-bootstrap';
import { Set } from 'immutable';
import { PreviewGrid } from '../PreviewGrid';
import { Chart } from '../chart/Chart';
import { DataViewInfo, DataViewInfoTypes, IDataViewInfo } from '../../models';
import { LoadingSpinner } from '../base/LoadingSpinner';
import { SVGIcon } from '../base/SVGIcon';
import { SchemaQuery } from '../base/models/model';

const GRID_REPORTS = Set([DataViewInfoTypes.Query, DataViewInfoTypes.Dataset]);
const CHARTS = Set([
    DataViewInfoTypes.AutomaticPlot,
    DataViewInfoTypes.BarChart,
    DataViewInfoTypes.BoxAndWhiskerPlot,
    DataViewInfoTypes.PieChart,
    DataViewInfoTypes.XYScatterPlot,
    DataViewInfoTypes.XYSeriesLinePlot,
]);
const ICONS = {
    [DataViewInfoTypes.AutomaticPlot]: 'xy_line',
    [DataViewInfoTypes.BarChart]: 'bar_chart',
    [DataViewInfoTypes.BoxAndWhiskerPlot]: 'box_plot',
    [DataViewInfoTypes.Dataset]: 'custom_grid',
    [DataViewInfoTypes.PieChart]: 'pie_chart',
    [DataViewInfoTypes.Query]: 'custom_grid',
    [DataViewInfoTypes.SampleComparison]: 'sample_comparison',
    [DataViewInfoTypes.TimeChart]: 'xy_line',
    [DataViewInfoTypes.XYScatterPlot]: 'xy_scatter',
    [DataViewInfoTypes.XYSeriesLinePlot]: 'xy_line',
};

interface ReportConsumer {
    report: IDataViewInfo,
}

interface ReportItemModalProps extends ReportConsumer{
    onClose?(): void,
}

class ReportLinks extends React.PureComponent<ReportConsumer> {
    render() {
        const { runUrl, appUrl } = this.props.report;
        let appLink;

        if (appUrl) {
            appLink = <p><Link to={appUrl.toString()}>View in Biologics</Link></p>;
        }

        return (
            <div className="report-item__links">
                <p><a href={runUrl}>View in LabKey Server</a></p>
                {appLink}
            </div>
        );
    }
}

class ReportMetadata extends React.PureComponent<ReportConsumer> {
    render() {
        const { description, type, createdBy } = this.props.report;

        return (
            <div className="report-item__metadata">
                <div className="report-item__metadata-item">
                    <label>Created By:</label>
                    <span>{createdBy}</span>
                </div>

                <div className="report-item__metadata-item">
                    <label>Type:</label>
                    <span>{type}</span>
                </div>

                <div className="report-item__metadata-item">
                    <label>Description:</label>
                    <span>{description}</span>
                </div>
            </div>
        );
    }
}

class UnsupportedReportBody extends React.PureComponent<ReportConsumer> {
    render() {
        return (
            <Modal.Body>
                <div className="report-list__unsupported-preview">
                    <div className="alert alert-warning unsupported-alert">
                        <div className="unsupported-alert__icon">
                            <span className="fa fa-exclamation-circle"/>
                        </div>

                        <p className="unsupported-alert__message">
                            This report is not currently supported. It is recommended that you view the report in
                            LabKey Server.
                        </p>

                        <div className="unsupported-alert__view-link">
                            <a href={this.props.report.runUrl} className="btn btn-warning">View in LabKey</a>
                        </div>
                    </div>

                    <ReportMetadata report={this.props.report} />
                </div>
            </Modal.Body>
        );
    }
}

class GridReportBody extends React.PureComponent<ReportConsumer> {
    render () {
        const { schemaName, queryName, viewName, runUrl, appUrl } = this.props.report;
        const schemaQuery = SchemaQuery.create(schemaName, queryName, viewName);

        return (
            <Modal.Body>
                <div className="report-list__grid-preview">
                    <ReportLinks report={this.props.report} />

                    <PreviewGrid schemaQuery={schemaQuery} numCols={4} numRows={3} />

                    <ReportMetadata report={this.props.report} />
                </div>
            </Modal.Body>
        );
    }
}

class ChartReportBody extends React.PureComponent<ReportConsumer, any> {
    render() {
        return (
            <Modal.Body>
                <div className="report-list__chart-preview">
                    <ReportLinks report={this.props.report} />

                    <Chart chart={new DataViewInfo(this.props.report)} />

                    <ReportMetadata report={this.props.report} />
                </div>
            </Modal.Body>
        );
    }
}

export class ReportItemModal extends React.PureComponent<ReportItemModalProps> {
    render() {
        const { name, type } = this.props.report;
        const onClose = this.props.onClose;
        let BodyRenderer = UnsupportedReportBody;

        if (GRID_REPORTS.contains(type as DataViewInfoTypes)) {
            BodyRenderer = GridReportBody;
        } else if (CHARTS.contains(type as DataViewInfoTypes)) {
            BodyRenderer = ChartReportBody;
        }

        return (
            <div className="report-item-modal">
                <Modal show onHide={onClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>{name}</Modal.Title>
                    </Modal.Header>

                    <BodyRenderer report={this.props.report} />
                </Modal>
            </div>
        );
    }
}

interface ReportListItemProps {
    report: IDataViewInfo,
    onClick(IDataViewInfo): void,
}

export class ReportListItem extends React.PureComponent<ReportListItemProps> {
    onClick = () => this.props.onClick(this.props.report);

    onLinkClicked = (e) => {
        // We need to stop event propagation when clicking on a link or it will also trigger the onClick handler
        e.stopPropagation();
        return true;
    };

    render() {
        const { name, icon, iconCls, createdBy, type, runUrl, appUrl } = this.props.report;
        let nameEl = <a href={runUrl} onClick={this.onLinkClicked}>{name}</a>;

        if (appUrl) {
            nameEl = <Link to={appUrl.toString()} onClick={this.onLinkClicked}>{name}</Link>;
        }

        const iconSrc = ICONS[type];
        const iconClassName = "report-list-item__icon";
        const hasCustomIcon = icon.indexOf('reports-thumbnail.view') > -1;
        let iconEl = <Image className={iconClassName} src={icon} />;

        if (iconSrc !== undefined && !hasCustomIcon) {
            iconEl = <SVGIcon className={iconClassName} height={null} iconDir="_images" iconSrc={iconSrc}/>
        } else if (iconCls) {
            iconEl = <span className={`${iconClassName} ${iconCls} fa-4x`} />
        }

        let createdByEl;

        if (createdBy) {
            createdByEl = <p className="report-list-item__person">Created by: {createdBy}</p>;
        }

        return (
            <Media.ListItem className="report-list-item" onClick={this.onClick}>
                <Media.Left>
                    {iconEl}
                </Media.Left>

                <Media.Body>
                    <Media.Heading className="report-list-item__name">{nameEl}</Media.Heading>
                    {createdByEl}
                </Media.Body>
            </Media.ListItem>
        );
    }
}

export interface ReportListProps {
    loading: boolean,
    reports: Array<IDataViewInfo>,
    onReportClicked(report: IDataViewInfo): void,
}

export class ReportList extends React.PureComponent<ReportListProps> {
    render() {
        const { loading, reports, onReportClicked } = this.props;

        let body: any;

        if (loading) {
            body = (
                <div className="report-list__message">
                    <LoadingSpinner />
                </div>
            );
        } else if (reports.length === 0) {
            body = <div className="report-list__message">No reports.</div>;
        } else {
            const reportEls = reports.map((report: IDataViewInfo) => {
                return <ReportListItem key={report.runUrl} report={report} onClick={onReportClicked} />;
            });

            body = (
                <Media.List className="report-list__list">
                    {reportEls}
                </Media.List>
            );
        }

        return (
            <Panel>
                <div className="report-list">
                    {body}
                </div>
            </Panel>
        );
    }
}