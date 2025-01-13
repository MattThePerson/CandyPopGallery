

// parse sortby string
export function parseSortbyString(sb: string): [string, boolean] {
    const order = (sb.endsWith('-desc')) ? '-desc' : '-asc';
    const sortby_param = sb.replace(order, '');
    return [sortby_param.split('-').join('_'), order === '-desc'];
}

/* SORTING FUNCTIONS */

function Compare(a: any, b: any): number {
    if (typeof a === 'string' && typeof b === 'string') {
        return a.localeCompare(b);
    } else if (typeof a === 'number' && typeof b === 'number') {
        return a - b;
    } else if (a instanceof Date && b instanceof Date) {
        return a.getTime() - b.getTime();
    }
    return 0; // If types are not comparable
}

// sort posts
export function sortPostsByParam(posts: any[], param: string, desc: boolean): any {
    
    // @ts-ignore
    posts.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    const newPosts = [...posts];
    
    newPosts.sort((a, b) => {
        if (desc) {
            return Compare(b[param], a[param]);
        } else {
            return Compare(a[param], b[param]);
        }
    });
    return newPosts;
}

function seededRandom(seed: string): number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = (hash << 5) - hash + seed.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash) / 0x7FFFFFFF;
}

// shuffle list
export function shuffleListWithSeed(list: any[], seed: string): any {
    const newList = [...list];
    newList.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    newList.sort(() => seededRandom(seed) - 0.5); // Random shuffle based on seed
    return newList;
}


/* Array Analysis functions */

// get date distribution
export function computeDateDist(posts: any[], param: string, descending: boolean): any[] {
    
    const counter: {[key: string]: any} = {};
    const keys: string[] = [];

    for (let post of posts) {
        const value = post[param];
        if (value) {
            const valueNorm = normalizeDate(value);
            const valueYear = valueNorm.slice(0, 4);
            const valueMonth = valueNorm.slice(0, 7);
            counter[valueYear] = (counter[valueYear] || 0) + 1;
            counter[valueMonth] = (counter[valueMonth] || 0) + 1;
            if (!keys.includes(valueYear)) keys.push(valueYear);
            if (!keys.includes(valueMonth)) keys.push(valueMonth);
        }
    }

    const dist: any[] = keys.map((dateStr: string) => {
        return { date: dateStr, count: counter[dateStr] }
    });

    console.log("in datedist, dist by:", param);
    console.log(posts.length);
    console.log(counter);
    // console.log(counterMonth);
    console.log(dist);
    
    return dist;

    return [
        { date: "2024", count: 1298 },
        { date: "2024-01", count: 24 },
        { date: "2024-02", count: 29 },
        { date: "2024-03", count: 20 },
        { date: "2024-04", count: 33 },
        { date: "2024-05", count: 12 },
        { date: "2024-06", count: 10 },
        { date: "2024-07", count: 5 },
        { date: "2024-08", count: 37 },
        { date: "2024-09", count: 21 },
        { date: "2024-10", count: 39 },
        { date: "2024-11", count: 35 },
        { date: "2024-12", count: 41 },
        { date: "2023", count: 198 },
        { date: "2023-01", count: 29 },
        { date: "2023-02", count: 21 },
        { date: "2023-03", count: 3 },
        { date: "2023-04", count: 2 },
        { date: "2023-05", count: 39 },
        { date: "2023-06", count: 1 },
        { date: "2023-07", count: 24 },
        { date: "2023-08", count: 12 },
        { date: "2023-09", count: 2 },
        { date: "2023-10", count: 7 },
        { date: "2023-11", count: 11 },
        { date: "2023-12", count: 1 },
        { date: "2022", count: 198 },
        { date: "2022-01", count: 24 },
        { date: "2022-02", count: 41 },
        { date: "2022-03", count: 33 },
        { date: "2022-04", count: 34 },
        { date: "2022-05", count: 10 },
        { date: "2022-06", count: 5 },
        { date: "2022-07", count: 24 },
        { date: "2022-08", count: 10 },
        { date: "2022-09", count: 39 },
        { date: "2022-10", count: 12 },
        { date: "2022-11", count: 29 },
        { date: "2022-12", count: 38 },
        { date: "2021", count: 198 },
        { date: "2021-01", count: 9 },
        { date: "2021-02", count: 10 },
        { date: "2021-03", count: 12 },
        { date: "2021-04", count: 35 },
        { date: "2021-05", count: 16 },
        { date: "2021-06", count: 36 },
        { date: "2021-07", count: 43 },
        { date: "2021-08", count: 18 },
        { date: "2021-09", count: 26 },
        { date: "2021-10", count: 45 },
        { date: "2021-11", count: 1 },
        { date: "2021-12", count: 36 },
        { date: "2020", count: 198 },
        { date: "2020-01", count: 5 },
        { date: "2020-02", count: 5 },
        { date: "2020-03", count: 0 },
        { date: "2020-04", count: 2 },
        { date: "2020-05", count: 28 },
        { date: "2020-06", count: 45 },
        { date: "2020-07", count: 45 },
        { date: "2020-08", count: 12 },
        { date: "2020-09", count: 35 },
        { date: "2020-10", count: 40 },
        { date: "2020-11", count: 3 },
        { date: "2020-12", count: 40 },
        { date: "2019", count: 198 },
        { date: "2019-01", count: 34 },
        { date: "2019-02", count: 10 },
        { date: "2019-03", count: 44 },
        { date: "2019-04", count: 11 },
        { date: "2019-05", count: 23 },
        { date: "2019-06", count: 40 },
        { date: "2019-07", count: 8 },
        { date: "2019-08", count: 6 },
        { date: "2019-09", count: 28 },
        { date: "2019-10", count: 15 },
        { date: "2019-11", count: 3 },
        { date: "2019-12", count: 20 }
    ];
}

// assumes posts are already sorted by param!
export function filterPostsByParam(posts: any[], param: string, descending: boolean, thresh: string): any[] {

    const normalizedThresh = normalizeDate(thresh);
    const filtered = [];

    console.log('filtering by date:', normalizedThresh);

    for (let post of posts) {
        const value = post[param];
        if (value) {
            const normalizedValue = normalizeDate(value);

            // Compare based on descending or ascending
            if (descending && normalizedValue <= normalizedThresh || 
                !descending && normalizedValue >= normalizedThresh) {
                filtered.push(post);
            }
        }
    }

    return filtered;
}

// 
function normalizeDate(dateStr: string){
    let normalized = dateStr.replace(/:/g, "-");
    const parts = normalized.split("-");
    if (parts.length === 1) {
        normalized += "-01-01"; // Only year provided
    } else if (parts.length === 2) {
        normalized += "-01"; // Year and month provided
    }
    return normalized;
};

