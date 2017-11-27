export function traceTime(tag) {
    tag = tag || 'default';
    console.time = console.time || function () {
    };
    console.time(tag);
}

export function traceTimeEnd(tag) {
    tag = tag || 'default';
    console.timeEnd = console.timeEnd || function () {
    };
    console.timeEnd(tag);
}
