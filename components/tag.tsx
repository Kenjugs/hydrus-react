import React, { MouseEvent } from 'react';

import './tag.css';

type TagProps = {
    value: string,
    onTagClick: (event: MouseEvent<HTMLAnchorElement>) => void,
};

const Tag = function(props: TagProps) {
    let className = 'tag';
    const splitVals = props.value.split(':');
    const type = splitVals[0];
    const isNamespaced = /^[^:]+:.+$/.test(props.value);
    let text = '';
    
    if (['character', 'creator', 'series'].includes(type)) {
        className += ` ${type}`;
        text = splitVals[1];
    } else if (isNamespaced) {
        className += ' namespaced';
        text = props.value;
    } else {
        text = splitVals[0];
    }

    return (
        <a
            className={className}
            onClick={(e) => props.onTagClick(e)}
            href="#"
        >
            {text}
        </a>
    );
}

export default Tag;