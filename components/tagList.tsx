import React, { MouseEvent } from 'react';
import Tag from './tag';
import './tagList.css';

type TagListProps = {
    tagList: string[]
    onTagClick: (event: MouseEvent<HTMLAnchorElement>) => void
};

const TagList = function(props: TagListProps) {
    const creators: JSX.Element[] = [];
    const series: JSX.Element[] = [];
    const characters: JSX.Element[] = [];
    const namespaced: JSX.Element[] = [];
    const general: JSX.Element[] = [];

    for (let idx = 0; idx < props.tagList.length; ++idx) {
        const tag = props.tagList[idx];
        const listItem = (
            <li key={idx}>
                <Tag
                    value={tag}
                    onTagClick={props.onTagClick}
                />
            </li>
        );
        
        if (tag.startsWith('character')) {
            characters.push(listItem);
        } else if (tag.startsWith('creator')) {
            creators.push(listItem);
        } else if (tag.startsWith('series')) {
            series.push(listItem);
        } else if (/^[^:]+:.+$/.test(tag)) {
            namespaced.push(listItem);
        } else {
            general.push(listItem);
        }
    }
    
    return (
        <div className="tag-list">
            <div>
                <label>Creators</label>
                <ul>
                    {creators}
                </ul>
            </div>
            <div>
                <label>Series</label>
                <ul>
                    {series}
                </ul>
            </div>
            <div>
                <label>Characters</label>
                <ul>
                    {characters}
                </ul>
            </div>
            <div>
                <label>Namespaces</label>
                <ul>
                    {namespaced}
                </ul>
            </div>
            <div>
                <label>General</label>
                <ul>
                    {general}
                </ul>
            </div>
        </div>
    );
};

export default TagList;