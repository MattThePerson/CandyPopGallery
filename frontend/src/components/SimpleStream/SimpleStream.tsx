import './SimpleStream.css';

import { useState, useEffect, useRef, useReducer } from 'react';

import Post from '../Post';


interface SimpleStreamProps {
    posts: any[];
    streamLoadState: any;
    setStreamLoadState: Function;
    setSelectedTags: Function;
    updateOverlayPost: Function;
}

function SimpleStream({ posts, streamLoadState, setStreamLoadState, setSelectedTags, updateOverlayPost }: SimpleStreamProps) {

    /* AUTOPLAY LOGIC */

    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    // console.log('intersect!');
                    const video = entry.target.querySelector('video');
                    if (video) {
                        if (entry.isIntersecting) {
                            video.play().catch((error) => {
                                // console.error('Video failed to play:', error);
                            });
                            video.muted = false; // Ensure video is muted
                        } else {
                            video.pause();
                        }
                    }
                });
            },
            { threshold: 0.5 } // Trigger when 50% of the post is visible
        );

        const postEls = containerRef.current?.querySelectorAll('.Post');
        postEls?.forEach((post: any) => observer.observe(post));
        // console.log('In useEffect:', postEls.length);

        return () => {
            // posts.forEach((post) => {
            //     if (post) {
            //         observer.unobserve(post)
            //     }
            // });
        };
    }, [posts]);

    /* LOADING LOGIC */

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
    const postElementsToDisplay = posts.slice(0, streamLoadState.postsLoaded).map((post: any) =>
        <Post key={post.post_id} data={post} setSelectedTags={setSelectedTags} updateOverlayPost={updateOverlayPost} />
    );

    return (
        <div className="SimpleStream" ref={containerRef}>
            {postElementsToDisplay}
            <div ref={loaderRef} style={{ height: '1px' }}></div> {/* invisible loader element */}
        </div>
    )
}

export default SimpleStream;




/*  */
