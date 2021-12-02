import React, { MouseEvent, useEffect, useState } from 'react';

const usePagination = function<T>(data: T[], pageLimit: number): [T[], React.Dispatch<React.SetStateAction<T[]>>, JSX.Element, (newData: T[]) => void] {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageData, setPageData] = useState<T[]>([]);

    useEffect(() => {
        const offset = (currentPage - 1) * pageLimit;
        setPageData(data.slice(offset, offset + pageLimit));
    }, [currentPage, pageLimit, data]);

    const changePage = function(event: MouseEvent<HTMLAnchorElement>, pageNum: number) {
        event.preventDefault();
        setCurrentPage(pageNum);
    };

    const reset = function(newData: T[]) {
        setCurrentPage(1);
        setPageData(newData.slice(0, pageLimit));
    };

    const totalPages = Math.ceil(data.length / pageLimit);
    const pagerButtons = [];

    for (let i = 1; i <= totalPages; ++i) {
        const button = (
            <a
                key={i}
                className={'pager-button' + (currentPage === i ? ' selected' : '')}
                href="#"
                onClick={(e) => changePage(e, i)}
            >
                {i}
            </a>
        );
        pagerButtons.push(button);
    }

    const pager = (
        <div className="results-pager">
            {pagerButtons}
        </div>
    );

    return [pageData, setPageData, pager, reset];
};

export default usePagination;