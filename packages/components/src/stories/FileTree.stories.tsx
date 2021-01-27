import { storiesOf } from '@storybook/react';
import { withKnobs, boolean } from '@storybook/addon-knobs';

import React from 'react';

import { FileTree } from '..';
import { fetchFileTestTree } from '../internal/components/files/FileTreeTest';
import './FileTree.scss';

storiesOf('FileTree', module)
    .addDecorator(withKnobs)
    .add('With basic data, and checkboxes', () => (
        <div>
            <FileTree
                allowMultiSelect={true}
                useFileIconCls={boolean('useFileIconCls', true)}
                loadData={fetchFileTestTree}
                onFileSelect={(name: string, path: string, checked: boolean, isDirectory: boolean, node: any) => {
                    console.log(path, checked);
                    return true;
                }}
            />
        </div>
    ))
    .add('With basic data, without checkboxes', () => (
        <div>
            <FileTree
                allowMultiSelect={false}
                useFileIconCls={boolean('useFileIconCls', true)}
                loadData={fetchFileTestTree}
                onFileSelect={(name: string, path: string, checked: boolean, isDirectory: boolean, node: any) => {
                    console.log(path, checked);
                    return true;
                }}
            />
        </div>
    ));
