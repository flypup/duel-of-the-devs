import global from './global';
import { traceTime, traceTimeEnd } from './logging';
import appCache from './controllers/appCache';
import { resizeDisplay } from './controllers/display';
import { addBrowserListeners, allowPinchZoom, preventPinchZoom } from './controllers/events';
import EnemyInput from './controllers/EnemyInput';
import UserInput from './controllers/UserInput';
import Collisions from './controllers/Collisions';
import Images from './controllers/Images';
import World from './models/World';
import Scene from './models/Scene';
import Player from './models/Player';
import Ninja from './models/Ninja';
import Sound from './views/Sound';
import SpriteSheets from './views/SpriteSheets';
import Canvas2dView from './views/Canvas2dView';
import Canvas2dWorldView from './views/Canvas2dWorldView';
import HUDView from './views/HUDView';
import ButtonOverlay from './views/ButtonOverlay';
import Canvas2dCreditsView from './views/Canvas2dCreditsView';
import ChipmunkDebugView from './views/ChipmunkDebugView';
import DebugView from './views/DebugView';
import ThreeJsWorldView from './views/ThreeJsWorldView';
import { TIME_STEP } from './constants/physics';

const version = '0.3.0';
const max = Math.max;
const min = Math.min;

// data
let player;
let boss;

// entities
let world;
let scene;

//views
let view;
let worldView;
let hudView;
let creditsView;
let debugView;
let cpDebugView;
let view3d;

// controllers
let collisions;
let userInput;
let bossInput;
let sound;

// main loop
let paused = false;
let deltaTime;
let remainder;

// and then there are these things (loading, game and menu/HUD controllers plz):
let overlay = null;
const WATCH_DEAD_BOSS_DURATION = 2000;

export default class Core {

    constructor() {
        this.rafId = 0;
        this.loadingViewNode = null;
        this.xhrObjects = [];
    }

    begin() {
        console.log('begin');
        cancelAnimationFrame(this.rafId);
        this.rafId = requestAnimationFrame((time) => this.load(time));

        this.loadSettings();

        this.trackEvent('core', 'preload', version, undefined, true);
    }

    loadSettings() {
        //version and settings check
        const localVersion = this.getLocal('version');
        if (!localVersion) {
            this.clearLocal();
        }
        if (localVersion !== version) {
            this.setLocal('debug', 0);
            this.setLocal('version', version);
        }
        if (global.mobile) {
            this.setLocal('debug', 0);
        }
        global.debug = this.getLocal('debug', 0, parseInt, [10]);
    }

    load(time) {
        const document = window.document;
        let msg = '...';
        const hasProperties = function (obj, props) {
            if (!obj) {
                return false;
            }
            for (let i = 0, len = props.length; i < len; i++) {
                if (obj[props[i]] === undefined) {
                    return false;
                }
            }
            return true;
        };
        const mapsLoaded = hasProperties(global.maps, global.mapList);
        if ((!appCache.complete && !appCache.timedout) || global.ready !== true || !mapsLoaded) {
            cancelAnimationFrame(this.rafId);
            this.rafId = requestAnimationFrame((time) => this.load(time));
            // TODO: Loading screen drawn to canvas
            if (!this.loadingViewNode) {
                this.loadingViewNode = document.createElement('p');
                this.loadingViewNode.appendChild(document.createTextNode(msg));
                document.body.appendChild(this.loadingViewNode);
            }
            if (this.xhrObjects.length === 0) {
                for (let i = 0, len = global.mapList.length; i < len; i++) {
                    const url = `data/${global.mapList[i]}/data.json`;
                    const xhr = new XMLHttpRequest();
                    this.xhrObjects.push(xhr);
                    xhr.open('GET', url);
                    xhr.addEventListener('loadend', function() {
                        if (xhr.status === 200) {
                            const json = xhr.responseText;
                            const data = JSON.parse(json);
                            global.loadMap(data);
                        }
                    });
                    xhr.send();
                }
            }
            if (appCache.loaded) {
                msg = 'Downloading Updates ' + appCache.loaded + '/' + appCache.total;
            } else {
                if (!mapsLoaded) {
                    msg = ' Maps' + msg;
                }
                msg = 'Loading' + msg;
            }
            this.loadingViewNode.firstChild.nodeValue = msg;
            console.log('loading');
            return;
        }
        // clear loading vars
        if (this.loadingViewNode) {
            document.body.removeChild(this.loadingViewNode);
            this.loadingViewNode = null;
        }
        this.xhrObjects.length = 0;

        this.init(time);
    }

    init(time) {
        console.log('init');
        deltaTime = time;
        remainder = 0;

        player = null;
        boss = null;
        userInput = new UserInput();
        bossInput = new EnemyInput();
        if (world) {
            world.term();
        }
        global.world = world = world || new World();
        collisions = collisions || new Collisions();
        if (!sound) {
            sound = new Sound();
            // TODO: separate music and sound effect volume
            sound.setVolume(this.getLocal('soundVolume', 0.5, parseFloat));
            sound.loadSound(sound.sounds.game);
            sound.loadSound(sound.sounds.stars);
            sound.loadSound(sound.sounds.strikes);
            sound.loadSound(sound.sounds.hits);
        }
        global.sound = sound;

        resizeDisplay();

        SpriteSheets.init();

        // Dummy View
        // view = {};
        // view.pause = view.resume = view.draw = function(){};

        // Canvas 2d Context View
        view = view || new Canvas2dView();
        view.removeAll();
        worldView = worldView || new Canvas2dWorldView(world);
        hudView = new HUDView();
        view.add(worldView);
        view.add(userInput);
        view.add(hudView);
        global.view = view;

        //-------- UI --------//
        addBrowserListeners(userInput);

        if (global.touch) {
            const scaledWidth = view.width * global.pixelRatio;
            const scaledHeight = view.height * global.pixelRatio;
            ButtonOverlay.viewWidth = scaledWidth;
            ButtonOverlay.viewHeight = scaledHeight;
            userInput.setLeftStickOverlay(userInput.addButtonOverlay(new ButtonOverlay({
                x: 160,
                y: scaledHeight - 160,
                radius: 150
            })));
            userInput.setRightStickOverlay(userInput.addButtonOverlay(new ButtonOverlay({
                x: scaledWidth - 160,
                y: scaledHeight - 160,
                radius: 150
            })));

            const pauseButton = userInput.addButtonOverlay(new ButtonOverlay({x: scaledWidth, y: 50, radius: 150}));
            const debugButton = userInput.addButtonOverlay(new ButtonOverlay({x: 0, y: 50, radius: 150}));
            global.bind(pauseButton, 'touchend', this.togglePause, false);
            global.bind(debugButton, 'touchend', this.cycleDebug, false);
        }

        // hideUrlBarOnLoad
        if (global.mobile) {
            window.scrollTo(0, 1);
        }

        //-------- TITLE SCREEN SETUP --------//
        sound.stop();

        // paused = true; // DEV: ???
        overlay = Images.getImage('img/ui/startscreen.png');
        Images.getImage('img/ui/gameover.png'); //preload gameover screen
        hudView.alpha = 0;

        const start = (e) => {
            global.unbind(this.getViewDom(), e.type, start, false);
            this.start();
        };
        global.bind(this.getViewDom(), global.touch ? 'touchend' : 'mouseup', start, false);

        //-------- SCENE INIT --------//

        const sceneData = global.scenes.enter_the_ninja;
        scene = new Scene(sceneData);
        // scene = null; // DEV: Skip scene

        //-------- MAP INIT --------//

        const map = global.maps[scene.mapName];
        //const map = global.maps['training-hall']; // DEV: Map development

        this.setupMap(map, scene);

        //-------- DEBUG / GUI --------//
        if (global.debug) {
            this.setDebugLevel(global.debug);
        }

        //-------- TRACKING --------//
        this.trackEvent('core', 'inited', version, undefined, true);

        // DEV: Skip opening scene
        // this.resume();
        // this.start({type: global.touch ? 'touchend' : 'mouseup'});
        // this.skipScene({type: global.touch ? 'touchend' : 'mouseup'});
    }

    setupMap(map, scene) {
        console.log('setupMap', map);

        //----- World setup -----//
        if (world.space) {
            if (world.contains(player.attack)) {
                world.remove(player.attack);
            }
            world.remove(player);
            world.remove(boss);
        }

        world.setMap(map);
        collisions.init(world.space);

        worldView.loadMap();
        if (cpDebugView) {
            cpDebugView.setSpace(world.space);
        }
        remainder = 0;

        //----- Player and NPC entity setup -----//

        // monk
        if (!player) {
            global.player = player = new Player({hitPoints: 50}).setInput(userInput);
        }
        world.add(player);

        // ninja
        if (!boss) {
            boss = new Ninja({hitPoints: 50}).setInput(bossInput);
        }
        world.add(boss);

        // scene
        cancelAnimationFrame(this.rafId);
        this.rafId = requestAnimationFrame((time) => {
            if (scene) {
                this.animateScene(time);
            } else {
                this.animate(time);
            }
        });

        // TODO: map.getElementsByType('floor').getPos();

        // TODO: map.getSpawnPoint('Player');
        let spawnPoint = {x: map.width / 2, y: map.height / 2 + 450, z: 30};
        if (map.spawnPoints && map.spawnPoints.length) {
            spawnPoint = map.spawnPoints[0];
        }
        player.setPos(spawnPoint.x, spawnPoint.y, spawnPoint.z);

        // TODO: map.getSpawnPoint('Ninja');
        if (map.spawnPoints && map.spawnPoints.length > 1) {
            spawnPoint = map.spawnPoints[1];
        } else {
            spawnPoint = {x: map.width / 2 + 200, y: map.height / 2, z: 30};
        }
        boss.setPos(spawnPoint.x, spawnPoint.y, spawnPoint.z);

        world.step(TIME_STEP);

        //worldView.zoom(0.75);
        if (scene) {
            scene.init({
                viewport: worldView.camera,
                monk: player,
                ninja: boss
            });

            scene.step(0);
            world.stepScene(TIME_STEP);
        } else {
            bossInput.completeTask();
            worldView.lookAt(player.body.p.x, -player.body.p.y - 64);
        }
    }

    // DEBUG ONLY
    cycleMap() {
        let map = world.map;
        let name = map.name;
        let index = global.mapList.indexOf(name);
        if (index === -1) {
            throw(`Map not found in list "${name}".`);
        }
        if (++index === global.mapList.length) {
            index = 0;
        }
        name = global.mapList[index];
        map = global.maps[name];
        this.setupMap(map, null);
    }

    start() {
        // remove title screen
        overlay = null;

        const skipScene = (e) => {
            global.unbind(this.getViewDom(), e.type, skipScene, false);
            this.skipScene();
        };
        global.bind(this.getViewDom(), global.touch ? 'touchend' : 'mouseup', skipScene, false);

        sound.playGameMusic();
    }

    skipScene() {
        if (!paused && scene && !scene.complete) {
            scene.skip();
        }
    }

    userStarted() {
        if (!global.touch) {
            overlay = Images.getImage('img/ui/guide-move-desktop.png');
            this.trackEvent('game', 'guide', 'guide-move-desktop');
        } else {
            overlay = Images.getImage('img/ui/guide-touch.png');
            this.trackEvent('game', 'guide', 'guide-touch');
        }
        hudView.alpha = 1.0;
    }

    userReady() {
        if (!global.touch) {
            overlay = Images.getImage('img/ui/guide-fight-desktop.png');
            this.trackEvent('game', 'guide', 'guide-fight-desktop');
        }
    }

    userPlaying() {
        overlay = null;
    }

    gameOver() {
        this.trackEvent('game', 'gameover', version);

        cancelAnimationFrame(this.rafId);
        this.rafId = requestAnimationFrame((time) => this.animateGameOver(time));

        overlay = Images.getImage('img/ui/gameover.png');
        global.bind(this.getViewDom(), global.touch ? 'touchend' : 'mouseup', this.restart, false);

        sound.playEndingMusic();
    }

    rollCredits() {
        global.playerInteractions = 36;
        this.trackEvent('game', 'credits', version);

        cancelAnimationFrame(this.rafId);
        this.rafId = requestAnimationFrame((time) => this.animateCredits(time));

        Images.clearCache();
        creditsView = creditsView || new Canvas2dCreditsView();
        creditsView.init(view.context);
        view.removeAll();
        view.add(creditsView);

        global.bind(this.getViewDom(), global.touch ? 'touchend' : 'mouseup', this.restart, false);

        sound.playEndingMusic();
    }

    restart(e) {
        if (creditsView && creditsView.creditsTime < creditsView.skipAfter) {
            return;
        }
        global.unbind(this.getViewDom(), e.type, this.restart, false);

        view.remove(creditsView);
        overlay = null;

        if (world && world.space) {
            if (world.contains(player.attack)) {
                world.remove(player.attack);
            }
            world.remove(player);
            world.remove(boss);
            world.term();
        }

        cancelAnimationFrame(this.rafId);
        this.rafId = requestAnimationFrame((time) => this.init(time));
    }

    animateCredits(time) {
        if (global.debug > 0) {
            debugView.begin();
            if (global.debug === 1) {
                traceTime('animateCredits');
            }
        }

        this.rafId = requestAnimationFrame((time) => this.animateCredits(time));

        let delta = (time - deltaTime);
        deltaTime = time;
        delta = min(max(TIME_STEP, delta), TIME_STEP * 10);

        if (global.debug !== 4) {
            view.draw(delta);
        }
        userInput.pollGamepads();

        if (global.debug > 0) {
            if (global.debug === 1) {
                traceTimeEnd('animateCredits');
            }
            debugView.end();
        }
    }

    animateScene(time) {
        if (!scene.complete) {
            this.rafId = requestAnimationFrame((time) => this.animateScene(time));
        } else {
            console.log('animateScene complete', scene);
            this.rafId = requestAnimationFrame((time) => this.animate(time));
            scene = null;
            //Break when this changes: player.pos.x
            return;
        }

        if (global.debug > 0) {
            debugView.begin();
            if (global.debug === 1) {
                traceTime('animateScene');
            }
        }

        let delta = (time - deltaTime);
        deltaTime = time;

        if (!paused) {
            delta = min(max(TIME_STEP, delta), TIME_STEP * 10);

            scene.step(delta);

            remainder += delta;
            while (remainder >= TIME_STEP) {
                remainder -= TIME_STEP;
                world.stepScene(TIME_STEP);
            }

        } else {
            delta = 0;
        }
        userInput.pollGamepads();

        if (global.debug !== 4) {
            view.draw(delta);
        }

        if (global.debug > 0) {
            if (view3d && !paused) {
                const cam = worldView.camera;
                view3d.lookAt(cam.x + cam.width / 2, cam.y + cam.height / 2, 0);
                view3d.draw(world);
            }
            if (global.debug > 2) {
                cpDebugView.step(view);
            }
            if (global.debug === 1) {
                traceTimeEnd('animateScene');
            }
            debugView.end();
        }
    }

    animate(time) {
        this.rafId = requestAnimationFrame((time) => this.animate(time));

        if (global.debug > 0) {
            debugView.begin();
            if (global.debug === 1) {
                traceTime('animate');
            }
        }

        let delta = (time - deltaTime);// * 0.1;
        deltaTime = time;

        if (!paused) {
            delta = min(max(TIME_STEP, delta), TIME_STEP * 10);

            remainder += delta;
            while (remainder >= TIME_STEP) {
                remainder -= TIME_STEP;
                world.step(TIME_STEP);
            }
            // delta = min(max(TIME_STEP, delta), TIME_STEP*10) * 0.5;
            // world.step(delta);

            if (boss.state === 'dead') {
                boss.decomposed += delta;
                if (boss.decomposed > WATCH_DEAD_BOSS_DURATION) {
                    boss.decomposed = 0;
                    this.rollCredits();
                    return;
                }
            } else if (player.state === 'dead') {
                this.gameOver();
                return;
            }
        } else {
            delta = 0;
            userInput.pollGamepads();
        }

        worldView.lookAt(player.body.p.x, -player.body.p.y - player.z - 64);
        hudView.health = player.hitPoints / 100;
        hudView.rate = player.getHeartRate(delta);

        if (global.debug !== 4) {
            view.draw(delta);
        }

        if (global.debug > 0) {
            if (view3d && !paused) {
                view3d.lookAt(player.body.p.x, -player.body.p.y, player.z + 60);
                view3d.draw(world);
            }
            if (global.debug > 2) {
                cpDebugView.step(view);
            }
            if (global.debug === 1) {
                traceTimeEnd('animate');
            }
            debugView.end();
        }
    }

    animateGameOver(time) {
        this.rafId = requestAnimationFrame((time) => this.animateGameOver(time));

        if (global.debug > 0) {
            debugView.begin();
            if (global.debug === 1) {
                traceTime('animateGameOver');
            }
        }

        let delta = (time - deltaTime);
        deltaTime = time;
        delta = min(max(TIME_STEP, delta), TIME_STEP * 10) * 0.2;
        world.step(delta);

        worldView.lookAt(boss.body.p.x, -boss.body.p.y - boss.z - 64);
        hudView.health = player.hitPoints / 100;
        hudView.rate = player.getHeartRate(delta);

        if (global.debug !== 4) {
            view.draw(delta);
        }

        if (global.debug > 0) {
            if (view3d && !paused) {
                view3d.lookAt(player.body.p.x, -player.body.p.y, player.z + 60);
                view3d.draw(world);
            }
            if (global.debug > 2) {
                cpDebugView.step(view);
            }
            if (global.debug === 1) {
                traceTimeEnd('animateGameOver');
            }
            debugView.end();
        }
    }

    getOverlay() {
        return overlay;
    }

    pause() {
        console.log('pause');
        paused = true;
        view.pause();
        sound.pause();
        allowPinchZoom();
        userInput.clearKeys();
    }

    resume() {
        console.log('resume');
        paused = false;
        view.resume();
        sound.resume();
        preventPinchZoom();
    }

    togglePause() {
        if (paused) {
            this.resume();
        } else {
            this.pause();
        }
    }

    paused() {
        return paused;
    }

    fullscreen() {
        if (global.fullscreen) {
            window.document.body.requestFullscreen();
        }
    }

    resize() {
        if (resizeDisplay()) {
            view.resize(global.width, global.height, global.pixelRatio);
            if (cpDebugView) {
                cpDebugView.resize();
            }
        }
    }

    zoom(value) {
        return worldView.zoom(value);
    }

    getViewDom() {
        return view.getDom();
    }

    getCamera() {
        return worldView.camera;
    }

    setLocal(id, val) {
        try {
            localStorage.setItem(id, val);
        } catch (e) {
            console.error('localStorage.setItem', e);
            this.trackEvent('error', 'localStorage.setItem', e.message, undefined, true);
        }
    }

    getLocal(id, defaultValue, convert, args) {
        const value = localStorage.getItem(id);
        if (value === null && defaultValue !== undefined) {
            return defaultValue;
        }
        if (convert) {
            args = args || [];
            args.unshift(value);
            return convert.apply(null, args);
        }
        return value;
    }

    removeLocal(id) {
        return localStorage.removeItem(id);
    }

    clearLocal() {
        localStorage.clear();
    }


    trackEvent(category, action, label, value, nonInteraction) {
        if (window.gtag) {
            window.gtag('event', action, {
                event_category: category,
                event_action: action,
                event_label: label,
                value: value,
                non_interaction: !!nonInteraction
            });
        }
    }

    setDebugLevel(level) {
        level = isNaN(level) ? 0 : level;
        if (level < 0) {
            level = 4;
        }
        cpDebugView = cpDebugView || new ChipmunkDebugView(world.space);
        debugView = debugView || new DebugView();
        if (window.THREE) {
            view3d = view3d || new ThreeJsWorldView();
        }

        debugView.hide();
        cpDebugView.hide();
        if (view3d) {
            view3d.hide();
        }

        switch (level) {
        case 4:
        case 3:
            cpDebugView.show();
            if (view3d) {
                view3d.show(level === 4);
                view3d.draw(world);
                if (view3d.getDom().style.pointerEvents !== 'none') {
                    view3d.getDom().style.pointerEvents = 'none';
                }
                if (!global.touch) {
                    // debugView.worldGui(world);
                    // view.debugGui(debugView);
                    view3d.debugGui(debugView);
                }
            }
        /*falls through*/
        case 2:
        case 1:
            debugView.show();
        }
        global.debug = level;
        this.setLocal('debug', level);
        console.log('debug level', level);
    }

    cycleDebug() {
        this.setDebugLevel(global.debug - 1);
    }
}
