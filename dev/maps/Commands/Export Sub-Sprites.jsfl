/* -------------------------------------------------------------------------
 *	@author Rob Walch
*/

/* -------------------------------------------------------------------------
	JSON.stringify
*/
if (typeof JSON !== 'object') {
    window.JSON = {};
}
(function () {
    'use strict';
    function f(n) {
                return n < 10 ? '0' + n : n;
    }
    if (typeof Date.prototype.toJSON !== 'function') {
        Date.prototype.toJSON = function (key) {
            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                : null;
        };
        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }
    var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {                '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;
    function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }
    function str(key, holder) {
        var i, k, v, length,
            mind = gap,
            partial,
            value = holder[key];
        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }
        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }
        switch (typeof value) {
        case 'string':
            return quote(value);
        case 'number':
            return isFinite(value) ? String(value) : 'null';
        case 'boolean':
        case 'null':
            return String(value);
        case 'object':
            if (!value) {
                return 'null';
            }
            gap += indent;
            partial = [];
            if (Object.prototype.toString.apply(value) === '[object Array]') {
                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }
                v = partial.length === 0
                    ? '[]'
                    : (gap && (typeof value[0] !== 'number') && (typeof value[0] !== 'object'))
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                    // : (gap && (typeof value[0] !== 'number'))
                    // ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    // : '[' + partial.join(', ') + ']';
                gap = mind;
                return v;
            }
            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {
                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }
            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }
    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {
            var i;
            gap = '';
            indent = '';
            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }
            } else if (typeof space === 'string') {
                indent = space;
            }
            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }
            return str('', {'': value});
        };
    }
}());

/* -------------------------------------------------------------------------
	Clear Output
*/

fl.outputPanel.clear();
fl.drawingLayer.beginDraw(false);
fl.drawingLayer.endDraw();

/* -------------------------------------------------------------------------
	Export Keyframe, Instance Props, Component Params and Script Comments to JSON Scene Data
*/

var subPixelRounding = 2;

var _dom = fl.getDocumentDOM();
var dir = _dom.path.replace(/[\/\\][^\/\\]+$/, '');
var exportDir = FLfile.platformPathToURI(dir +'/../../app/img/sprite');
FLfile.createFolder(exportDir);

// Use selected element timeline or current timeline?
var selectedElements = fl.getDocumentDOM().selection;
if (selectedElements.length) {
	fl.trace('Exporting selected instances.');
	for (var i = selectedElements.length; i--;) {
		var element = selectedElements[i];
		var sx = element.scaleX;
		var sy = element.scaleY;
		if (element.elementType === 'instance' && element.instanceType === 'symbol') {
			var symbolItem = element.libraryItem;
			var spriteName = (selectedElements.length === 1) ? _dom.getTimeline().name : null;
			exportSubSpriteData(symbolItem.timeline, spriteName, sx, sy);
		}
	}
} else {
	exportSubSpriteData(_dom.getTimeline());
}

function exportSubSpriteData(timeline, name, scaleX, scaleY) {
	name = name || timeline.name;
	scaleX = scaleX || 1;
	scaleY = scaleY || scaleX;

	var data = {};
	data.name = name;

	var layers = timeline.layers;
	var elements = [];

	fl.trace('Exporting Frame Data for '+name+'...'+JSON.stringify(timeline, null, 2));

	// First pass, find visible layers (center) for z offset of guides
	var exportLayerIndex = 0;
	var layerIndex = 0;
	var i, len = layers.length, layer;
	for (i = len; i--;) {
		layer = layers[i];
		if (layer.visible) {
			if (layer.layerType === 'normal') {
				exportLayerIndex = layerIndex;
				fl.trace(layerIndex +'+'+ layer.layerType +' "'+ layer.name +'"\t'+ layer.frameCount +' '+ layer.animationType);
			} else {
				fl.trace(layerIndex +' '+ layer.layerType +' "'+ layer.name +'"\t'+ layer.frameCount +' '+ layer.animationType);
			}
			layerIndex++;
		}
	}
	fl.trace('Found index layer '+ exportLayerIndex +'. Examining keyframes...');
	// Get positions of guide layers on each frame
	layerIndex = 0;
	for (i = len; i--;) {
		layer = layers[i];
		if (layer.visible) {
			//fl.trace(i +' '+ layer.layerType);
			if (layer.layerType === 'guide') {

				// get keyframes
				var keyframes = getLayerKeyframes(layer);

				fl.trace(layerIndex +' "'+ layer.name +'"\tframes: '+ layer.frameCount +' '+ layer.animationType +'\tkeyframes: '+ keyframes.length);

				//ignore layers with no keyframe data
				if (keyframes.length === 0) {
					continue;
				}

				// merge layers with same name
				framesData = data[layer.name] || [];
				data[layer.name] = framesData;

				var libraryItem = null;

				for (var k=0; k<keyframes.length; k++) {
					var frame = keyframes[k];

					if (frame.elements.length === 0) {
						// empty
						framesData[frame.startFrame] = 0;

					} else if (frame.elements.length === 1) {

						var frameData = [];
						framesData[frame.startFrame] = frameData;
						if (frame.duration > 1) {
							for (var l=1; l<frame.duration; l++) {
								framesData[frame.startFrame + l] = frameData;
							}
						}

						var element = frame.elements[0];
						libraryItem = element ? element.libraryItem : '';

						frameData[0] = Math.round(element.x * scaleX * subPixelRounding) / subPixelRounding;
						frameData[1] = Math.round(element.y * scaleY * subPixelRounding) / subPixelRounding;
						frameData[2] = layerIndex - exportLayerIndex;
						frameData[3] = element.firstFrame | 0;

					} else {
						// multiple elements in frame
						throw('Multiple elements in one layer/keyframe not supported. Layer "'+ layer.name +'" Frame '+ frame.startFrame);
					}
				}
			}
			layerIndex++;
		}
	}

	var output = JSON.stringify(data, null, 2);

	FLfile.write(exportDir +'/'+name+'.json', output);
	fl.trace('Scene exported to '+exportDir);//+'\r'+ output);
}

function getLayerKeyframes(layer) {
	var keyframes = [];
	var frames = layer.frames;
	var frame;
	for (var i=0; i<frames.length; i++) {
		frame = frames[i];
		//fl.trace(i +' '+ frame.startFrame);
		if (frame.startFrame === i) {
			//Exclude empty Keyframes
			if (frame.elements && frame.elements.length) {
				keyframes.push(frame);
			}
		}
	}
	return keyframes;
}

/* -------------------------------------------------------------------------
	Parse Component Instance Parameters
*/

function parseParameters(componentInstanceParameters) {
	var parameters = {};
	if (componentInstanceParameters) {
		for (var i=0;  i<componentInstanceParameters.length;  i++) {
			var parameter = componentInstanceParameters[i];
			var value = parameter.value;
			if (parameter.valueType === 'Number') {
				value = parseFloat(value);
			} else if (parameter.valueType === 'List') {
				value = value[parameter.listIndex].value;
			}
			parameters[parameter.name] = value;
		}
	}
	return parameters;
}

function extend(target, source) {
    for ( var prop in source ) {
		if ( source.hasOwnProperty( prop ) ) {
            if ( !target.hasOwnProperty( prop ) ) {
				var copy = source[ prop ];
				if (copy !== undefined) {
					target[ prop ] = source[ prop ];
				}
            }
        }
    }
    return target;
}
