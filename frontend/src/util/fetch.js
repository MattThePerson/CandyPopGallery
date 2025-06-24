


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

