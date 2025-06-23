

/* - FETCH FUNCTIONS ----------- */

/* simple url args */
function makeApiRequestGET(request, args, callback) {

    let api_call = request;
    for (let arg of args) {
        api_call = api_call + '/' + arg;
    }

    fetch(api_call)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok. status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            callback(data)
        })
        .catch(error => {
            console.error(`Get error (${request}):`, error);
    });
    
}


/* post json object */
function makeApiRequestPOST(request, data, callback) {
    
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
    }
    
    fetch(request, options)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok. status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            try {
                callback(data)
            } catch (error) {
                console.error(`Callback error (${request}):`, error);
            }
        })
        .catch(error => {
            console.error(`Post error (${request}):`, error);
    });

}


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
        // console.log(media_src);
        const item = document.querySelectorAll('.item')[idx];
        if (!item) return;
        if (isImageFile(media_src)) {
            const img = document.createElement('img');
            img.src = `/media/${encodeURIComponent(media_src)}`;
            item.appendChild(img);
        } else {
            const video = document.createElement('video');
            video.src = `/media/${encodeURIComponent(media_src)}`;
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
