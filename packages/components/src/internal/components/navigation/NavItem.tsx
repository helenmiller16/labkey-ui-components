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
import React, { FC, memo, useEffect, useRef, useState } from 'react';
import { Link, withRouter, WithRouterProps } from 'react-router';

import { AppURL } from '../../..';

interface NavItemProps {
    onActive?: (activeEl: HTMLElement) => void;
    to: string | AppURL;
}

const NavItemImpl: FC<NavItemProps & WithRouterProps> = memo(({ children, location, onActive, to }) => {
    const itemRef = useRef<HTMLLIElement>();
    const [active, setActive] = useState<boolean>(false);

    useEffect(() => {
        if (to && location) {
            const isActive = location.pathname.toLowerCase() === to.toString().toLowerCase();
            setActive(isActive);

            if (isActive) {
                onActive?.(itemRef.current);
            }
        } else {
            setActive(false);
        }
    }, [location, to]);

    return (
        <li className={active ? 'active' : null} ref={itemRef}>
            <Link to={to.toString()}>{children}</Link>
        </li>
    );
});

// Export as "default" to avoid erroneous type warning use of withRouter()
export default withRouter<NavItemProps>(NavItemImpl);

export const ParentNavItem: FC<NavItemProps> = memo(({ children, to }) => {
    return (
        <div className="parent-nav">
            <ul className="nav navbar-nav">
                <li>
                    <Link to={to.toString()}>
                        <i className="fa fa-chevron-left" />
                        &nbsp;
                        {children}
                    </Link>
                </li>
            </ul>
        </div>
    );
});
