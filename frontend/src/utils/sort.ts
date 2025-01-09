

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