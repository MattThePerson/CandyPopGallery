

/* - HELPER FUNCS ------------ */

function isImageFile(filename) {
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.svg', '.tiff', '.avif'];
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
}


/* - MAIN --------------- */

const query = {
    search_query: null,
    include_tags: ['mommy', 'honkers'],
    exclude_tags: [],
    sortby: null,
}
makeApiRequestPOST('/api/search-posts', query, res => {

    console.log(res);

    for (let idx = 0; idx < res.posts.length; idx++) {
        const post = res.posts[idx];
        
        /* set first img */
        const media_src = post.media_objects[0].src;
        const media_fetch_src = `/media/${encodeURIComponent(media_src)}`;
        const item = document.querySelectorAll('.item')[idx];
        if (!item) return;
        if (isImageFile(media_src)) {
            const img = document.createElement('img');
            img.src = media_fetch_src; //'assets/geck.jpg';
            item.appendChild(img);
        } else {
            const video = document.createElement('video');
            // video.type = 'video/mp4';
            video.setAttribute('type', 'video/mp4');
            video.src = media_fetch_src; //'assets/cilantro.mp4';
            video.muted = true;
            video.play();
            item.appendChild(video);
        }
        
        /* get post data */
        const post_id = post.post_id;
        makeApiRequestGET('/api/get-post-data', [post_id], post_data => {
            // console.log(post_data);
        });

        // return;
    }
});


// console.log('testing backend!');
// makeApiRequestGET('/control/rescan-libraries', [], res => {
//     console.log(res);
// });
