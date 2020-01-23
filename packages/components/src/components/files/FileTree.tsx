
import * as React from 'react';
import { Treebeard, decorators } from 'react-treebeard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { Checkbox, Alert } from "react-bootstrap";
import { List } from "immutable";

const customStyle = {
    tree: {
        base: {
            listStyle: 'none',
            backgroundColor: 'white',
            margin: 0,
            padding: 0,
            color: '#777',
            fontFamily: 'lucida grande ,tahoma,verdana,arial,sans-serif',
            fontSize: '14px'
        },
        node: {
            base: {
                position: 'relative'
            },
            link: {
                cursor: 'pointer',
                position: 'relative',
                padding: '0px 5px',
                display: 'block'
            },
            activeLink: {
                background: 'white'
            },
            toggle: {
                base: {
                    position: 'relative',
                    display: 'inline-block',
                    verticalAlign: 'top',
                    marginLeft: '-5px',
                    height: '24px',
                    width: '24px'
                },
                wrapper: {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    margin: '-7px 0 0 -7px',
                    height: '14px'
                },
                height: 14,
                width: 14,
                arrow: {
                    fill: '#777',
                    strokeWidth: 0
                }
            },
            header: {
                base: {
                    display: 'inline-block',
                    verticalAlign: 'top',
                    color: '#777'
                },
                connector: {
                    width: '2px',
                    height: '12px',
                    borderLeft: 'solid 2px black',
                    borderBottom: 'solid 2px black',
                    position: 'absolute',
                    top: '0px',
                    left: '-21px'
                },
                title: {
                    lineHeight: '24px',
                    verticalAlign: 'middle'
                }
            },
            subtree: {
                listStyle: 'none',
                paddingLeft: '19px'
            },
            loading: {
                color: '#777'
            }
        }
    }
};

interface FileTreeProps {
    loadData: any,
    onFileSelect?: (name: string, path: string, checked: boolean, isDirectory: boolean) => any
}

interface FileTreeState {
    cursor: any,
    checked: List<string>
    data: any
    error?: string
}

export class FileTree extends React.Component<FileTreeProps, FileTreeState> {

    constructor(props) {
        super(props);

        this.state = {
            cursor: undefined,
            checked: List<string>(),
            data: [],
            error: undefined
        }
    }

    checkIdPrefix = 'filetree-check-';
    defaultRootPrefix = '|root';

    componentDidMount(): void {
        const { loadData } = this.props;

        loadData().then((data) => {
            let loadedData = data;

            // treebeard has bugs when there is not a single root node
            if (Array.isArray(data)) {
                loadedData = {
                    name: 'root',
                    id: '|root',  // Special id
                    children: data,
                    toggled: true
                }
            }

            if (!loadedData.id) {
                loadedData.id = loadedData.name;
            }

            this.setState(() => ({data: loadedData}))
        }).catch((reason: any) => {
            this.setState(() => ({error: reason}));
        })
    }

    Header = (props) => {
        const { style, onSelect, node, customStyles } = props;
        const { checked } = this.state;
        const iconType = node.children ? 'folder' : 'file-text';
        const iconStyle = {marginRight: '5px'};

        return (
            <span className={'filetree-checkbox-container' + (iconType === 'folder' ? '' : ' filetree-leaf-node')}>
                <Checkbox id={this.checkIdPrefix + node.id} checked={checked.contains(node.id)} onChange={this.handleCheckbox} onClick={this.checkClick}/>
                <div style={style.base} onClick={onSelect}>
                    <div style={node.selected ? {...style.title, ...customStyles.header.title} : style.title}>
                        {iconType === 'folder' ?
                            <FontAwesomeIcon icon={faFolder} className='filetree-folder-icon'/>
                            : <FontAwesomeIcon icon={faFileAlt} className='filetree-folder-icon'/>
                        }
                        {node.name}
                    </div>
                </div>
            </span>
        );
    };

    // Do not always want to toggle directories when clicking a check box
    checkClick = (evt) => {
        evt.stopPropagation();
    };

    getNodeIdFromId = (id: string) : string => {
        const parts = id.split(this.checkIdPrefix);
        if (parts.length === 2) {
            return parts[1];
        }

        return undefined;
    };

    getDataNode = (id: string, node: any) => {
        if (node.id === id)
            return node;

        if (node.children) {

            // First get which child is the correct descendant path
            let childPath = node.children.filter((child) => {
                return id.startsWith(child.id);
            });

            if (childPath && childPath.length > 0)
                return this.getDataNode(id, childPath[0])
        }

        return undefined;
    };

    getPathFromId = (id: string): string => {
        let path = id;

        // strip off default root id if exists
        if (path.startsWith(this.defaultRootPrefix)) {
            path = path.substring(0, this.defaultRootPrefix.length);
        }

        return path.replace('|', '\\');
    };

    getNameFromId = (id: string): string => {
        let parts = id.split('|');
        return parts[parts.length - 1];
    }

    // Callback to parent with actual path of selected file
    onFileSelect = (id: string, checked: boolean, isDirectory: boolean) => {
        const { onFileSelect } = this.props;

        if (onFileSelect) {
            onFileSelect(this.getNameFromId(id), this.getPathFromId(id), checked, isDirectory);
        }
    }

    setCheckedValue = (node: any, checked: boolean): void => {

        // Recurse through children if directory
        if (node.children) {
            node.children.forEach((child) => {
                this.setCheckedValue(child, checked);
            });
        }

        // Add or remove checked value from state
        if (checked) {
            this.setState((state) => ({checked: state.checked.push(node.id)}), () => this.onFileSelect(node.id, checked, !!node.children))
        } else {
            this.setState((state) => (
                    {
                        checked: state.checked.filter((check) => {
                            return check !== node.id;
                        }) as List<string>
                    }
                ), () => this.onFileSelect(node.id, checked, !!node.children)
            )
        }
    };

    cascadeToggle = ( node, callback: () => any ) => {

        const afterToggle = () => {
            if (node.children) {
                node.children.forEach(child => {
                    this.cascadeToggle(node, callback)
                })
            }
        };

        this.onToggle(node, true, afterToggle)
    };

    handleCheckbox = (evt) => {
        const { data } = this.state;
        const { checked } = evt.target;
        const id = this.getNodeIdFromId(evt.target.id);

        const node = this.getDataNode(id, data);
        if (node.children && checked) {
            // Toggle open selected directory and check the children
            const callback = () => {
                this.setCheckedValue(node, checked);
            };

            // this.cascadeToggle(node, callback)
            this.onToggle(node, true, callback);
        }
        this.setCheckedValue(node, checked);
    };

    onToggle = (node: any, toggled: boolean, callback?: () => any) => {
        const { cursor, data, checked } = this.state;
        const { loadData } = this.props;

        if (cursor) {
            node.active = false;
        }
        node.active = true;
        if (node.children) {
            node.toggled = toggled;

            // load data if not already loaded
            if (node.children.length === 0) {
                loadData(node.name).then((children) => {
                    children = children.map((child) => {
                        child.id = (node.id + "|" + child.name); // generate Id from path
                        return child;
                    });

                    node.children = children;  // This is not immutable so this is updating the data object
                    this.setState(() => ({cursor: node, data: Object.assign({}, data), error: undefined}), (callback ? callback() : undefined));
                }).catch((reason: any) => {
                        this.setState(() => ({error: reason}));
                })
            }
            else {
                this.setState(() => ({cursor: node, data: Object.assign({}, data), error: undefined}), (callback ? callback() : undefined));
            }
        }
    };

    render = () => {
        const { data, error } = this.state;
        const Header = this.Header;

        return (
            <div className='filetree-container'>
                {!!error ?
                    <Alert bsStyle='danger'>{error}</Alert>
                    :
                    <Treebeard data={data}
                               onToggle={this.onToggle}
                               decorators={{...decorators, Header}}
                               style={customStyle}
                    />
                }
            </div>
        )
    }

}
