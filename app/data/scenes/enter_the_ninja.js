import global from '../../../src/global.js';

global.loadScene({
    name: 'enter_the_ninja',
    map: 'courtyard',
    fps: 24,
    useFrames: true,
    duration: 573,
    tracks: [
        {
            name: 'ninja',
            element: {
                name: 'ninja',
                type: 'Ninja'
            },
            duration: 573,
            keyframes: [
                {
                    start: 0,
                    duration: 108,
                    x: 2500,
                    y: 2050,
                    z: 352,
                    alpha: 0
                },
                {
                    start: 108,
                    duration: 16,
                    x: 2500,
                    y: 2050,
                    z: 352,
                    alpha: 0,
                    tween: true
                },
                {
                    start: 124,
                    duration: 7,
                    x: 2500,
                    y: 2050,
                    z: 352,
                    tween: true
                },
                {
                    start: 131,
                    duration: 4,
                    x: 2447.4,
                    y: 2043,
                    z: 352
                },
                {
                    start: 135,
                    duration: 13,
                    x: 2447.4,
                    y: 2043,
                    z: 352,
                    action: 'fall',
                    tween: true
                },
                {
                    start: 148,
                    duration: 12,
                    x: 2359.4,
                    y: 2315.05,
                    z: 0,
                    action: 'land'
                },
                {
                    start: 160,
                    duration: 39,
                    x: 2359.4,
                    y: 2315.05,
                    z: 0,
                    action: 'run',
                    tween: true,
                    ease: 'in'
                },
                {
                    start: 199,
                    duration: 10,
                    x: 2245.95,
                    y: 1878.5,
                    z: 0,
                    action: 'jump',
                    tween: true
                },
                {
                    start: 209,
                    duration: 4,
                    x: 2178.9,
                    y: 1589.4,
                    z: 192,
                    action: 'jump',
                    tween: true
                },
                {
                    start: 213,
                    duration: 33,
                    x: 2175.35,
                    y: 1606.85,
                    z: 128,
                    tween: true
                },
                {
                    start: 246,
                    duration: 4,
                    x: 1623.2,
                    y: 1606.85,
                    z: 128
                },
                {
                    start: 250,
                    duration: 4,
                    x: 1623.2,
                    y: 1610.85,
                    z: 128
                },
                {
                    start: 254,
                    duration: 4,
                    x: 1627.2,
                    y: 1610.85,
                    z: 128
                },
                {
                    start: 258,
                    duration: 4,
                    x: 1623.2,
                    y: 1610.85,
                    z: 128
                },
                {
                    start: 262,
                    duration: 5,
                    x: 1623.2,
                    y: 1608.85,
                    z: 128
                },
                {
                    start: 267,
                    duration: 7,
                    x: 1623.2,
                    y: 1606.85,
                    z: 128,
                    action: 'jump',
                    tween: true
                },
                {
                    start: 274,
                    duration: 12,
                    x: 1623.2,
                    y: 1526.8,
                    z: 150,
                    action: 'ledge',
                    tween: true
                },
                {
                    start: 286,
                    duration: 9,
                    x: 1623.2,
                    y: 1526.8,
                    z: 150,
                    action: 'ledge',
                    tween: true
                },
                {
                    start: 295,
                    duration: 1,
                    x: 1623.2,
                    y: 1526.8,
                    z: 150,
                    alpha: 0
                },
                {
                    start: 296,
                    duration: 98,
                    x: 1623.2,
                    y: 1526.8,
                    z: 150,
                    alpha: 0
                },
                {
                    start: 394,
                    duration: 13,
                    x: 1623.2,
                    y: 1526.8,
                    z: 150,
                    alpha: 0,
                    tween: true
                },
                {
                    start: 407,
                    duration: 3,
                    x: 1623.2,
                    y: 1526.8,
                    z: 150,
                    tween: true
                },
                {
                    start: 410,
                    duration: 7,
                    x: 1623.2,
                    y: 1514.8,
                    z: 160,
                    tween: true
                },
                {
                    start: 417,
                    duration: 4,
                    x: 1623.2,
                    y: 1602.85,
                    z: 128
                },
                {
                    start: 421,
                    duration: 4,
                    x: 1619.2,
                    y: 1602.85,
                    z: 128
                },
                {
                    start: 425,
                    duration: 4,
                    x: 1619.2,
                    y: 1606.85,
                    z: 128
                },
                {
                    start: 429,
                    duration: 5,
                    x: 1623.2,
                    y: 1606.85,
                    z: 128
                },
                {
                    start: 434,
                    duration: 25,
                    x: 1623.2,
                    y: 1602.85,
                    z: 128,
                    tween: true
                },
                {
                    start: 459,
                    duration: 4,
                    x: 1823.2,
                    y: 1602.85,
                    z: 128,
                    tween: true
                },
                {
                    start: 463,
                    duration: 5,
                    x: 1823.2,
                    y: 1578.85,
                    z: 192,
                    tween: true
                },
                {
                    start: 468,
                    duration: 21,
                    x: 1863.2,
                    y: 1498.85,
                    z: 256,
                    tween: true
                },
                {
                    start: 489,
                    duration: 2,
                    x: 1935.2,
                    y: 1816.15,
                    z: 0
                },
                {
                    start: 491,
                    duration: 60,
                    x: 1935.2,
                    y: 1816.15,
                    z: 0,
                    tween: true
                },
                {
                    start: 551,
                    duration: 2,
                    x: 2135.7,
                    y: 2396.65,
                    z: 0,
                    tween: true
                },
                {
                    start: 553,
                    duration: 1,
                    x: 2113.55,
                    y: 2325.05,
                    z: 0
                },
                {
                    start: 554,
                    duration: 3,
                    x: 2113.55,
                    y: 2329.05,
                    z: 0
                },
                {
                    start: 557,
                    duration: 2,
                    x: 2073.55,
                    y: 2325.05,
                    z: 0
                },
                {
                    start: 559,
                    duration: 1,
                    x: 2113.55,
                    y: 2325.05,
                    z: 0
                },
                {
                    start: 560,
                    duration: 3,
                    x: 2113.55,
                    y: 2329.05,
                    z: 0
                },
                {
                    start: 563,
                    duration: 2,
                    x: 2153.55,
                    y: 2325.05,
                    z: 0
                },
                {
                    start: 565,
                    duration: 1,
                    x: 2113.55,
                    y: 2325.05,
                    z: 0
                },
                {
                    start: 566,
                    duration: 7,
                    x: 2113.55,
                    y: 2329.05,
                    z: 0
                }
            ]
        },
        {
            name: 'player',
            element: {
                name: 'monk',
                type: 'Player'
            },
            duration: 573,
            keyframes: [
                {
                    start: 0,
                    duration: 324,
                    x: 1567,
                    y: 1024,
                    z: 432,
                    action: 'drinking'
                },
                {
                    start: 324,
                    duration: 29,
                    x: 1567,
                    y: 1024,
                    z: 432,
                    tween: true,
                    ease: 'out'
                },
                {
                    start: 353,
                    duration: 5,
                    x: 1396.4,
                    y: 1192.7,
                    z: 432,
                    tween: true
                },
                {
                    start: 358,
                    duration: 165,
                    x: 1384,
                    y: 1218,
                    z: 432
                },
                {
                    start: 523,
                    duration: 5,
                    x: 1384,
                    y: 1218,
                    z: 432,
                    tween: true
                },
                {
                    start: 528,
                    duration: 3,
                    x: 1727.6,
                    y: 1212.15,
                    z: 432,
                    tween: true,
                    ease: 'out'
                },
                {
                    start: 531,
                    duration: 8,
                    x: 1909.6,
                    y: 1189.75,
                    z: 440,
                    tween: true,
                    ease: 'in'
                },
                {
                    start: 539,
                    duration: 11,
                    x: 2179.7,
                    y: 1521.95,
                    z: 320,
                    tween: true
                },
                {
                    start: 550,
                    duration: 3,
                    x: 2190,
                    y: 2518.6,
                    z: 0,
                    tween: true
                },
                {
                    start: 553,
                    duration: 20,
                    x: 2188,
                    y: 2512.6,
                    z: 0
                }
            ]
        },
        {
            name: 'viewport',
            element: {
                name: 'viewport',
                type: 'Viewport'
            },
            duration: 573,
            keyframes: [
                {
                    start: 0,
                    duration: 74,
                    x: 869,
                    y: 380,
                    tween: true,
                    ease: 'out'
                },
                {
                    start: 74,
                    duration: 21,
                    x: 1280,
                    y: 800
                },
                {
                    start: 95,
                    duration: 21,
                    x: 1280,
                    y: 800,
                    tween: true
                },
                {
                    start: 116,
                    duration: 56,
                    x: 2164,
                    y: 2072,
                    tween: true
                },
                {
                    start: 172,
                    duration: 24,
                    x: 2084,
                    y: 2072,
                    tween: true
                },
                {
                    start: 196,
                    duration: 16,
                    x: 1964,
                    y: 1752,
                    tween: true
                },
                {
                    start: 212,
                    duration: 44,
                    x: 1948,
                    y: 1636,
                    tween: true
                },
                {
                    start: 256,
                    duration: 40,
                    x: 1459,
                    y: 1576
                },
                {
                    start: 296,
                    duration: 27,
                    x: 1459,
                    y: 1576,
                    tween: true
                },
                {
                    start: 323,
                    duration: 40,
                    x: 1503,
                    y: 955.85,
                    tween: true
                },
                {
                    start: 363,
                    duration: 30,
                    x: 1459,
                    y: 991.85,
                    tween: true
                },
                {
                    start: 393,
                    duration: 79,
                    x: 1459,
                    y: 1383.95
                },
                {
                    start: 472,
                    duration: 80,
                    x: 1459,
                    y: 1383.95,
                    tween: true,
                    ease: 'inout'
                },
                {
                    start: 552,
                    duration: 21,
                    x: 2144,
                    y: 2386.15
                }
            ]
        }
    ]
});