import React, { Suspense, MouseEvent, FormEvent, ChangeEvent, useState, useRef } from 'react';
import ReactDOM from 'react-dom';

import hydrus, { SearchFilesResponse, ApiVersionResponse, FileMetadataResponse } from '../api/hydrusClientApi';
import { SearchResult } from '../components/searchResults';
const TagSearch = React.lazy(() => import(/* webpackChunkName: "tagSearch" */ '../components/tagSearch'));
const SearchResults = React.lazy(() => import(/* webpackChunkName: "searchResults" */ '../components/searchResults'));

import './index.css';

// TODO Kenjugs(2021/11/05): Add a button to request a new client api access key from hydrus if it's not set already
// TODO Kenjugs(2021/11/05): As an addendum to the above, also need a way to store the key once it's been requested
// so the user doesn't have to request a new key every time they try to run this app locally
// TODO Kenjugs(2021/11/05): Possibly look into how the session key works and if it can replace the access key

const App = function() {
    const [apiVersion, setApiVersion] = useState(0);
    const [hydrusVersion, setHydrusVersion] = useState(0);
    const [searchValue, setSearchValue] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const lastSubmit = useRef<string[]>([]);
    
    const setApiVersionFromResponse = function(response: ApiVersionResponse) {
        setApiVersion(response.version);
        setHydrusVersion(response.hydrus_version);
    }

    hydrus.getApiVersion()
    .then(setApiVersionFromResponse)
    .catch((reason) => {
        console.error(reason.message);
    });

    const addMetadataToResults = function(results: SearchResult[], response: FileMetadataResponse) {
        for (let i = 0; i < response.metadata.length; ++i) {
            const metadata = response.metadata[i];
            let result = null;
            
            if (results[i].file_id === metadata.file_id) {
                result = results[i];
            } else {
                result = results.filter((val) => val.file_id === metadata.file_id)[0];
            }

            if (result) {
                result.metadata = metadata;
                delete result.file_id;
            }
        }
    }

    const handleSearchResponse = function(response: SearchFilesResponse) {
        const results: SearchResult[] = [];

        for (const file_id of response.file_ids) {
            results.push({
                file_id: file_id,
                metadata: undefined,
                thumbnail: undefined,
            });
        }

        hydrus.getFileMetadata({ file_ids: response.file_ids })
        .then((response) => {
            addMetadataToResults(results, response);
            setSearchResults(results.slice());
        })
        .catch((reason) => {
            console.error(reason.message);
        });
    }

    const handleFormSubmit = function(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const tags = searchValue.split(' ');
        searchTags(tags);
    }

    const isSameSearch = function(tags: string[]): boolean {
        if (lastSubmit.current.length !== tags.length) {
            return false;
        }
        
        lastSubmit.current.sort();
        tags.sort();

        for (let i = 0; i < lastSubmit.current.length; ++i) {
            if (lastSubmit.current[i] !== tags[i]) {
                return false;
            }
        }

        return true;
    }

    const searchTags = function(tags: string[]) {
        if (isSameSearch(tags)) {
            lastSubmit.current = tags;
            return;
        }

        lastSubmit.current = tags;
        
        hydrus.getSearchFiles({ tags: tags })
        .then(handleSearchResponse)
        .catch((reason) => {
            console.error(reason.message);
        });
    }

    const handleInputValueChange = function(event: ChangeEvent<HTMLInputElement>) {
        setSearchValue(event.target.value);
    }

    const handleUpdateSearchFromTagList = function(event: MouseEvent<HTMLAnchorElement>) {
        event.preventDefault();
        const tags = ((event.target) as HTMLAnchorElement).innerText;
        searchTags(tags.split(' '));
        setSearchValue(tags);
    }

    let element = null;

    if (searchResults.length > 0) {
        element = (
            <Suspense fallback={null}>
                <SearchResults
                    results={searchResults}
                    updateSearchFromTagList={(e) => handleUpdateSearchFromTagList(e)}
                />
            </Suspense>
        );
    }

    return (
        <div>
            <div>
                <label>API ver: {apiVersion}</label>&nbsp;
                <label>Hydrus ver: {hydrusVersion}</label>
            </div>
            <Suspense fallback={null}>
                <TagSearch
                    value={searchValue}
                    onFormSubmit={(e) => handleFormSubmit(e)}
                    onInputValueChange={(e) => handleInputValueChange(e)}
                />
            </Suspense>
            {element}
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));

export default App;