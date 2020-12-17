import React, { ReactNode } from 'react';
import classNames from 'classnames';

import { ServerActivity, ServerActivityData } from './model';
import { formatDateTime, getDateTimeFormat, parseDate } from '../../util/Date';

interface Props {
    serverActivity: ServerActivity;
    onViewAll: () => void;
    maxRows: number;
    viewAllText: string;
    noActivityMsg: string;
    viewErrorDetailsText: string;
    onRead: (id: number) => void;
}

export class ServerActivityList extends React.PureComponent<Props> {
    static defaultProps = {
        maxRows: 8,
        viewAllText: 'View all activity',
        noActivityMsg: 'No notifications available.',
        viewErrorDetailsText: 'View error details',
    };

    markRead = (notificationId: number): void => {
        this.props.onRead(notificationId);
    };

    showErrorDetails = (notificationId: number): void => {
        console.log('showErrorDetails ' + notificationId + ': not yet implemented');
    };

    renderData(activity: ServerActivityData, key: number): ReactNode {
        const isUnread = activity.isUnread() && !activity.inProgress;
        return (
            <li key={key} className={isUnread ? 'is-unread' : undefined} onClick={isUnread ? () => this.markRead(activity.RowId) : undefined}>
                <i
                    className={classNames('fa', {
                        'fa-spinner fa-pulse': activity.inProgress,
                        'fa-exclamation-circle has-error': activity.hasError,
                        'fa-check-circle is-complete': !activity.inProgress && !activity.hasError,
                    })}
                />
                <span className={classNames('server-notification-message', {
                        'is-unread server-notifications-link': isUnread,
                    })}
                >
                    {activity.HtmlContent}
                </span>
                <br />
                {activity.hasError ? (
                    <span className="server-notifications-link" onClick={() => this.showErrorDetails(activity.RowId)}>
                        {this.props.viewErrorDetailsText}
                    </span>
                ) : (
                    <span className="server-notification-data" title={activity.CreatedBy}>
                        {activity.CreatedBy}
                    </span>
                )}
                <div className="pull-right server-notification-data">
                    {formatDateTime(parseDate(activity.Created, getDateTimeFormat()))}
                </div>
            </li>
        );
    }

    render(): ReactNode {
        const { serverActivity, onViewAll, maxRows, noActivityMsg, viewAllText } = this.props;

        if (!serverActivity || serverActivity.totalRows === 0) {
            return <div className="server-notifications-footer">{noActivityMsg}</div>;
        }

        return (
            <>
                <div className="server-notifications-listing-container">
                    <ul className="server-notifications-listing">
                        {serverActivity.data.slice(0, maxRows).map((data, index) => this.renderData(data, index))}
                    </ul>
                </div>
                {maxRows && serverActivity.totalRows > maxRows && (
                    <div className="server-notifications-footer server-notifications-link" onClick={onViewAll}>
                        {viewAllText}
                    </div>
                )}
            </>
        );
    }
}