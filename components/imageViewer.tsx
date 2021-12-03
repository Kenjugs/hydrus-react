import React, { MouseEvent, useRef } from 'react';
import hydrus, { Metadata } from '../api/hydrusClientApi';
import './imageViewer.css';

type ImageViewerProps = {
    metadata: Metadata
    onCloseItemClick: (event: MouseEvent<HTMLAnchorElement>) => void
}

const ImageViewer = function(props: ImageViewerProps) {
    const imageRef = useRef<HTMLImageElement | null>(null);
    
    if (props.metadata === null) {
        return null;
    }

    const getImageData = function() {
        hydrus.getFile({ file_id: props.metadata.file_id })
        .then((image) => {
            if (imageRef.current) {
                imageRef.current.src = URL.createObjectURL(image);
            }
        })
        .catch((reason) => {
            console.error(reason.message);
        });
    }

    getImageData();

    return (
        <div className="image-container">
            <img
                ref={(node) => { imageRef.current = node }}
            />
            <a className="close-image-button" href="#" onClick={props.onCloseItemClick}></a>
        </div>
    );
}

export default ImageViewer;
