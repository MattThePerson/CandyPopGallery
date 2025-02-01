

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

// get date distribution. Assumes posts already sorted!
export function computeDateDist(posts: any[], param: string): any[] {
    
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

    return dist;
}

// assumes posts are already sorted by param!
export function filterPostsByParam(posts: any[], param: string, descending: boolean, thresh: string): any[] {

    console.log(descending);
    const threshNorm = normalizeDate(thresh);
    const filtered = [];

    console.log('filtering by date:', threshNorm);

    for (let post of posts) {
        const value = post[param];
        if (value) {
            const valueNorm = normalizeDate(value);

            if (valueNorm < threshNorm) {
                filtered.push(post);
            }
            // if (descending && normalizedValue <= normalizedThresh || 
            //     !descending && normalizedValue >= normalizedThresh) {
            //     filtered.push(post);
            // }
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

