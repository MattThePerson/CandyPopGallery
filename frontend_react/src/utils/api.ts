

export const flask_api_url = `http://${import.meta.env.VITE_DEVICE_IP_ADDR}:${import.meta.env.VITE_FLASK_API_PORT}/`;


// makeApiRequestGET
export function makeApiRequestGET(request: string, args: string[], callback: Function) {
    let api_call = request;
    for (let arg of args) {
        api_call = api_call + "/" + arg;
    }
    fetch(flask_api_url + api_call)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // console.log(data)
            callback(data);
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
}

// makeApiRequestGET_JSON
export function makeApiRequestGET_JSON(request: string, data: any, callback: Function) {
    const url = new URL(flask_api_url + request);
    Object.keys(data).forEach(key => url.searchParams.append(key, String(data[key])));
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // console.log(data);
            callback(data);
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
}

// 
export function testApiConnection(route: string, succ_handler: Function, fail_handler: Function) {

    fetch(flask_api_url + route)
        .then(() => succ_handler())
        .catch(() => fail_handler());
}