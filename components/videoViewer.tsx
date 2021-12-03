import React, { MouseEvent, useEffect, useRef } from 'react';
import { VideoJsPlayer, VideoJsPlayerOptions } from 'video.js';
import hydrus, { Metadata } from '../api/hydrusClientApi';
import 'video.js/dist/video-js.css';
import './videoViewer.css';

type VideoViewerProps = {
    metadata: Metadata
    onCloseItemClick: (event: MouseEvent<HTMLAnchorElement>) => void
};

const VideoViewer = function(props: VideoViewerProps) {
    const video = useRef<HTMLVideoElement | null>(null);
    const player = useRef<VideoJsPlayer | null>(null);

    useEffect(() => {
        const onPlayerReady = function() {
            // Kenjugs(2021/11/01): seems pointless to be required to check if this.player is null since it should always have a value when this event fires
            if (player.current === null || props.metadata === undefined) return;
    
            player.current.volume(0.1);
    
            // Kenjugs(2021/11/04): directly feed the URL here since manually trying to split the video file and render it using the Media Source Extensions API
            // simply doesn't work unless the video file is encoded in exactly the right way. did not try using the Media Capture and Streams API, so not sure
            // how well that would work. in any case, video.js seems smart enough to be able to make 206 PARTIAL requests and render the video chunks correctly
            // if given a direct URL to the resource.
            // TODO Kenjugs(2021/11/04): check if Media Capture and Streams API can be used for async video chunk retrieval and playback.
            player.current.src({
                src: `${hydrus.config.url}get_files/file?file_id=${props.metadata.file_id}&Hydrus-Client-API-Access-Key=${hydrus.config.key}`,
                type: props.metadata.mime,
            });
        };
        
        const initializePlayer = function(options: VideoJsPlayerOptions) {
            import(/* webpackChunkName: "videojs" */ 'video.js/dist/alt/video.core.novtt')
            .then((videojs) => {
                player.current = videojs.default(video.current as Element, options, onPlayerReady);
            });
        };

        const options: VideoJsPlayerOptions = {
            autoplay: false,
            controls: true,
            preload: 'metadata',
            fill: true,
            responsive: true,
        };

        initializePlayer(options);

        return () => {
            if (player.current) {
                player.current.dispose();
            }
        };
    }, [props.metadata]);

    if (props.metadata === undefined) {
        return null;
    }
        
    return (
        <div className="video-container">
            <div data-vjs-player>
                <video
                    ref={(node) => { video.current = node }}
                    className="video-js"
                    onLoadedMetadata={(e) => (e.target as HTMLVideoElement).volume = 0.1}
                />
            </div>
            <a className="close-video-button" href="#" onClick={props.onCloseItemClick}></a>
        </div>
    );
}

export default VideoViewer;