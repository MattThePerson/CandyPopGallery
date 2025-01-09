import './SimpleStream.css';

import { useState, useEffect, useRef } from 'react';

import Post from '../Post';


interface SimpleStreamProps {
    posts: any[];
    streamLoadState: any;
    setStreamLoadState: Function;
    setSelectedTags: Function;
}

function SimpleStream({posts, streamLoadState, setStreamLoadState, setSelectedTags}: SimpleStreamProps) {

    const loaderRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setStreamLoadState((currState: any) => {
                        const nextState = { ...currState, postsLoaded: currState.postsLoaded + 2 }
                        console.log('[IntersectionObserver] Loading more posts ...', currState.postsLoaded);
                        return nextState;
                    });
                }
            },
            { rootMargin: '750px' }
        );

        if (loaderRef.current) observer.observe(loaderRef.current);

        return () => observer.disconnect()
    }, []);

    /* HTML */
    const postElementsToDisplay = posts.slice(0, streamLoadState.postsLoaded).map((post: any, idx: number) => 
        <Post key={post.id+'-'+idx} data={post} setSelectedTags={setSelectedTags} />
    );
    
    return (
        <div className="SimpleStream">
            {postElementsToDisplay}
            <div ref={loaderRef} style={{height: '1px'}}></div> {/* invisible loader element */}
        </div>
    )
}

export default SimpleStream;
