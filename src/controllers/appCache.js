const applicationCache = window.applicationCache;
const timeoutAppCacheCheckAfter = 5000;

const appCache = {
    loaded: 0,
    total: 0,
    complete: false,
    timedout: false
};

export default appCache;

// handle app cache loading and refreshes
if (applicationCache && applicationCache.status !== applicationCache.UNCACHED) {
    const toId = window.setTimeout(function () {
        appCache.timedout = true;
    }, timeoutAppCacheCheckAfter);

    applicationCache.addEventListener('noupdate', function () {
        window.clearTimeout(toId);
        appCache.progress = 100;
        appCache.complete = true;
    }, false);

    applicationCache.addEventListener('downloading', function () {
        window.clearTimeout(toId);
    }, false);

    applicationCache.addEventListener('progress', function (e) {
        appCache.loaded = e.loaded;
        appCache.total = e.total;
    }, false);

    applicationCache.addEventListener('updateready', function () {
        if (appCache.status === appCache.UPDATEREADY) {
            appCache.progress = 100;
            window.clearTimeout(toId);
            appCache.swapCache();
            window.location.reload();
        }
    }, false);

    applicationCache.addEventListener('cached', function () {
        appCache.progress = 100;
        appCache.complete = true;
        window.clearTimeout(toId);
    }, false);

} else {
    appCache.complete = true;
}
