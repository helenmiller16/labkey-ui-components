import React, { PureComponent, ReactNode } from 'react';
import { MenuItem, OverlayTrigger, Popover } from 'react-bootstrap';

import {
    getImportItemsForAssayDefinitions,
    InjectedAssayModel,
    ISubItem,
    SubMenuItem,
    SubMenuItemProps,
    QueryGridModel,
    withAssayModels,
} from '../../..';
import { MAX_EDITABLE_GRID_ROWS } from '../../constants';

interface Props extends SubMenuItemProps {
    isLoaded?: boolean;
    model?: QueryGridModel;
    requireSelection: boolean;
    nounPlural?: string;
    providerType?: string;
}

// exported for jest testing
export class AssayImportSubMenuItemImpl extends PureComponent<Props & InjectedAssayModel> {
    static defaultProps = {
        isLoaded: true,
        nounPlural: 'items',
        text: 'Upload Assay Data',
    };

    getItems = (): ISubItem[] => {
        const { assayModel, model, providerType } = this.props;

        return getImportItemsForAssayDefinitions(assayModel, model, providerType).reduce((subItems, href, assay) => {
            subItems.push({
                text: assay.name,
                href,
            });
            return subItems;
        }, []);
    };

    render(): ReactNode {
        const { isLoaded, model, requireSelection, nounPlural } = this.props;

        if (!isLoaded) {
            return (
                <MenuItem disabled={true}>
                    <span className="fa fa-spinner fa-pulse" /> Loading assays...
                </MenuItem>
            );
        }

        const items = this.getItems();

        // only display menu if valid items are available
        if (items.length) {
            const selectedCount = model ? model.selectedIds.size : -1;
            const overlayMessage =
                requireSelection && selectedCount === 0
                    ? 'Select one or more ' + nounPlural + '.'
                    : selectedCount > MAX_EDITABLE_GRID_ROWS
                    ? 'At most ' + MAX_EDITABLE_GRID_ROWS + ' ' + nounPlural + ' can be selected.'
                    : '';
            const menuProps: Props = Object.assign({}, this.props, {
                disabled: overlayMessage.length > 0,
                items,
            });

            delete menuProps.model;

            if (menuProps.disabled) {
                const overlay = <Popover id="assay-submenu-warning">{overlayMessage}</Popover>;

                return (
                    <OverlayTrigger overlay={overlay} placement="right">
                        <MenuItem disabled={true}>{menuProps.text}</MenuItem>
                    </OverlayTrigger>
                );
            }

            return <SubMenuItem {...menuProps} />;
        }

        return null;
    }
}

export const AssayImportSubMenuItem = withAssayModels<Props>(AssayImportSubMenuItemImpl);
