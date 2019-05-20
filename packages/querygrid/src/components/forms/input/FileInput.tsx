import * as React from 'react';
import { RefObject } from 'react';
import classNames from 'classnames';
import { LabelOverlay } from "../LabelOverlay";
import { cancelEvent } from "../../../events";

interface FileInputState {
    isHover: boolean,
    file?: File,
    error: string,
}

// TODO: fix props types to be anything other than any.
export class FileInput extends React.Component<any, FileInputState> {
    fileInput: RefObject<HTMLInputElement>;

    static defaultProps = {
        changeDebounceInterval: 0,
        elementWrapperClassName: 'col-sm-9',
        labelClassName: 'control-label text-left',
        showLabel: true,
    };

    constructor(props) {
        super(props);
        this.processFiles = this.processFiles.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onDrag = this.onDrag.bind(this);
        this.onDragLeave = this.onDragLeave.bind(this);
        this.onDrop = this.onDrop.bind(this);
        this.onRemove = this.onRemove.bind(this);
        this.fileInput = React.createRef<HTMLInputElement>();
        this.state = {
            isHover: false,
            file: null,
            error: '',
        }
    }

    processFiles(fileList: FileList, transferItems?: DataTransferItemList) {
        const {
            onChange,
            queryColumn,
        } = this.props;
        const name = this.props.name ? this.props.name : queryColumn.name;

        if (fileList.length > 1) {
            this.setState({error: 'Only one file allowed'});
            return;
        }

        const file = fileList[0];

        if (transferItems && transferItems[0].webkitGetAsEntry().isDirectory) {
            this.setState({error: 'Folders are not supported, only one file allowed'});
            return;
        }

        this.setState({file, error: ''});
        onChange({[name]: file});
    }

    onChange(event: React.FormEvent<HTMLInputElement>) {
        cancelEvent(event);
        this.processFiles(this.fileInput.current.files);
    }

    onDrag(event:React.DragEvent<HTMLElement>) {
        cancelEvent(event);

        if (!this.state.isHover) {
            this.setState({isHover: true});
        }
    }

    onDragLeave(event:React.DragEvent<HTMLElement>) {
        cancelEvent(event);

        if (this.state.isHover) {
            this.setState({isHover: false});
        }
    }

    onDrop(event: React.DragEvent<HTMLElement>) {
        cancelEvent(event);

        if (event.dataTransfer && event.dataTransfer.files) {
            this.processFiles(event.dataTransfer.files, event.dataTransfer.items);
            this.setState({isHover: false});
        }
    }

    onRemove() {
        const {
            onChange,
            queryColumn,
        } = this.props;
        const name = this.props.name ? this.props.name : queryColumn.name;

        this.setState({file: null});
        onChange({[name]: null});
    }

    render() {
        const {
            queryColumn,
        } = this.props;
        const {
            isHover,
            file,
        } = this.state;

        const name = this.props.name ? this.props.name : queryColumn.name;
        const inputId = `${name}-fileUpload`;
        let body;

        if (file === null) {
            const labelClassName = classNames("file-upload--compact-label", {'file-upload--is-hover': isHover});
            body = (
                <>
                    <input
                        type="file"
                        className="file-upload--input" // This class makes the file input hidden
                        name={name}
                        id={inputId}
                        multiple={false}
                        onChange={this.onChange}
                        ref={this.fileInput}
                    />

                    {/* We render a label here so click and drag events propagate to the input above */}
                    <label
                        className={labelClassName}
                        htmlFor={inputId}
                        onDrop={this.onDrop}
                        onDragEnter={this.onDrag}
                        onDragOver={this.onDrag}
                        onDragLeave={this.onDragLeave}
                    >
                        <i className="fa fa-cloud-upload" aria-hidden="true"/>
                        &nbsp;
                        <span>Select file or drag and drop here</span>
                        <span className="file-upload--error-message">{this.state.error}</span>
                    </label>
                </>
            );
        } else {
            const attachedFileClass = classNames("attached-file--inline-container", {'file-upload--is-hover': isHover});
            body = (
                <div className={attachedFileClass}
                     onDrop={this.onDrop}
                     onDragEnter={this.onDrag}
                     onDragOver={this.onDrag}
                     onDragLeave={this.onDragLeave}
                >
                    <span className="fa fa-times-circle attached-file--remove-icon" onClick={this.onRemove}/>
                    <span className="fa fa-file-text attached-file--icon" />
                    <span>{file.name}</span>
                    <span className="file-upload--error-message">{this.state.error}</span>
                </div>
            );
        }

        return (
            <div className="form-group row">
                <LabelOverlay column={queryColumn} isFormsy={false} inputId={inputId}/>
                <div className="col-sm-9">
                    {body}
                </div>
            </div>
        );
    }
}