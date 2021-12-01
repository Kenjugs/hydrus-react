import React, { MouseEvent, Suspense, useEffect, useRef, useState } from 'react';

import { Metadata } from '../api/hydrusClientApi';
import usePagination from '../hooks/usePagination';
const VideoViewer = React.lazy(() => import(/* webpackChunkName: "videoViewer" */ './videoViewer'));
const TagList = React.lazy(() => import(/* webpackChunkName: "tagList" */ './tagList'));
import hydrus from '../api/hydrusClientApi';

import './searchResults.css';

type SearchResultsProps = {
    results: SearchResult[],
    updateSearchFromTagList: (event: MouseEvent<HTMLAnchorElement>) => void,
};

export type SearchResult = {
    file_id?: number,
    metadata?: Metadata,
    thumbnail?: Blob,
};

const SearchResults = function(props: SearchResultsProps) {
    const [viewItem, setViewItem] = useState<SearchResult | null>(null);
    const [pageData, setPageData, pager, reset] = usePagination(props.results, 16);
    const results = useRef<SearchResult[]>(props.results);

    useEffect(() => {
        // if data set changes, go back to first page
        if (results.current !== props.results) {
            results.current = props.results;
            reset(props.results);
            setViewItem(null);
        }
        
        (function fetchThumbnails() {
            if (!pageData || !pageData[0] || pageData[0].thumbnail !== undefined) return;
    
            const calls = [];
    
            for (const result of pageData) {
                let file_id = null;
    
                if (result.metadata) {
                    file_id = result.metadata.file_id;
                } else {
                    throw new Error('result missing metadata object');
                }
    
                calls.push(
                    hydrus.get_thumbnail({ file_id: file_id })
                    .catch((reason) => {
                        console.error(reason.message);
                    })
                );
            }
    
            Promise.all(calls)
            .then((thumbnails) => {
                for (let i = 0; i < pageData.length; ++i) {
                    pageData[i].thumbnail = thumbnails[i] as Blob;
                }
                setPageData(pageData.slice());
            });
        })();
    }, [props.results, reset, pageData, setPageData]);

    const handleViewItemClick = function(event: MouseEvent<HTMLAnchorElement>, item: SearchResult) {
        event.preventDefault();
        setViewItem(item);
    }

    const handleCloseItemClick = function(event?: MouseEvent<HTMLAnchorElement>) {
        if (event) event.preventDefault();
        setViewItem(null);
    }

    const currentList = pageData.map((result) => {
        if (result.metadata === undefined) {
            return null;
        }
        
        return (
            <a
                key={result.metadata.file_id}
                className="thumbnail-container"
                href="#"
                onClick={(e) => handleViewItemClick(e, result)}
            >
                <img
                    className="thumbnail"
                    src={result.thumbnail ? URL.createObjectURL(result.thumbnail) : ''}
                />
            </a>
        );
    });

    let toRender = null;
    if (!viewItem) {
        toRender = (
            <div className="search-results">
                {currentList}
                {pager}
            </div>
        );
    } else if (viewItem && viewItem.metadata) {
        const tags = viewItem.metadata.service_names_to_statuses_to_display_tags['my tags'][0];
        toRender = (
            <Suspense fallback={null}>
                <div className="results-container">
                    <TagList
                        tagList={tags}
                        onTagClick={(e) => {
                            handleCloseItemClick();
                            props.updateSearchFromTagList(e);
                        }}
                    />
                    <VideoViewer
                        metadata={viewItem.metadata}
                        onCloseItemClick={(e) => handleCloseItemClick(e)}
                    />
                </div>
            </Suspense>
        );
    }

    return (
        <div>
            {toRender}
        </div>
    );
}

export default SearchResults;