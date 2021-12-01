/*
================================================================================
access management
================================================================================
    GET/api_version (done)
    GET/request_new_permissions
    GET/session_key
    GET/verify_access_key
    GET/get_services

================================================================================
adding files
================================================================================
    POST/add_files/add_file
    POST/add_files/delete_files
    POST/add_files/undelete_files
    POST/add_files/archive_files
    POST/add_files/unarchive_files

================================================================================
adding tags
================================================================================
    GET/add_tags/clean_tags
    GET/add_tags/get_tag_services (legacy)
    POST/add_tags/add_tags

================================================================================
adding urls
================================================================================
    GET/add_urls/get_url_files
    GET/add_urls/get_url_info
    POST/add_urls/add_url
    POST/add_urls/associate_url

================================================================================
managing cookies and http headers
================================================================================
    GET/manage_cookies/get_cookies
    POST/manage_cookies/set_cookies
    POST/manage_headers/set_user_agent

================================================================================
managing pages
================================================================================
    GET/manage_pages/get_pages
    GET/manage_pages/get_page_info
    POST/manage_pages/add_files
    POST/manage_pages/focus_page

================================================================================
searching and fetching files
================================================================================
    GET/get_files/search_files (done)
    GET/get_files/file_metadata (done)
    GET/get_files/file (done)
    GET/get_files/thumbnail (done)

================================================================================
managing the database
================================================================================
    POST/manage_database/lock_on
    POST/manage_database/lock_off
*/

// const FILE_SORT_TYPE = {
//     FILE_SIZE: 0,
//     DURATION: 1,
//     IMPORT_TIME: 2,
//     FILETYPE: 3,
//     RANDOM: 4,
//     WIDTH: 5,
//     HEIGHT: 6,
//     RATIO: 7,
//     NUMBER_OF_PIXELS: 8,
//     NUMBER_OF_TAGS: 9,
//     NUMBER_OF_VIEWS: 10,
//     TOTAL_MEDIA_VIEWTIME: 11,
//     APPROXIMATE_BITRATE: 12,
//     HAS_AUDIO: 13,
//     MODIFIED_TIME: 14,
//     FRAMERATE: 15,
//     NUMBER_OF_FRAMES: 16,
// };

import configuration from './hydrusClientApi.config';

type BuildCallOptions = {
    queryParams?: Record<string, unknown>,
    responseType?: XMLHttpRequestResponseType,
    range?: { start: number, end: number },
}

export type ApiVersionResponse = {
    hydrus_version: number,
    version: number,
};

export type SearchFilesResponse = {
    file_ids: number[],
};

export type RequestNewPermissionsResponse = {
    access_key: string,
};

/**
 * - **service_names_to_statuses_to_display_tags** - contains merged sibling tags and is what is displayed on the client (should use for display purposes)
 * - **service_names_to_statuses_to_tags** - contains original tags without any sibling tag merging
 *   - 0 = current, 1 = pending, 2 = deleted, 3 = petitioned
 */
export type Metadata = {
    duration: number,
    ext: string,
    file_id: number,
    hasAudio: boolean,
    hash: string,
    height: number,
    is_inbox: boolean,
    is_local: boolean,
    is_trashed: boolean,
    known_urls: string[],
    mime: string,
    num_frames: number,
    num_words: number,
    service_names_to_statuses_to_display_tags: { [service_name: string]: { 0: string[], 1: string[], 2: string[], 3: string[] }},
    service_names_to_statuses_to_tags: { [service_name: string]: { 0: string[], 1: string[], 2: string[], 3: string[] }},
    size: number,
    width: number,
};

export type FileMetadataResponse = {
    metadata: Metadata[],
};

class HydrusClient {
    constructor(public config: { key: string, url: string }) { }

    private createQueryParamString(queryParams: Record<string, string>) {
        const usp = new URLSearchParams(queryParams);
        return usp.toString();
    }

    private getOptionsXhrRequestType(options?: BuildCallOptions): XMLHttpRequestResponseType {
        if (options && options.responseType) {
            return options.responseType;
        }
        return 'json';
    }

    private getOptionsXhrRangeHeader(range: { start: number, end?: number }): string {
        let header = `bytes=${range.start}-`;
        if (range.end) {
            header += range.end.toString();
        }
        return header;
    }

    private createRequestCallback(method: string, endpoint: string, options?: BuildCallOptions) {
        let queryString = '?';

        if (options && options.queryParams) {
            queryString += this.createQueryParamString(options.queryParams as Record<string, string>);
        }

        const createAndSendXhr = <T>(resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: object) => void) => {
            const xhr = new XMLHttpRequest();
            xhr.responseType = this.getOptionsXhrRequestType(options);
            xhr.open(method, this.config.url + endpoint + queryString);
            
            if (this.config.key !== '') {
                xhr.setRequestHeader('Hydrus-Client-API-Access-Key', this.config.key);
            }

            if (options && options.range) {
                xhr.setRequestHeader('Range', this.getOptionsXhrRangeHeader(options.range));
            }

            xhr.onreadystatechange = () => {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    // 200=OK response code
                    // 206=PARTIAL response code
                    if (xhr.status === 200 || xhr.status === 206) {
                        resolve(xhr.response);
                    } else {
                        reject({
                            status: xhr.status,
                            statusText: xhr.statusText,
                            message: xhr.statusText,
                        });
                    }
                }
            };

            xhr.onerror = () => {
                reject({
                    message: `** ${endpoint}: A network error occurred during transaction.`,
                });
            };

            xhr.send();
        };
        return createAndSendXhr;
    }
    
    private create_request<T>(method: string, endpoint: string, options?: BuildCallOptions): Promise<T> {
        return new Promise(this.createRequestCallback(method, endpoint, options));
    }

    api_version(): Promise<ApiVersionResponse> {
        return this.create_request('GET', 'api_version');
    }

    search_files(actions: {tags: string[]}): Promise<SearchFilesResponse> {
        const options: BuildCallOptions = {};

        if (actions.tags === undefined) {
            actions.tags = [];
        }
        
        options.queryParams = { tags: JSON.stringify(actions.tags) };
        
        return this.create_request('GET', 'get_files/search_files', options);
    }

    get_file(actions: { file_id?: number, hash?: string }): Promise<Blob> {
        const options: BuildCallOptions = {};

        if (actions.file_id === undefined && actions.hash === undefined) {
            console.error('** get_file: An error has occurred. Missing file_id or file hash.');
        } else if (actions.file_id && actions.hash) {
            delete actions.hash;
        }

        options.responseType = 'blob';
        
        if (actions.hash) {
            options.queryParams = { hash: actions.hash };
        } else {
            options.queryParams = { file_id: actions.file_id };
        }

        return this.create_request('GET', 'get_files/file', options);
    }

    get_thumbnail(actions: { file_id?: number, hash?: string }): Promise<Blob> {
        const options: BuildCallOptions = {};

        if (!('file_id' in actions) && !('hash' in actions)) {
            console.error('** get_thumbnail: An error has occurred. Missing file_id or file hash.');
        } else if ('file_id' in actions && 'hash' in actions) {
            delete actions.hash;
        }

        options.responseType = 'blob';

        if ('hash' in actions) {
            options.queryParams = { hash: actions.hash };
        } else {
            options.queryParams = { file_id: actions.file_id };
        }

        return this.create_request('GET', 'get_files/thumbnail', options);
    }

    file_metadata(actions: { file_ids?: number[], hashes?: string[] }): Promise<FileMetadataResponse> {
        const options: BuildCallOptions = {};

        if (actions.file_ids === undefined && actions.hashes === undefined) {
            console.error('** file_metadata: An error occurred. Missing file_ids or file hashes.');
        } else if (actions.file_ids && actions.hashes) {
            delete actions.hashes;
        }

        if (actions.hashes) {
            options.queryParams = { hashes: JSON.stringify(actions.hashes) };
        } else {
            options.queryParams = { file_ids: JSON.stringify(actions.file_ids) };
        }

        return this.create_request('GET', 'get_files/file_metadata', options);
    }

    request_new_permissions(): Promise<RequestNewPermissionsResponse> {
        const options: BuildCallOptions = {};
        options.queryParams = {
            name: 'Hydrus React',
            basic_permissions: JSON.stringify([3]),
        };

        return this.create_request('GET', 'request_new_permissions', options);
    }
}

const url = new URL(window.location.href);
const config = {
    key: configuration.clientAccessKey,
    url: `${url.protocol}//${url.hostname}:${configuration.clientApiPort}/`,
};

const hydrus = new HydrusClient(config);
export default hydrus;