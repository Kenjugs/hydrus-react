import React, { ChangeEvent, FormEvent } from 'react';
import './tagSearch.css';

type TagSearchProps = {
    value: string
    onFormSubmit: (event: FormEvent<HTMLFormElement>) => void
    onInputValueChange: (event: ChangeEvent<HTMLInputElement>) => void
};

const TagSearch = function(props: TagSearchProps) {
    return (
        <form onSubmit={(e) => props.onFormSubmit(e)}>
            <div className="search-bar-container">
                <input
                    type="search"
                    className="search-bar"
                    placeholder="search tags (e.g.: bunny_ears)"
                    value={props.value}
                    onChange={(e) => props.onInputValueChange(e)}
                />
            </div>
        </form>
    );
}

export default TagSearch;