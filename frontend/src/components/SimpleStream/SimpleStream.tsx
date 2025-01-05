import './SimpleStream.css';

import { useState, useEffect, useRef } from 'react';

import Post from '../Post';


interface SimpleStreamProps {
    posts: any[];
}

function SimpleStream({posts}: SimpleStreamProps) {

    
    // document.addEventListener('scroll', () => {
    //     if (window.innerHeight + window.scrollY >= document.body.offsetHeight-750) {
    //         console.log("Loading more posts ...");
    //         setLoadedPostAmount(prev => prev + 5);
    //     }
    // });
    
    // useEffect(() => {
    //     if (posts.length > 0) {
    //         console.log("useEffect()");
    //         setLoadedPostAmount(Math.max(loadedPostAmount, 5));
    //     }
    // }, [posts]);

    // console.log("loadedPostAmount:", loadedPostAmount);
    
    const [loadedPostAmount, setLoadedPostAmount] = useState(0);

    const loaderRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    console.log('Loading more posts ...');
                    setLoadedPostAmount(prev => prev + 5);
                }
            },
            { rootMargin: '750px' }
        );

        if (loaderRef.current) observer.observe(loaderRef.current);

        return () => observer.disconnect();
    }, []);
    
    console.log('loadedPostAmount:', loadedPostAmount);
    
    /* HTML */
    const postElementsToDisplay = posts.slice(0, loadedPostAmount).map((post: any, idx: number) => 
        <Post key={post.id+idx} data={post} />
    );
    
    return (
        <div className="SimpleStream">
            {postElementsToDisplay}
            {`Loaded ${loadedPostAmount} posts`}
            <div ref={loaderRef} style={{height: '1px'}}></div> {/* invisible loader element */}
        </div>
    )
}

export default SimpleStream;
