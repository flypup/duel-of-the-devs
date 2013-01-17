/* -------------------------------------------------------------------------
 *	@author Rob Walch
*/

/* -------------------------------------------------------------------------
	JSON.stringify
*/
if (typeof JSON !== 'object') {
	JSON = {};
}
(function () {
    function f(n) {
        return n < 10 ? '0' + n : n;
    }
    if (typeof Date.prototype.toJSON !== 'function') {
        Date.prototype.toJSON = function (key) {
            return isFinite(this.valueOf()) ? this.getUTCFullYear()     + '-' +
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
            return typeof c === 'string' ? c
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
                v = partial.length === 0 ? '[]'
                    : gap ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
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
            v = partial.length === 0 ? '{}'
                : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
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

/* -------------------------------------------------------------------------
	Export Keyframe, Instance Props, Component Params and Script Comments to JSON Scene Data
*/

var document = fl.getDocumentDOM();
var timeline = document.getTimeline();

var fileName = document.name.replace(/\.[^\.]+$/, '');

// if this is not the main timeline (Scene 1), use the parent clip's name, otherwise use the file name
var sceneName = (timeline.name.indexOf('Scene') === -1)
	? timeline.name
	: fileName;

var dir = document.path.replace(/[\/\\][^\/\\]+$/, '');

var data = {};
data.name = sceneName;
data.map = fileName;
//data.path = 'data';
data.fps = document.frameRate;
data.useFrames = true;
data.duration = 0;
data.tracks = [];

var layers = timeline.layers;
var layerIndex = 0;
var elements = [];

fl.trace('Exporting Frame Data for '+timeline.name+'...');
for (var i = layers.length; i-- > 0;) {
	var layer = layers[i];
	if (layer.name === 'map') {
		// get map name from instance or library item name
		var instance = layer.frames[0].elements[0];
		data.map = instance.name || instance.libraryItem.timeline.name;

	} else if (layer.visible && layer.layerType === 'normal') {

		fl.trace('"'+ layer.name +'"\t'+ layerIndex +'\t'+ layer.frameCount +' '+ layer.animationType);

		data.duration = Math.max(data.duration, layer.frameCount);

		// get keyframes
		var keyframes = getLayerKeyframes(layer);
		//ignore layers with no keyframe data
		if (keyframes.length === 0) {
			continue;
		}

		var elementData = {};
		var trackData = {
			name: layer.name,
			element: elementData,
			duration: layer.frameCount,
			keyframes: []
		};
		var libraryItem = null;
		
		data.tracks.push(trackData);

		for (var k=0; k<keyframes.length; k++) {
			var frame = keyframes[k];

			var element = frame.elements[0];
			libraryItem = element ? element.libraryItem : '';

			// ------ TRACE IT ALL!!! ----- //
			fl.trace(
				frame.startFrame +'\t'+
				'"'+
				frame.name +'"\t'+
				frame.duration +'\t'+
				// '"'+ frame.tweenInstanceName +'"\t'+
				frame.tweenType +'\t'+
				frame.tweenEasing +'\t'+
				(frame.actionScript ? '\tAS' : '') +'\t'+
				frame.elements +'\t'+ (frame.elements.length ? '"'+(frame.elements[0].name||('unnamed instance '+frame.elements[0].instanceType))+'"' : '(no instances)') +'\t'+
				libraryItem.itemType +
				(frame.hasCustomEase ? '\r\t\t'+ frame.getCustomEase() : '') +
				(frame.isMotionObject() ? '\r\t\t'+ frame.getMotionObjectXML() : '') +
				(frame.soundLibraryItem ? '\r\t\t'+ frame.soundName +'\t'+ frame.soundLoopMode +'\t'+ frame.soundLoop : '')
			);
			//symbolInstance.actionScript
			//soundItem.sourceFilePath | soundItem.exportToFile()

			var keyframeData = {
				start:    frame.startFrame,
				duration: frame.duration
			};

			if (frame.elements.length === 0) {
				// empty
				keyframeData.empty = true;

			} else if (frame.elements.length === 1) {

				// index element, layer
				var element = frame.elements[0];
				if (element.elementType !== 'instance') {
					throw('Element type not supported ('+ element.elementType +'). Layer "'+ layer.name +'" frame '+ frame.startFrame);
				} else if (element.instanceType !== 'symbol') {
					throw('What am I supposed to do with a '+ element.instanceType +'?. Layer "'+ layer.name +'" frame '+ frame.startFrame);
				} else if (element.symbolType === 'button') {
					throw('A button symbol, really?. Layer "'+ layer.name +'" frame '+ frame.startFrame);
				}
				if (libraryItem && libraryItem !== element.libraryItem) {
					throw('Instance library item changed in track ("'+ libraryItem.name +'" -> "'+ element.libraryItem.name +'"). Layer "'+ layer.name +'" frame '+ frame.startFrame);
				}
				libraryItem = element.libraryItem;
				if (!elementData.name) {
					elementData.name = element.name || libraryItem.timeline.name;
					// TODO: element type: Entity, Camera, Light, FX, etc...
					elementData.type = libraryItem.linkageClassName || libraryItem.timeline.name;
				}
				// default props
				keyframeData.x = element.x;
				keyframeData.y = element.y;

				//custom props
				if (libraryItem.itemType === 'component') {
					var params = parseParameters(element.parameters);
					if (!(element instanceof ComponentInstance)) {
						fl.trace('Instance of component should be a component instance, not a symbol instance. (Can\'t get params). SAVE AND REPOPEN THE FLA.');
						
						// var pos = {x: element.x, y: element.y};
						// timeline.setSelectedLayers(i);
						// timeline.setSelectedFrames(frame.startFrame, frame.startFrame);
						// frame.elements.length = 0;

						// document.addItem(pos, libraryItem);
						// element = frame.elements[0];
						// TODO: replace element
					}
					if (params.z === 0) {
						keyframeData.z = params.z;
					} else {
						keyframeData.z = params.z || params.mZ;
					}
					if (params.action) {
						keyframeData.action = params.action;
					}
					// TODO: 'standing on' map element reference?
					// TODO: 'action' : 'jump', 'punch', 'taunt', etc...
				}

				// optional props
				if (element.colorAlphaPercent !== 100) {
					keyframeData.alpha = Math.max(element.colorAlphaPercent, 0);
				}
				if (!element.visible) {
					keyframeData.visible = false;
				}
				if (frame.tweenType !== 'none' && k < keyframes.length-1) {
					keyframeData.tween = true;
					if (frame.hasCustomEase) {
						keyframeData.ease = 'inout';
					} else if (frame.tweenEasing > 0) {
						keyframeData.ease = 'out';
					} else if (frame.tweenEasing < 0) {
						keyframeData.ease = 'in';
					}
				}

			} else {
				// multiple elements in frame
				throw('Multiple elements in one layer/keyframe not supported. Layer "'+ layer.name +'" Frame '+ frame.startFrame);
			}

			trackData.keyframes.push(keyframeData);
		} 
		
		layerIndex++;
	}
}

var output = JSON.stringify(data, null, 2);

var exportDir = FLfile.platformPathToURI(dir +'/../../app/data/scenes');
FLfile.createFolder(exportDir);
FLfile.write(exportDir +'/'+sceneName+'.js', 'ec && ec.loadScene('+output+');');
fl.trace('Scene exported to '+exportDir);//+'\r'+ output);

function getLayerKeyframes(layer) {
	var keyframes = [];
	var frames = layer.frames;
	for (var i=0; i<frames.length; i++) {
		if (frames[i].startFrame === i) {
			//frame.elements, frame.elements.length, frame.elements[0].name, frame.elements[0].instanceType
			keyframes.push(frames[i]);
		}
	}
	//ignore empty layer frames
	if (keyframes.length === 1) {
		if (!keyframes.elements || keyframes.elements.length === 0) {
			return [];
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
