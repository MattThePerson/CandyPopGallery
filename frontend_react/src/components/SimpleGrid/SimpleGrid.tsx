import './SimpleGrid.css';

import { useEffect, useRef } from 'react';

import { flask_api_url } from '../../utils/api';

import MediaComponent from '../MediaComponent';

interface SimpleGridProps {
    posts: any[];
    streamLoadState: any;
    setStreamLoadState: Function;
    setSelectedTags: Function;
}

function SimpleGrid({posts, streamLoadState, setStreamLoadState, setSelectedTags}: SimpleGridProps) {

    /* LOADING LOGIC */

    const loaderRef = useRef(null);
    
        useEffect(() => {
            const observer = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting) {
                        setStreamLoadState((currState: any) => {
                            const nextState = { ...currState, postsLoaded: currState.postsLoaded + 4 }
                            console.log('[IntersectionObserver] Loading more posts ...', currState.postsLoaded);
                            return nextState;
                        });
                    }
                },
                { rootMargin: '200px' }
            );
    
            if (loaderRef.current) observer.observe(loaderRef.current);
    
            return () => observer.disconnect()
        }, []);

    /* EFFECTS */

    useEffect(() => {
        [1, 200, 400, 600, 800, 1000, 1200].forEach((ms, idx) => {
            setTimeout(() => {
                setStreamLoadState((currState: any) => {
                    const nextState = { ...currState, postsLoaded: 3 + idx*3 }
                    console.log(ms, nextState.postsLoaded);
                    return nextState;
                })
            }, ms);
        })
    }, [posts]);


    /* ELEMENTS */
    const postElementsToDisplay = posts.slice(0, streamLoadState.postsLoaded).map((post: any) =>
        <div className="grid-cell" key={post.post_id}>
            <MediaComponent src={flask_api_url + 'media/' + encodeURIComponent(post.media_objects[0].src)} />
            {/* EXAMPLE */}
        </div>
    );
    
    return (
        <div className="SimpleGrid">
            {postElementsToDisplay}
            <div ref={loaderRef} style={{ height: '1px' }}></div> {/* invisible loader element */}
        </div>
    )
}

export default SimpleGrid;
