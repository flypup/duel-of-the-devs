import global from '../global.js';
import SpriteSheets from './SpriteSheets.js';
import Images from '../controllers/Images.js';

function easeInElastic(x, t, b, c, d) {
    let s = 1.70158;
    let p = 0;
    let a = c;
    if (t == 0) return b;
    if ((t /= d) == 1) return b + c;
    if (!p) p = d * .3;
    if (a < Math.abs(c)) {
        a = c;
        s = p / 4;
    } else {
        s = p / (2 * Math.PI) * Math.asin(c / a);
    }
    return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
}

export default class HUDView {

    constructor() {
        this.width = 0;
        this.height = 0;
        this.pixelRatio = 1.0;

        this.alpha = 1.0;
        this.scale = 1.0;

        this.health = 1.0;
        this.rate = 1.0;
        this.lifetime = 0.0;

        if (global.debug > 1 && this.constructor === HUDView) {
            Object.seal(this);
        }
    }

    draw(context, delta) {

        this.lifetime += delta;

        var bgHeart = SpriteSheets.heart.getFrame(1);
        var tpHeart = SpriteSheets.heart.getFrame(0);
        if (bgHeart) {
            var x = 25 + bgHeart.regX;
            var y = 20 + bgHeart.regY;
            var rect = bgHeart.rect;

            context.save();

            var beatMilliseconds = 1000 / this.rate;
            var scale = (this.scale + easeInElastic(0, this.lifetime % beatMilliseconds, 1.0, 0.2, beatMilliseconds)) / 2;

            context.setTransform(scale, 0, 0, scale, x, y);
            this.scale = scale;

            if (this.health < 1.0) {
                context.globalAlpha = this.alpha;
                context.drawImage(Images.getCached(bgHeart.image), rect.x, rect.y, rect.width, rect.height, -bgHeart.regX, -bgHeart.regY, rect.width, rect.height);
            }

            context.globalAlpha = this.health * this.alpha;
            rect = tpHeart.rect;
            context.drawImage(Images.getCached(tpHeart.image), rect.x, rect.y, rect.width, rect.height, -tpHeart.regX, -tpHeart.regY, rect.width, rect.height);

            context.restore();
        }
    }

    resize(width, height, ratio) {
        this.width = width * ratio;
        this.height = height * ratio;
        this.pixelRatio = ratio;
    }

}
