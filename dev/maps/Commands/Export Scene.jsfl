/*
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
var fileName = document.name.replace(/\.[^\.]+$/, '');
var dir = document.path.replace(/[\/\\][^\/\\]+$/, '');
var exportDir = FLfile.platformPathToURI(dir +'/../../app/data/')+ fileName;

var data = {};
data.map = fileName;
data.path = "data/"+ fileName;
//data.name / data.scenes

var layers = document.getTimeline().layers;
var layerIndex = 0;

fl.trace('Exporting Frame Data for '+document.getTimeline().name+'...');
for (var i = layers.length; i-- > 0;) {
	var layer = layers[i];
	if (layer.visible && layer.layerType === "normal") {

		fl.trace('"'+ layer.name +'"\t'+ layerIndex +'\t'+ layer.frameCount +' '+ layer.animationType);

		// TODO: get keyframes
		var frames = layer.frames;
		for (var k=0; k<frames.length; k++) {
			var  frame = frames[k];
			if (frame.startFrame === k) {
				//keyframe


				fl.trace(
					frame.startFrame +'\t'+
					'"'+
					frame.name +'"\t'+
					frame.duration +'\t'+
					// '"'+ frame.tweenInstanceName +'"\t'+
					frame.tweenType +'\t'+
					frame.tweenEasing +'\t'+
					(frame.actionScript ? '\tAS' : '') +'\t'+
					frame.elements +'\t'+ (frame.elements.length ? '"'+(frame.elements[0].name||('unnamed instance '+frame.elements[0].instanceType))+'"' : '(no instances)')+
					(frame.hasCustomEase ? '\r\t\t'+ frame.getCustomEase() : '') +
					(frame.isMotionObject() ? '\r\t\t'+ frame.getMotionObjectXML() : '') +
					(frame.soundLibraryItem ? '\r\t\t'+ frame.soundName +'\t'+ frame.soundLoopMode +'\t'+ frame.soundLoop : '')
				);

				//symbolInstance.actionScript
				//soundItem.sourceFilePath | soundItem.exportToFile()
				
			}
		} 
		
		layerIndex++;
	}
}
