/* -------------------------------------------------------------------------
 *	@author Rob Walch
*/


// enable double clicking from the Macintosh Finder or the Windows Explorer
#target photoshop

// in case we double clicked the file
//app.bringToFront();

/* -------------------------------------------------------------------------
	JSON.stringify
*/
(function () {
    'use strict';
	if (typeof JSON !== 'object') {
	    JSON = {};
	}
    function f(n) {
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function () {

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
            Boolean.prototype.toJSON = function () {
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
	Output
*/

// debug level: 0-2 (0:disable, 1:break on error, 2:break at beginning)
$.level = 1;
//debugger; // launch debugger on next line

// var msg = "";
// msg += "Script Engine version: " + $.version + "\r";
// msg += "OS version: " + $.os + "\r";
// alert(msg);

/* -------------------------------------------------------------------------
	Export Shapes, MovieClips and Component Instances to JSON map data
*/

var doc = app.activeDocument;
var data = {};
var layerIndex = 0;
var exports = {
    folder: null,
    elementsFolder: null,
    entitiesFolder: null,
    files: {},
    names: {}
};

main();

function main() {
    assert(app.documents.length > 0, 'Open a map PSD and try again.');

    var saved = doc.saved;
    assert(saved, 'Save this PSD and try again.');

    try {
        saved = doc.fullName;
    } catch(err) {
        saved = false;
    }
    assert(saved, 'Select the Map PSD or save this one and try again.');

    assert(doc.width.type === 'px', 'Please use pixels as the base unit and try again.');

    log('========================================');

    app.displayDialogs = DialogModes.ALL;
    var activeLayer = doc.activeLayer;

    var mapName = doc.name.replace(/\.psd/, '');

    var exportPath  = doc.path.toString() +'/../../app/data/'+ mapName;
    var relativePath = '/../app';
    for (var i=3; i--;) {
        if (new Folder(doc.path.toString() +relativePath).exists) {
            exportPath = doc.path.toString() +relativePath+'/data/'+ mapName;
            break;
        }
        relativePath = '/..'+ relativePath;
    }

    log('map Name:', mapName);
    log('export Path:', exportPath);

    exports.folder = new Folder(exportPath);
    var created = exports.folder.create();
    assert(created, 'Could not create export folder', quote(exports.folder));

    exports.elementsFolder = new Folder(exportPath + '/elements');
    created = exports.elementsFolder.create();
    assert(created, 'Could not create elements export folder', quote(exports.elementsFolder));
    //exports.entitiesFolder

    data.name = mapName;
    data.path = 'data/'+ mapName;
    data.width  = doc.width.value;
    data.height = doc.height.value;
    data.layers = [];
    data.entities = [];

    parseLayers(doc.layers, null);

    log('----------------------------------------');

    exportJSON(data, exports.folder.toString() +'/data.js');

    doc.activeLayer = activeLayer;
}

function parseLayers(layers, mapLayer) {
    log('>', layers.length, 'Layers');

    for (var i = layers.length; i-- > 0;) {
        var layer = layers[i];

        if (layer.typename === 'ArtLayer') {
            log('--', layerIndex, layer.typename +' "'+ layer.name +'",', layer.kind +',', (layer.visible?'':' hidden'));
        } else if (layer.typename === 'LayerSet') {
            log('--', layerIndex, layer.typename +' "'+ layer.name +'" ('+ layer.layers.length +' sub layers)', (layer.visible?'':' hidden'));
        } else {
            log('--', layerIndex, layer.typename +' "'+ layer.name +'",', (layer.visible?'':' hidden'));
        }

        if (layer.name.toLowerCase().indexOf('guide') > -1) {
            log('\tIgnoring guide layer', quote(layer.name));
            continue;
        } else if (!layer.visible) { // && layer.typename === 'LayerSet'
            log('\tIgnoring hidden layer', quote(layer.name));
            continue;
        }

        if (layer.blendMode !== BlendMode.NORMAL && layer.blendMode !== BlendMode.PASSTHROUGH) {
            log('\tBlend Mode not supported', layer.blendMode);
        }

        if (layer.typename === 'ArtLayer') {
            parseArtLayer(layer, mapLayer);

        } else if (layer.typename === 'LayerSet') {
            parseLayerSet(layer, mapLayer);
        }
    }
}

//-----------

function parseArtLayer(layer, mapLayer) {
    log('\t*** parseArtLayer *** ', layer, mapLayer);
    //getOldElementData(layer, mapLayer)
    /*
    LayerKind.NORMAL,      <--- export image?
    LayerKind.PATTERNFILL, <---
    LayerKind.SMARTOBJECT, <---
    LayerKind.SOLIDFILL,   <--- (Paths)
    LayerKind.TEXT         <--- Data?
    */
}

function parseLayerSet(layerSet, mapLayer) {
    if (layerSet.name.toLowerCase().indexOf('group') > -1) {
    //if (layerSet.blendMode === BlendMode.PASSTHROUGH) {
        log('----- passing through group -----');
        parseLayers(layerSet.layers, mapLayer);
        log('---------------------------------');
        return;
    }

    if (layerSet.name.toLowerCase().indexOf('entities') > -1) {
        // TODO: parse Entity sub layers
        return;
    }

    // new map layer
    if (!mapLayer) {
        log('\t+ new layer');
        mapLayer = {
            name: layerSet.name,
            elements: []
        };
        if (!layerSet.visible) {
            mapLayer.visible = false;
        }
        data.layers.push(mapLayer);
        layerIndex++;
    }

    var elements = mapLayer.elements;

    // if (mapLayer.name === 'bg layer') {debugger;}

    var elementData = getElementData(layerSet);
    if (elementData.shapes.length) {
        log('\t+ new element');
        // Get the other stuff (images, childres, etc...)
        elements.push(elementData);

        //reg point
        var regX = 0, regY = 0;
        if (elementData.shape === 'polygons') {
            var regPoint = getPolygonCentroid(elementData.shapes[0].polygons[0]);
            regX = Math.round(regPoint[0]);
            regY = Math.round(regPoint[1]);
        } else if (elementData.shape === 'oval') {
            regX = elementData.shapes[0].width /2;
            regY = elementData.shapes[0].height /2;
        }

        extend(elementData, {
            name: layerSet.name,
            x: getLayerX(layerSet) + regX,
            y: getLayerY(layerSet) + regY + elementData.z,
            regX: regX,
            regY: regY,
            width : getLayerWidth(layerSet),
            height: getLayerHeight(layerSet)
        });

        // TODO: determine if this set will be exported as one image, or if we export sub layers:
        //var otherLayers = elementData.layers;
        delete elementData.layers;
        //parseLayers(otherLayers, mapLayer, elementData);

        // export PNG
        var filename = getLayerImageName(layerSet) +'.png';
        var filepath = exports.elementsFolder.toString() +'/'+ filename;
        exportLayer(layerSet, filepath);
        elementData.image = 'elements/'+filename;

    } else {
        parseLayers(layerSet.layers, mapLayer);
    } // else add children, if (!mapType) mapType = 'container'

    //-------------
        // var layerContainer = {
        //     mapType: 'container',//'parallax'
        //     children: []
        // };
        // var layerFrameElements = [];//layerSet.frames[0].elements;
        // for (var j=0;  j<layerFrameElements.length;  j++) {
        //     var element = layerFrameElements[j];
        //     var eData = getOldElementData(element);
        //     if (element.elementType === 'instance') {
        //         elements.push(eData);
        //     } else if (element.elementType === 'shape' || element.elementType === 'bitmap') {
        //         layerContainer.children.push(eData);
        //     }
        // }
        // if (layerContainer.children.length) {
        //     elements.push(layerContainer);
        // }
        // log(layerIndex+'\t\t"'+
        //     layerSet.name +'"\t\t'+
        //     (layerContainer.children.length ? (layerContainer.children.length+' children') : (elements.length+' elements'))
    // );
}

function getLayerImageName(layer) {
    var name = layer.name.replace(/[^a-z0-9]+/gi, '_').toLowerCase();
    if (exports.names[name]) {
        log('\tWARNING: Layer name', quote(name), 'is not unique. x', exports.names[name]);
        exports.names[name]++;
    } else {
        exports.names[name] = 1;
    }
    return name;
}

function exportLayer(layer, filepath) {
    var file = exports.files[filepath];
    if (file) {
        log('\tWARNING: A file with same name has already been exported '+ quote(filepath));
        alert('A file with same name has already been exported '+ quote(filepath));
        return;
    }

    app.displayDialogs = DialogModes.ERROR; //DialogModes.NO;
    // duplicate layer into new document and trim
    var tempDoc = app.documents.add(
        doc.width, doc.height, doc.resolution,
        layer.name, // replace spaces with underscore
        NewDocumentMode.RGB,
        DocumentFill.TRANSPARENT,
        1.0,
        BitsPerChannelType.EIGHT,
        '' // color profile
    );
    app.activeDocument = doc;
    var dupeLayer = layer.duplicate(tempDoc, ElementPlacement.PLACEATBEGINNING);
    app.activeDocument = tempDoc;
    hideElementData(dupeLayer);
    tempDoc.trim(TrimType.TRANSPARENT);

    // check width and height
    if ( getLayerWidth(dupeLayer) ) {
        // export PNG
        var opts = new ExportOptionsSaveForWeb();
        opts.format = SaveDocumentType.PNG;
        opts.PNG8 = false;
        opts.quality = 100;
        //opts.matteColor = RGB black, white or best match ?

        file = exports.files[filepath] = new File(filepath);
        log('\texported:', quote(file));
        tempDoc.exportDocument(file, ExportType.SAVEFORWEB, opts);
    }

    tempDoc.close(SaveOptions.DONOTSAVECHANGES);

    //restore doc
    app.activeDocument = doc;
    app.displayDialogs = DialogModes.ALL;
}

function exportJSON(data, filepath) {
    var output = JSON.stringify(data, null, 2);
    var exportFile = new File(filepath);
    var opened = exportFile.open('w');
    assert(opened, 'Could not access file', quote(exportFile));
    var written = exportFile.write('ec && ec.loadMap('+output+');\n');
    assert(written, 'Could not write to file', quote(exportFile));
    log('exported:', exportFile.toString());
}

//-----------

function hideElementData(layer) {
    var layers = layer.artLayers;
    if (layers) {
        for (var i = layers.length; i-- > 0;) {
            var subLayer = layers[i];
            var name = subLayer.name.toLowerCase();
            if (
                (name.indexOf('data') > -1 && subLayer.kind === LayerKind.TEXT) ||
                (name.indexOf('shape') > -1) ||
                (name.indexOf('ellipse') > -1) ||
                (name.indexOf('depth') > -1)
                ) {
                subLayer.visible = false;
            }
        }
    }
}

function getElementData(layerSet) {
    hideElementData(layerSet);

    var elementData = {
        name: '',
        mapType: 'floor', //'extrusion',
        x: getLayerX(layerSet),
        y: getLayerY(layerSet),
        z: 0,
        width: 0,
        height: 0,
        depth: 0,
        regX: 0,
        regY: 0,
        shape: null,
        shapes: [],
        layers: []
    };
    var depthLayer;
    var shapesLayer;
    var layers = layerSet.artLayers;
    for (var i = layers.length; i-- > 0;) {
        var layer = layers[i];
        var shapes;
        var name = layer.name.toLowerCase();
        var width;
        var height;
        if (name.indexOf('data') > -1 && layer.kind === LayerKind.TEXT) {
            extend(elementData, parseDataIni(layer.textItem.contents));

        } else if (name.indexOf('shape') > -1) {
            shapesLayer = layer; // TODO: there can be more than one
            log('\t...found shape "'+ name + '" ' + layer.kind );
            
            elementData.shape = 'polygons';
            elementData.shapes = getPathData(layer, elementData.x, elementData.y);

            //var polygons = contoursToPolygons(el.contours, regX-eData.x, regY-eData.y);

        } else if (name.indexOf('ellipse') > -1) {
            log('\t...found ellipse "'+ name + '" ' + layer.kind );
            //shapes = getPathData(layer, elementData.x, elementData.y);
            
            width = getLayerWidth(layer);
            height = getLayerHeight(layer);

            // get radius and center
            elementData.shape = 'oval';
            elementData.shapes.push({
                x: 0,//getLayerX(layer) + width/2,
                y: 0,//getLayerY(layer) + height/2,
                width : width,
                height: height
            });

        } else if (name.indexOf('depth') > -1) {
            assert(!depthLayer, 'Found more than one depth layer in', quote(layerSet.name));
            depthLayer = layer;
            elementData.depth = getLayerHeight(layer);
        } else {
            elementData.layers.push(layer);
        }
    }
    // floor (shape on top) or wall (shape on buttom)
    if (depthLayer && shapesLayer) {
        if (getLayerY(depthLayer) < getLayerY(shapesLayer)) {
            elementData.mapType = 'wall';
        }
    }

    return elementData;
}

function getPathData(layer, offsetX, offsetY) {
    // var width = getLayerWidth(layer);
    // var height = getLayerHeight(layer);

    var shapes = [];

    doc.activeLayer = layer;
    var path = doc.pathItems[doc.pathItems.length - 1];
    // var originalRulerUnits = app.preferences.rulerUnits;
    // app.preferences.rulerUnits = Units.PIXELS;
    // log('ruler units', originalRulerUnits);
    if (app.preferences.rulerUnits !== Units.PIXELS) {
        alert('Please set your ruler units to pixels.');
        app.preferences.rulerUnits = Units.PIXELS;
    }
    for (var b = 0; b < path.subPathItems.length; b++) {
        var polygons = [];
        shapes.push({
            x: 0,//getLayerX(layer) + width/2,
            y: 0,//getLayerY(layer) + height/2,
            // width : width,
            // height: height,
            'polygons': polygons
        });

        var poly = [];
        polygons.push(poly);
        
        var points = path.subPathItems[b].pathPoints;
        for (var c = 0; c < points.length; c++) {
            //points[c].kind
            //PointKind.SMOOTHPOINT (elipse?)
            //PointKind.CORNERPOINT
            var point = points[c].anchor;//.slice(0);
            poly[c] = [
                Math.round((point[0]-offsetX)*10)/10,
                Math.round((point[1]-offsetY)*10)/10
            ];
            //     points[c].leftDirection
            //     points[c].rightDirection
            //     points[c].kind
        }
        //var theClose = thePath.subPathItems[b].closed;
    }
    // app.preferences.rulerUnits = originalRulerUnits;
    return shapes;
}

function getPolygonCentroid(verts) {
    var vector = [0,0];
    for(var i=0, len=verts.length; i<len; i++){
        vector[0] += verts[i][0];
        vector[1] += verts[i][1];
    }
    vector[0] /= len;
    vector[1] /= len;
    return vector;
}

function getLayerX(layer) {
    var bounds = layer.bounds;
    return bounds[0].value;
}
function getLayerY(layer) {
    var bounds = layer.bounds;
    return bounds[1].value;
}
function getLayerWidth(layer) {
    var bounds = layer.bounds;
    return bounds[2].value - bounds[0].value;
}
function getLayerHeight(layer) {
    var bounds = layer.bounds;
    return bounds[3].value - bounds[1].value;
}

function parseDataIni(str) {
    var data = {};
    var lines = str.split('\n').join('\r').split('\r');
    //log('\t...parsing data lines', lines.length);
    for (var i=0; i<lines.length; i++) {
        if (/^\s*#/.test(lines[i])) {
            continue; // # comment
        }
        var keyval = lines[i].split(':');
        var key = keyval.shift();
        if (key) {
            var value = keyval.join('').replace(/^\s+|\s+$/g, '');
            if (/^\s*(\+|-)?((\d+(\.\d+)?)|(\.\d+))\s*$/.test(value)) {
                value = parseFloat(value);
            }
            data[key] = value;
        }
    }
    return data;
}

function assert(passed, msg) {
    if (!passed) {
        msg = Array.prototype.slice.call(arguments, 1).join(' ');
        alert(msg);
        throw('Assert Failed: '+ msg);
    }
}

function quote(str) {
    return '"'+ str + '"';
}

function log() {
    $.writeln(Array.prototype.join.call(arguments, ' '));
}

// =====================================================================

var exported = [];
var exportFolder = '';

function getOldElementData(el, exportImage, regX, regY, noFills) {
	exportImage |= false;
	regX |= 0;
	regY |= 0;
	noFills |= false;
	var eData = {};
	var libItem;
	// log('Element:', j, quote(el.name), el.elementType, el.depth);

	if (el.elementType === 'shape') {
		eData.x = el.left + regX;
		eData.y = el.top + regY;
		eData.width  = el.width;
		eData.height = el.height;

		if (el.isGroup && el.members.length) {
			eData.group = true;
			eData.members = el.members.length;
		}
		//if (el.isDrawingObject) {
		//	eData.drawing = true;
		//	eData.members = el.members.length;
		//}

		if (el.isRectangleObject) {
			eData.rectangle = true;
		} else if (el.isOvalObject) {
			eData.oval = true;
		} else {
			var polygons = contoursToPolygons(el.contours, regX-eData.x, regY-eData.y);
			if (isRectangle(polygons)) {
				eData.rectangle = true;
			} else {
				eData.polygons = polygons;
			}
		}

		if (!noFills) {
			extend(eData, contoursToFills(el.contours));
		}

		//export fill image
        var doc = app.activeDocument;
		if (eData.fillImage) {
			if (doc.library.itemExists(eData.fillImage)) {
				if (exported.indexOf(exportFolder +'/'+ eData.fillImage) < 0) {
					var libIndex = doc.library.findItemIndex(eData.fillImage);
					libItem = doc.library.items[libIndex];
					log('\t\texporting fill image "'+libItem.name+'" to file:',eData.fillImage);
					libItem.exportToFile(exportFolder +'/'+ eData.fillImage);
					exported.push(exportFolder +'/'+ eData.fillImage);
				}

			} else {
				throw('// ERROR: Library Bitmap Item not found  "'+ eData.fillImage +'" (fillImage)');
			}
		}

	} else if (el.elementType === 'instance') {

		if (el.instanceType === 'symbol') {
			libItem = el.libraryItem;
			if (!exportImage) {
				eData.name = el.name || libItem.name.split('/').pop() || ('instance' + el.depth);
			}
			eData.x = el.x + regX;
			eData.y = el.y + regY;
			regX = parseFloat((el.x - el.left).toFixed(4));
			regY = parseFloat((el.y - el.top).toFixed(4));
			if (el.width || el.height) {
				eData.width  = el.width;
				eData.height = el.height;
			} else {
				eData.visible = false;
			}
			if (!el.visible) {
				eData.visible = false;
			}
			if (!exportImage && eData.width && eData.height) {
				eData.regX = regX;
				eData.regY = regY;
				eData.matrix = el.matrix;
			} else {
				eData.x -= regX;
				eData.y -= regY;
			}

			// log('Instance:', quote(libItem.name), libItem.itemType);
			if (['component', 'movie clip', 'graphic'].indexOf(libItem.itemType) > -1) {
				//SymbolItem

				//'component'
				extend(eData, parseParameters(el.parameters));
				if (eData.mWidth !== undefined) {eData.mWidth = eData.mWidth || eData.width;}
				if (eData.mHeight !== undefined) {eData.mHeight = eData.mHeight;}// || eData.height;}
                
				if (!eData.notes) {eData.notes = undefined;}

				if (eData.mapType !== 'entity') {
					var exportPng = exportImage || el.bitmapRenderMode === 'export' || el.bitmapRenderMode === 'cache';
					var children;
					if (exportPng) {
						//eData.cacheAsBitmap = true;
						if (el.width && el.height) {
							if (exported.indexOf(exportFolder +'/'+ libItem.name +'.png') < 0) {
								log('\t\texporting symbol "'+libItem.name+'" to PNG sequence:', libItem.name +'.png');
								libItem.exportToPNGSequence(exportFolder +'/'+ libItem.name +'.png');
								exported.push(exportFolder +'/'+ libItem.name +'.png');
							}
							eData.image = libItem.name +'.png';
						}
					} else {
						children = getSymbolChildren(libItem, regX, regY);
						if (children && children.length) {eData.children = children;}
					}
					if (eData.shape === 'polygons') {
						var shapes = getSymbolShapesLayer(libItem, regX, regY);
						if (shapes && shapes.length) {
							eData.shapes = shapes;
						} else {
							throw('"polygons" shape must contain "shapes" layer: ('+libItem.name+':'+eData.name+')');
						}
					}
				} else {
					delete eData.width;
					delete eData.height;
					delete eData.regX;
					delete eData.regY;
					delete eData.matrix;
				}
				if (el.colorAlphaPercent !== 100) {
					eData.alpha = Math.max(el.colorAlphaPercent, 0);
				}
				if (el.blendMode !== 'normal') {
					eData.blendMode = el.blendMode;
				}

			} else {
				throw('// ERROR: Library Item type not supported', quote(libItem.itemType));
			}

		} else if (el.instanceType === 'bitmap') {
			libItem = el.libraryItem;
			eData.name = el.name || libItem.name.split('/').pop() || ('instance' + el.depth);
			eData.x = el.x + regX;
			eData.y = el.y + regY;
			eData.width  = el.width;
			eData.height = el.height;

			// log('Instance:', quote(libItem.name), libItem.itemType);
			if (libItem.itemType === 'bitmap') {
				if (exported.indexOf(exportFolder +'/'+ libItem.name +'.png') < 0) {
					log('\t\texporting bitmap "'+libItem.name+'" to file:', libItem.name);
					libItem.exportToFile(exportFolder +'/'+ libItem.name +'.png');
					exported.push(exportFolder +'/'+ libItem.name +'.png');
				}
				eData.image = libItem.name +'.png';

			} else {
				throw('// ERROR: Library Item type not supported '+ quote(libItem.itemType));
			}

		} else {
			throw('// ERROR: Instance type not supported '+ quote(el.instanceType));
		}

	} else {
		throw('// ERROR: Element type not supported '+ quote(el.elementType));
	}

	return eData;
}

//---------

function getSymbolChildren(symbol, regX, regY) {
	var children = [];
	var exportImage = true;

	var layers = symbol.timeline.layers;
	var layerFrameElements;
	for (var i = layers.length; i-- > 0;) {
		var layer = layers[i];
		// log('--> Layer:', i, quote(layer.name), layer.layerType, (group || ''));
		if (layer.layerType === 'normal') { //'folder', 'guide', 'guided', 'mask', 'masked'
			layerFrameElements = layer.frames[0].elements;
			for (var j=0;  j<layerFrameElements.length;  j++) {
				var element = layerFrameElements[j];
				var eData = getOldElementData(element, exportImage, regX, regY);
				children.push(eData);
			}
		}
	}
	return children;
}

function getSymbolShapesLayer(symbol, regX, regY) {
	var shapes = [];
	var exportImage = false;
	var noFills = true;

	var layers = symbol.timeline.layers;
	var layerFrameElements;
	for (var i = layers.length; i-- > 0;) {
		var layer = layers[i];
		// log('--> Layer:', i, quote(layer.name), layer.layerType, (group || ''));
		if ((layer.layerType === 'normal' || layer.layerType === 'guide') && /^shapes$/.test(layer.name)) {
			layerFrameElements = layer.frames[0].elements;
			for (var j=0;  j<layerFrameElements.length;  j++) {
				var element = layerFrameElements[j];
				var eData = getOldElementData(element, exportImage, regX, regY, noFills);
				shapes.push(eData);
			}
		}
	}
	return shapes;
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
            //if ( !target.hasOwnProperty( prop ) ) {
			var copy = source[ prop ];
			if (copy !== undefined) {
				target[ prop ] = source[ prop ];
			}
            //}
        }
    }
    return target;
}

/* -------------------------------------------------------------------------
	Get Fill colors and bitmaps from Shapes
*/

function contoursToFills(contours) {
	var fills = {};
	for (var i=0;  i<contours.length;  i++) {
		var contour = contours[i];
		if(contour.orientation === -1) {
			fills.fillColor = contour.fill.color;
			fills.fillImage = contour.fill.bitmapPath;
			// if (fills.fillImage) {
			//	fills.fillMatrix = contour.fill.matrix;
			// }
		}
	}
	return fills;
}

/* -------------------------------------------------------------------------
	Create Convex Polygons from Shapes
*/

function isRectangle(polygons) {
	if (polygons.length === 1) {
		var poly = polygons[0];
		if (poly.length === 4) {
			var x = [];
			var y = [];
			for (var i=0;  i<4;  i++) {
				if (x.indexOf(poly[i][0]) < 0) {x.push(poly[i][0]);}
				if (y.indexOf(poly[i][1]) < 0) {y.push(poly[i][1]);}
			}
			if (x.length === 2 && y.length === 2) {
				return true;
			}
		}
	}
	return false;
}

function contoursToPolygons(contours, offsetX, offsetY) {
	offsetX = offsetX || 0;
	offsetY = offsetY || 0;
	var polygons = [];
	for (var i=0;  i<contours.length;  i++) {
		var contour = contours[i];
		if(contour.orientation === -1) {
			var he = contour.getHalfEdge();

			var iStart = he.id;
			var id = 0;
			var x = [];
			var y = [];
			while (id !== iStart)
			{
				// see if the edge is linear
				//var edge = he.getEdge();
				var vrt = he.getVertex();

				x.push(parseFloat(vrt.x));
				y.push(parseFloat(vrt.y));

				he = he.getNext();
				id = he.id;
			}

			app.drawingLayer.beginDraw(true);
			app.drawingLayer.beginFrame();
			app.drawingLayer.setColor('#0000ff');
			var triangles = triangulatePolygon(x,y,x.length);
			app.drawingLayer.setColor('#ff0000');

			var polys = polygonizeTriangles(triangles);
			if(polys) {
				for(var p = 0; p < polys.length; p++) {
					var data = [];
					var poly = polys[p];
					app.drawingLayer.moveTo(poly.x[0], poly.y[0]);
					for(var j = 0; j < poly.x.length; j++) {
						var j2 = (j === poly.x.length - 1) ? 0 : j + 1;
						app.drawingLayer.lineTo(poly.x[j2], poly.y[j2]);
						var vx = parseFloat((poly.x[j] + offsetX).toFixed(4));
						var vy = parseFloat((poly.y[j] + offsetY).toFixed(4));
						data.push([vx, vy]);
					}
					polygons.push(data);
				}
			}
			app.drawingLayer.endFrame();
			app.drawingLayer.endDraw();
		}
	}
	return polygons;
}

function Triangle(x1, y1, x2, y2, x3, y3) {

    this.x = [];
    this.y = [];

    var dx1 = x2-x1;
    var dx2 = x3-x1;
    var dy1 = y2-y1;
    var dy2 = y3-y1;
    var cross = (dx1*dy2)-(dx2*dy1);
    var ccw = (cross>0);
    if (ccw){
        this.x[0] = x1;
        this.x[1] = x2;
        this.x[2] = x3;
        this.y[0] = y1;
        this.y[1] = y2;
        this.y[2] = y3;
    } else{
        this.x[0] = x1;
        this.x[1] = x3;
        this.x[2] = x2;
        this.y[0] = y1;
        this.y[1] = y3;
        this.y[2] = y2;
    }

    this.isInside = function(_x, _y){
        var vx2 = _x-this.x[0], vy2 = _y-this.y[0];
        var vx1 = this.x[1]-this.x[0], vy1 = this.y[1]-this.y[0];
        var vx0 = this.x[2]-this.x[0], vy0 = this.y[2]-this.y[0];

        var dot00 = vx0*vx0+vy0*vy0;
        var dot01 = vx0*vx1+vy0*vy1;
        var dot02 = vx0*vx2+vy0*vy2;
        var dot11 = vx1*vx1+vy1*vy1;
        var dot12 = vx1*vx2+vy1*vy2;
        var invDenom = 1.0 / (dot00*dot11 - dot01*dot01);
        var u = (dot11*dot02 - dot01*dot12)*invDenom;
        var v = (dot00*dot12 - dot01*dot02)*invDenom;

        return ((u>0)&&(v>0)&&(u+v<1));
    };
}

function triangulatePolygon(xv, yv, vNum){
    if (vNum < 3) {
        return null;
    }
    var i;
    var toAdd;
    var buffer = [];
    var bufferSize = 0;
    var xrem = [];
    var yrem = [];
    for (i=0; i<vNum; ++i){
        xrem[i] = xv[i];
        yrem[i] = yv[i];
    }

    while (vNum > 3){
        //Find an ear
        var earIndex = -1;
        for (i=0; i<vNum; ++i){
            if (isEar(i,xrem,yrem)) {
                earIndex = i;
                break;
            }
        }

        //If we still haven't found an ear, we're screwed.
        //The user did Something Bad, so return null.
        //This will probably crash their program, since
        //they won't bother to check the return value.
        //At this we shall laugh, heartily and with great gusto.
        if (earIndex === -1) {
            //log('// NO EAR FOUND!');
            return null;
        }
    
        //Clip off the ear:
        //  - remove the ear tip from the list

        //Opt note: actually creates a new list, maybe
        //this should be done in-place instead.  A linked
        //list would be even better to avoid array-fu.
        --vNum;
        var newx = [];
        var newy = [];
        var currDest = 0;
        for (i=0; i<vNum; ++i){
            if (currDest === earIndex) {++currDest;}
            newx[i] = xrem[currDest];
            newy[i] = yrem[currDest];
            ++currDest;
        }

        //  - add the clipped triangle to the triangle list
        var under = (earIndex===0)?(xrem.length-1):(earIndex-1);
        var over = (earIndex===xrem.length-1)?0:(earIndex+1);
        toAdd = new Triangle(xrem[earIndex],yrem[earIndex],xrem[over],yrem[over],xrem[under],yrem[under]);
        buffer[bufferSize] = toAdd;
        ++bufferSize;

        //  - replace the old list with the new one
        xrem = newx;
        yrem = newy;
    }
    toAdd = new Triangle(xrem[1],yrem[1],xrem[2],yrem[2],xrem[0],yrem[0]);
    buffer[bufferSize] = toAdd;
    ++bufferSize;

    var res = [];
    for (i=0; i<bufferSize; i++){
        res[i] = buffer[i];
    }
    return res;
}

function polygonizeTriangles(triangulated){
    var polys;
    var polyIndex = 0;
    var i;

    if (triangulated === null){
        return null;
    } else{
        polys = [];
        var covered = [];
        for (i=0; i<triangulated.length; i++){
            covered[i] = false;
        }
        var notDone = true;
        while(notDone){
            var currTri = -1;
            for (i=0; i<triangulated.length; i++){
                if (covered[i]) {continue;}
                currTri = i;
                break;
            }
            if (currTri === -1){
                notDone = false;
            } else{
                var poly = new Polygon(triangulated[currTri]);
                covered[currTri] = true;
                for (i=0; i<triangulated.length; i++){
                    if (covered[i]) {continue;}
                    var newP = poly.add(triangulated[i]);
                    if (newP === null) {continue;}
                    if (newP.isConvex()){
                        poly = newP;
                        covered[i] = true;
                    }
                }
                polys[polyIndex] = poly;
                polyIndex++;
            }
        }
    }
    var ret = [];
    for (i=0; i<polyIndex; i++){
        ret[i] = polys[i];
    }
    return ret;
}

//Checks if vertex i is the tip of an ear
function isEar(i, xv, yv){
    var dx0,dy0,dx1,dy1;
    dx0=dy0=dx1=dy1=0.0;
    if (i >= xv.length || i < 0 || xv.length < 3){
        return false;
    }
    var upper = i+1;
    var lower = i-1;
    if (i === 0){
        dx0 = xv[0] - xv[xv.length-1]; 
        dy0 = yv[0] - yv[yv.length-1];
        dx1 = xv[1] - xv[0]; 
        dy1 = yv[1] - yv[0];
        lower = xv.length-1;
    } else if (i === xv.length-1){
        dx0 = xv[i] - xv[i-1]; 
        dy0 = yv[i] - yv[i-1];
        dx1 = xv[0] - xv[i]; 
        dy1 = yv[0] - yv[i];
        upper = 0;
    } else{
        dx0 = xv[i] - xv[i-1]; 
        dy0 = yv[i] - yv[i-1];
        dx1 = xv[i+1] - xv[i]; 
        dy1 = yv[i+1] - yv[i];
    }
    var cross = (dx0*dy1)-(dx1*dy0);
    if (cross > 0) {
        return false;
    }
    var myTri = new Triangle(xv[i],yv[i],xv[upper],yv[upper],xv[lower],yv[lower]);

    /*app.drawingLayer.moveTo(xv[i],yv[i]);
    app.drawingLayer.lineTo(xv[upper],yv[upper]);
    app.drawingLayer.lineTo(xv[lower],yv[lower]);
    app.drawingLayer.lineTo(xv[i],yv[i]);
    */
    for (var j=0; j<xv.length; ++j){
        if (!(j===i || j === lower || j === upper)) {
            if (myTri.isInside(xv[j],yv[j])) {
                return false;
            }
        }
    }
    return true;
}

function Polygon(_x, _y) {

    if(!_y) {
        _y = _x.y;
        _x = _x.x;
    }
  
	this.nVertices = _x.length;
//    log('length', nVertices);
	this.x = [];
	this.y = [];
	for (var i=0; i<this.nVertices; ++i){
		this.x[i] = _x[i];
		this.y[i] = _y[i];
	}
	
	this.set = function(p){
		this.nVertices = p.nVertices;
		this.x = this.nVertices;
		this.y = this.nVertices;
		for (var i=0; i<this.nVertices; ++i){
			this.x[i] = p.x[i];
			this.y[i] = p.y[i];
		}
	};

	/*
	 * Assuming the polygon is simple, checks
	 * if it is convex.
	 */
	this.isConvex = function(){
		var isPositive = false;
		for (var i=0; i<this.nVertices; ++i){
			var lower = (i===0)?(this.nVertices-1):(i-1);
			var middle = i;
			var upper = (i===this.nVertices-1)?(0):(i+1);
			var dx0 = this.x[middle]-this.x[lower];
			var dy0 = this.y[middle]-this.y[lower];
			var dx1 = this.x[upper]-this.x[middle];
			var dy1 = this.y[upper]-this.y[middle];
			var cross = dx0*dy1-dx1*dy0;
			//Cross product should have same sign
			//for each vertex if poly is convex.
			var newIsP = (cross>0)?true:false;
			if (i===0){
				isPositive = newIsP;
			} else if (isPositive !== newIsP){
				return false;
			}
		}
		return true;
	};

	/*
	 * Tries to add a triangle to the polygon.
	 * Returns null if it can't connect properly.
	 * Assumes bitwise equality of join vertices.
	 */
	this.add = function(t){
        var i;
		//First, find vertices that connect
		var firstP = -1; 
		var firstT = -1;
		var secondP = -1; 
		var secondT = -1;
	//    log('nVertices:', this.nVertices);
		for (i=0; i < this.nVertices; i++){
			if (t.x[0] === this.x[i] && t.y[0] === this.y[i]){
	//        log('found p0');
				if (firstP === -1){
					firstP = i;
                    firstT = 0;
				} else{
					secondP = i;
                    secondT = 0;
				}
			} else if (t.x[1] === this.x[i] && t.y[1] === this.y[i]){
	//        log('found p1');
				if (firstP === -1){
					firstP = i;
                    firstT = 1;
				} else{
					secondP = i;
                    secondT = 1;
				}
			} else if (t.x[2] === this.x[i] && t.y[2] === this.y[i]){
	//        log('found p2');
				if (firstP === -1){
					firstP = i;
                    firstT = 2;
				} else{
					secondP = i;
                    secondT = 2;
				}
			} else {
	//        log(t.x[0], t.y[0], t.x[1], t.y[1], t.x[2], t.y[2]);
	//        log(x[0], y[0], x[1], y[1]);
			}
		}
		//Fix ordering if first should be last vertex of poly
		if (firstP === 0 && secondP === this.nVertices-1){
			firstP = this.nVertices-1;
			secondP = 0;
		}
		
		//Didn't find it
		if (secondP === -1) {
            return null;
        }
		
		//Find tip index on triangle
		var tipT = 0;
		if (tipT === firstT || tipT === secondT) {tipT = 1;}
		if (tipT === firstT || tipT === secondT) {tipT = 2;}
		
		var newx = [];
		var newy = [];
		var currOut = 0;
		for (i=0; i<this.nVertices; i++){
			newx[currOut] = this.x[i];
			newy[currOut] = this.y[i];
			if (i === firstP){
				++currOut;
				newx[currOut] = t.x[tipT];
				newy[currOut] = t.y[tipT];
			}
			++currOut;
		}
		return new Polygon(newx,newy);
	};
}
