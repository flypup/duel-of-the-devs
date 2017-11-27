export const touch = (('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch);

export const msTouch = navigator.msPointerEnabled;

export const ipad = (/iPad/).test(navigator.userAgent);

export const ios = ipad || (/iPhone|iPod/).test(navigator.userAgent);

export const android = (/Android/).test(navigator.userAgent);

export const mobile = ios || android;

export const standalone = !!navigator.standalone;

export const webgl =  !!window.WebGLRenderingContext;

export const webaudio = !!window.AudioContext;

export const gamepads =  !!navigator.getGamepads;
