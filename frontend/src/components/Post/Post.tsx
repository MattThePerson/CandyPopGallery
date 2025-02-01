import './Post.css';

// import { useState, useEffect } from 'react'
import { flask_api_url } from '../../utils/api';

import MediaComponent from '../MediaComponent';

type PostProps = {
    data: any;
    setSelectedTags: Function;
    updateOverlayPost: Function;
}

function Post({data, setSelectedTags, updateOverlayPost}: PostProps) {

    // console.log(data);

    function get_proper_tag_element(tag: string, idx: number) {
        const classes = ['tag', 'proper'];
        const sep = ': ';
        let tag_name = tag;
        if (tag.includes(sep)){
            let parts = tag.split(sep);
            classes.push(parts[0]);
            tag_name = parts.slice(1,10).join(sep)
        }
        
        return (
            <div key={"tag-" + idx} className={classes.join(' ')} title={tag}
                onClick={() => setSelectedTags('general', tag)}>{tag_name}
                {/* onAuxClick={() => console.log("hello there!")} */}
            </div>
        )
    }
    
    const media_objects = data.media_objects;

    return (
        <div className="Post">

            <div className="post-title-bar" onClick={() => updateOverlayPost(data.post_id)}>
                <h2 className="title" >{data.title} </h2>
                <div className="date-uploaded">{data.date_uploaded} </div>
            </div>
            <div className="post-body">
                <MediaComponent src={flask_api_url + 'media/' + encodeURIComponent(media_objects[0].src)} />
                <div className="info-container">
                    <div className="tag-bar upper-tag-bar">
                        <div className="tag source" onClick={() => setSelectedTags('source', data['source'])}>{data['source']} </div>
                        <a className="tag creator" onClick={(event) => {event.preventDefault(); setSelectedTags('creator', data['creator'])}} 
                        onAuxClick={() => console.log("clicked")}
                        href={`/home?tags=example`}
                        >
                            {data['creator']} 
                        </a>
                    </div>
                    <div className="tag-bar lower-tag-bar proper-tag-bar">
                        {data['proper_tags']?.slice(0,50).map((tag: string, idx: number) =>
                            get_proper_tag_element(tag, idx)
                        )}
                    </div>
                    <div className="tag-bar lower-tag-bar improper-tag-bar">
                        {data['improper_tags']?.slice(0,50).map((tag: string, idx: number) =>
                            <div key={"tag-" + idx} className="tag improper" onClick={() => setSelectedTags('general', tag)}>{tag} </div>
                        )}
                    </div>
                    <div>{"Upvotes: " + data.upvotes} </div>
                    <div>{"Views: " + data.views} </div>
                    <div>{"Filename: " + media_objects[0].filename} </div>
                    <div>{"Date downloaded: " + data.date_downloaded}</div>
                    <div>{"media count: " + data.media_count} </div>
                    {(data.url) ? <a href={data.url} target="_blank">post url</a> : <></>}
                    <div className="comments">
                        {`Comments (${data["comments"]?.length}):`}
                        {data['comments']?.slice(0, 6).map((comment: any, idx: number) => 
                            <div key={idx} className="comment">{comment} </div>
                        )}
                    </div>
                </div>
            </div>


        </div>
    )
}

export default Post;
