import './DynamicStream.css';

import { useState, useEffect } from 'react';

import Post from '../Post';

type DynamicStreamProps = {
    posts: any[],
    x: number,
    y: number,
    jumpTo: Function,
    viewMode: string,
}

const DynamicStream = ({ posts, x=5, y=5, viewMode="feed", jumpTo }: DynamicStreamProps) => {

    const [visibleRange, setVisibleRange] = useState({ start: 0, end: x + y });
    // const [currentViewMode, setCurrentViewMode] = useState(viewMode);

    // handle scroll
    function handleScroll(direction: string) {
        console.log("scroll ...");
        
        if (direction === "down" && visibleRange.end < posts.length) {
            setVisibleRange((prev) => ({
                start: prev.start + x,
                end: prev.end + x,
            }));
        } else if (direction === "up" && visibleRange.start > 0) {
            setVisibleRange((prev) => ({
                start: Math.max(0, prev.start - y),
                end: prev.end - y,
            }));
        }
    };

    // jump to post
    function jumpToPost(index: number) {
        setVisibleRange({
            start: Math.max(0, index - Math.floor(y / 2)),
            end: index + Math.ceil(x / 2),
        });
    };

    // ???
    useEffect(() => {
        if (jumpTo) jumpTo(jumpToPost);
    }, [jumpTo]);


    const renderPosts = () => {
        const visiblePosts = posts.slice(visibleRange.start, visibleRange.end);
        // if (currentViewMode === "grid") {
        //     return (
        //         <div className="grid">
        //             {visiblePosts.map((post) => (
        //                 <div key={post.id} className="grid-item">
        //                     <img src={post.imageUrl} alt={post.title} />
        //                 </div>
        //             ))}
        //         </div>
        //     );
        // } else if (currentViewMode === "single") {
        //     return <img src={visiblePosts[0]?.imageUrl} alt={visiblePosts[0]?.title} />;
        // }
        return visiblePosts.map((post) => <Post key={post.id} data={post} />);
    };

    return (
        <div className="DynamicStream" onScroll={(e) => handleScroll("down")}>
            {renderPosts()}
        </div>
    );
};


export default DynamicStream;
