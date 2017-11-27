import global from '../global.js';
import { traceTime, traceTimeEnd } from '../logging.js';
import TextField from './TextField.js';
import Images from '../controllers/Images.js';

export default class Canvas2dMapView {

    constructor() {
        this.layers = [];

        if (global.debug > 1 && this.constructor === Canvas2dMapView) {
            Object.seal(this);
        }
    }

    loadLayers(data) {
        const layers = this.layers = data.layers;
        // TODO: preload images
        for (let i = layers.length; i-- > 0;) {
            this.loadLayer(layers[i], data.path);
        }
    }

    loadLayer(layer, path) {
        if (layer.visible !== false) {
            layer.visible = true;
        }
        for (var i = layer.elements.length; i-- > 0;) {
            layer.elements[i].loadImages(path);
        }
    }

    getLayers() {
        return this.layers || [];
    }

    getItemsInLayer(layer, entities, inLayer) {
        inLayer = inLayer || [];
        var elements = layer.elements;
        //var bounds = layer.bounds;
        for (var i = entities.length; i-- > 0;) {
            var entity = entities[i];
            if (!entity.isStatic()) {
                entity.layerNum = -1;
            }
            for (var j = elements.length; j-- > 0;) {
                if (entity.layerNum === layer.layerNum || elements[j].isBehindEntity(entity)) {
                    entity.layerNum = layer.layerNum;
                    entity.layerName = layer.name;
                    entities.splice(i, 1);
                    inLayer.push(entity);
                    break;
                }
            }
        }
        return inLayer;
    }

    draw(context, viewport) {
        var layers = this.layers;
        for (var i = layers.length; i-- > 0;) {
            this.drawLayer(layers[i], context, viewport);
        }
    }

    drawLayer(layer, context, viewport, delta) {
        if (!layer.visible) {
            return false;
        }
        var elements = layer.elements;
        for (var i = 0, len = elements.length; i < len; i++) {
            //elements[i].alpha = layer.alpha || 1;
            drawElement(elements[i], context, viewport, delta);
        }
        return true;
    }
}

function drawElement(element, context, viewport /*, delta */) {
    if (!element.visible) {
        return false;
    }
    if (element.imageData || element.children) {
        if (element.width === 0 || intersects(element, viewport)) {
            context.save();
            if (element.alpha !== null) {
                context.globalAlpha = element.alpha;
            }
            var matrix = element.matrix;
            if (matrix) {
                context.transform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx - element.regX * matrix.a, matrix.ty - element.regY * matrix.d);
            } else {
                context.transform(1, 0, 0, 1, element.drawX, element.drawY);
            }

            if (element.children) {
                var children = element.children;
                for (var i = 0; i < children.length; i++) {
                    var child = children[i];
                    if (element.width || intersects(child, viewport)) {
                        if (child.image && child.imageData) {
                            drawImage(child, context);
                        } else {
                            drawShape(child, context);
                        }
                    }
                }
            }
            if (element.imageData) {
                drawImageInplace(element, context);
            }
            context.restore();
        }
    }
    if (global.debug > 1) {
        //draw sort bounds
        var bounds = element.getSortBounds();
        // check viewport intersection
        if (element.x - element.width / 2 <= viewport.r && viewport.l <= element.x + element.width / 2 &&
        bounds.back <= viewport.b && viewport.t <= (bounds.back + (bounds.front - bounds.back))) {
            var debugColor = (element.mapType === 'floor') ? '#f00' : '#f0f';

            element.label = element.label || new TextField(context, 0, 0, 512, null, debugColor);
            element.label.setPos(16 + element.x - element.width / 2, bounds.back + 2);
            element.label.setText(element.name + ': ' + element.mapType + ' (' + element.y + ', ' + element.z + ', ' + element.depth + ', ' + element.height + ', ' + element.mHeight + ')' + bounds.back + ',' + bounds.front);

            context.strokeStyle = debugColor;
            context.lineWidth = 1;
            context.beginPath();
            //front/back
            context.rect(element.x - element.width / 2, bounds.back, element.width, bounds.front - bounds.back);
            //top bottom(z)?
            //context.rect(element.x-element.width/2, element.y-bounds.top, element.width, element.y);
            context.stroke();
        }
    }
    return true;
}

function drawShape(shape, context) {
    if (global.debug === 1) {
        traceTime('drawShape ' + shape.fillImage);
    }
    if (shape.fillImage) {
        var drawable = Images.getCached(shape.imageData, shape.fillImage);
        context.fillStyle = context.createPattern(drawable, 'repeat');
    } else {
        context.fillStyle = shape.fillColor || '#00f';
    }

    if (shape.polygons) {
        context.save();
        context.translate(shape.x, shape.y);
        for (var i = 0; i < shape.polygons.length; i++) {
            drawPolygon(shape.polygons[i], context);
        }
        context.restore();

    } else if (shape.circle) {
        // TODO: oval and center x, y
        context.beginPath();
        context.arc(shape.x, shape.y, shape.width / 2, 0, 2 * Math.PI, false);
        context.fill();

    } else if (shape.rectangle) {
        // TODO: clip to context bounds
        context.fillRect(shape.x, shape.y, shape.width, shape.height);
    } else {
        if (global.debug === 1) {
            traceTimeEnd('drawShape ' + shape.fillImage);
        }
        throw('what kind of shape is this? ' + shape);
    }

    if (global.debug === 1) {
        traceTimeEnd('drawShape ' + shape.fillImage);
    }
    return true;
}

function drawPolygon(polygon, context) {
    // TODO: clip to context bounds
    context.beginPath();
    var i = 0;
    context.moveTo(polygon[i][0], polygon[i][1]);
    for (i = 1; i < polygon.length; i++) {
        context.lineTo(polygon[i][0], polygon[i][1]);
    }
    context.fill();
    return true;
}

function drawImage(element, context) {
    if (global.debug === 1) {
        traceTime('drawImage map child ' + element.image);
    }
    var drawable = Images.getCached(element.imageData, element.image);
    context.drawImage(drawable, element.x, element.y, element.width, element.height);
    if (global.debug === 1) {
        traceTimeEnd('drawImage map child ' + element.image);
    }
    return true;
}

function drawImageInplace(element, context) {
    if (global.debug === 1) {
        traceTime('drawImage map ' + element.image);
    }
    var drawable = Images.getCached(element.imageData, element.image);
    context.drawImage(drawable, 0, 0);
    if (global.debug === 1) {
        traceTimeEnd('drawImage map ' + element.image);
    }
}

function intersects(element, viewport) {
    //return true;
    return (element.drawX <= viewport.r && viewport.l <= (element.drawX + element.width) &&
    element.drawY <= viewport.b && viewport.t <= (element.drawY + element.height));
}

/*
function containsViewPort(element, viewport) {
    return (element.drawX <= viewport.l && viewport.r >= (element.drawX + element.width) &&
    element.drawY <= viewport.t && viewport.b >= (element.drawY + element.height));
}

function insideViewPort(element, viewport) {
    return (viewport.l <= element.drawX && (element.drawX + element.width) >= viewport.r &&
    viewport.t <= element.drawY && (element.drawY + element.height) >= viewport.b);
}
*/
