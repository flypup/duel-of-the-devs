import global from '../global';
import { traceTime, traceTimeEnd } from '../logging';

let images_ = {};
let loaded_ = {};
let cache_ = {};

export default class Images {

    static clearImages() {
        images_ = {};
        loaded_ = {};
    }

    static clearCache() {
        cache_ = {};
    }

    static getImage(src) {
        let image = images_[src];
        if (!image) {
            image = images_[src] = new Image();
            image.src = src;
            loaded_[image.src] = false;
            image.onload = function () {
                loaded_[image.src] = true;
            };
        }
        return image;
    }

    static getCached(image, id) {
        id = id || image.src;

        //cached element
        const cached = cache_[id];
        if (cached) {
            return cached;
        }

        if (image.nodeName === 'CANVAS') {
            return Images.appendCache(id, image);
        }

        image = Images.getImage(image.src);

        //image loading
        if (!image.width || !image.height) {
            return image;
        }

        if (!loaded_[image.src]) {
            //console.warn('Caching unloaded image', image);
            return image;
        }

        //cache image
        return Images.appendCache(id, image);
    }

    static appendCache(id, image) {
        if (global.debug === 1) {
            traceTime('appendCache ' + id);
        }

        const canvas = window.document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0);

        cache_[id] = canvas;

        if (global.debug === 1) {
            traceTimeEnd('appendCache ' + id);
        }

        return canvas;
    }

    static appendCacheDraw(id, width, height, fn) {
        if (global.debug === 1) {
            traceTime('appendCacheDraw ' + id);
        }

        const canvas = window.document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        fn(context);

        cache_[id] = canvas;

        if (global.debug === 1) {
            traceTimeEnd('appendCacheDraw ' + id);
        }

        return canvas;
    }

}
