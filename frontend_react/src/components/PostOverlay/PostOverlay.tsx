import './PostOverlay.css';

interface PostOverlayParams {
    post_id: string | null;
    updateOverlayPost: Function;
}

function PostOverlay({post_id, updateOverlayPost}: PostOverlayParams) {

    return (
        <div className="PostOverlay" onClick={() => updateOverlayPost()}>
            <div className="post_id">
                POST_ID:
                {post_id}
            </div>
        </div>
    )
}

export default PostOverlay;
