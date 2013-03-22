/* -------------------------------------------------------------------------
 *	@author Rob Walch
*/


// enable double clicking from the Macintosh Finder or the Windows Explorer
#target photoshop

// in case we double clicked the file
//app.bringToFront();

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
var smartObjects = {};
var exports = {
	folder: null,
	elementsFolder: null,
	entitiesFolder: null,
	files: {},
	names: {}
};

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

	var mapName = doc.name.replace(/\.psd/, '');

	var exportPath	= doc.path.toString() +'/../../app/data/'+ mapName;
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
	data.width	= doc.width.value;
	data.height = doc.height.value;
	data.layers = [];
	data.entities = [];

	parseLayers(doc.layers, null, null, '');

	//close smart objects
	for (var o in smartObjects) {
		smartObjects[o].doc.close(SaveOptions.DONOTSAVECHANGES);
		delete smartObjects[o].doc;
	}

	log('----------------------------------------');

	exportJSON(data, exports.folder.toString() +'/data.js');
}

function parseLayers(layers, mapLayer, inherit, prepend) {
	if (layers.length === 0) {
		return 0;
	}
	log(prepend, '>', layers.length, 'Layers');

	var elementCount = 0;

	for (var i = layers.length; i-- > 0;) {
		var layer = layers[i];

		if (layer.typename === 'ArtLayer') {
			log(prepend, '--', layerIndex, layer.typename +' "'+ layer.name +'",', layer.kind +',', (layer.visible?'':' hidden'));
		} else if (layer.typename === 'LayerSet') {
			log(prepend, '--', layerIndex, layer.typename +' "'+ layer.name +'" ('+ layer.layers.length +' sub layers)', (layer.visible?'':' hidden'));
		} else {
			log(prepend, '--', layerIndex, layer.typename +' "'+ layer.name +'",', (layer.visible?'':' hidden'));
		}

		if (!layer.visible) { // && layer.typename === 'LayerSet'
			//log(prepend, '\tIgnoring hidden layer', quote(layer.name));
			continue;
		} else if (layer.name.toLowerCase().indexOf('guide') > -1) {
			//log(prepend, '\tIgnoring guide layer', quote(layer.name));
			continue;
		}

		if (layer.blendMode !== BlendMode.NORMAL && layer.blendMode !== BlendMode.PASSTHROUGH) {
			log(prepend, '\tBlend Mode not supported', layer.blendMode);
		}

		if (layer.typename === 'LayerSet') {
			var elementsFound = parseLayerSet(layer, mapLayer, inherit, prepend);
			elementCount += elementsFound;
			if (elementsFound === 0) {
				log(prepend, '- FOUND NO ELEMENTS IN', quote(layer.name));
			}
		} else if (layer.typename === 'ArtLayer') {
			elementCount += parseArtLayer(layer, mapLayer, inherit, prepend);
		}
	}

	return elementCount;
}

//-----------

function newMapLayer(layer, prepend) {
	layerIndex++;
	log(prepend, '\t+ ('+ layerIndex +') new layer');
	var mapLayer = getLayerNameJSON(layer);
	mapLayer.elements = [];
	if (!layer.visible) {
		mapLayer.visible = false;
	}
	data.layers.push(mapLayer);
	return mapLayer;
}

function parseLayerSet(layerSet, mapLayer, inherit, prepend) {
	if (layerSet.name.toLowerCase().indexOf('group') > -1) {
	//if (layerSet.blendMode === BlendMode.PASSTHROUGH) {
		
		inherit = extend(inherit, getLayerNameJSON(layerSet));
		log(prepend, '----- passing through group -----', JSON.stringify(inherit));
		delete inherit.name;
		parseLayers(layerSet.layers, mapLayer, inherit, prepend+'\t');
		log(prepend, '---------------------------------');
		return;
	}

	if (layerSet.name.toLowerCase().indexOf('entities') > -1) {
		layerSet.visible = false;
		// TODO: parse Entity sub layers
		return;
	}

	// new map layer
	mapLayer = mapLayer || newMapLayer(layerSet);

	var elements = mapLayer.elements;

	// layer set with shape data is element
	var elementData = getElementData(layerSet, getLayerX(layerSet), getLayerY(layerSet), inherit);
	if (elementData.shapes.length) {
		getElementPosition(layerSet, elementData, prepend);
		log(prepend, '\t+ new element', quote(elementData.name), elementData.mapType);

		elements.push(elementData);
		exportElement(elementData, layerSet, mapLayer, prepend);

		return 1;
	}

	// layer set with no shape data or child elements is bitmap element
	var elementCount = parseLayers(layerSet.layers, mapLayer, null, prepend+'\t');
	if (elementCount === 0) {

		getElementPosition(layerSet, elementData, prepend);
		if (elementData.width && elementData.height) {
			log(prepend, '\t+ new bitmap element', quote(elementData.name));
			
			elementData.mapType = 'parallax';
			delete elementData.z;
			delete elementData.depth;
			delete elementData.regX;
			delete elementData.regY;
			delete elementData.shape;
			delete elementData.shapes;

			elements.push(elementData);
			exportElement(elementData, layerSet, mapLayer, prepend);

			elementCount++;
		}
	}

	return elementCount;
}

function parseArtLayer(layer, mapLayer, inherit, prepend) {
	//log('\t*** parseArtLayer *** ', layer, mapLayer);
	if (layer.kind === LayerKind.SMARTOBJECT) {
		var elementData;
		var smartObject;

		var x = getLayerX(layer);
		var y = getLayerY(layer);
		
		var parentDoc = app.activeDocument;
		if ( getLayerWidth(layer) ) {
			parentDoc.activeLayer = layer;
			var idAction = stringIDToTypeID('placedLayerEditContents');
			var idDesc = new ActionDescriptor();
			executeAction(idAction, idDesc, DialogModes.NO);
		} else	{
			log('** FAILED TO SELECT SMART OBJECT **', quote(layer.name), layer.parent);
			return 0;
		}

		var smartDoc = app.activeDocument;
		if (smartDoc !== parentDoc) {
			var name = smartDoc.name;

			smartObject = smartObjects[name];
			if (!smartObject) {
				log(prepend, 'SMART DOC', name);
				elementData = getElementData(smartDoc, 0, 0, inherit);//x, y);
				smartObject = smartObjects[name] = {
					doc: smartDoc,
					isGameObect: false,
					exported: 0,
					elementData: elementData
				};
				if (elementData.shapes.length || elementData.depth) {
					smartObject.isGameObect = true;
					var filename = getLayerImageName(layer) +'.png';
					elementData.image = 'elements/'+filename;
				}
			}
			smartObject.elementData.x = x;
			smartObject.elementData.x = y;
			elementData = clone(smartObject.elementData);
			//smartDoc.close(SaveOptions.DONOTSAVECHANGES);
		} else {
			log('** FAILED TO OPEN SMART OBJECT DOC **', quote(layer.name));
			return 0;
		}
		//restore doc
		app.activeDocument = parentDoc;

		if (elementData && smartObject.isGameObect) {
			extend(elementData, getLayerNameJSON(layer));
			getElementPosition(layer, elementData, prepend);

			log(prepend, '\t+ new element from smartobject', quote(elementData.name));

			mapLayer = mapLayer || newMapLayer(layer, prepend);
			var elements = mapLayer.elements;
			elements.push(elementData);
			if (smartObject.exported === 0) {
				exportElement(elementData, layer, mapLayer, prepend);
			}
			layer.visible = false;
			smartObject.exported++;
			return 1;
		}


		return 0;
	}

	/*
	LayerKind.NORMAL,			<--- export image?
	LayerKind.PATTERNFILL, <--- container with fill
	LayerKind.SOLIDFILL,	 <--- container with fill
	LayerKind.TEXT				 <--- Data?
	*/

	// Use container for pattern fill
	// if (elementData.shapes.length === 0) {
	//		 log(prepend, '\t+ new container element');
	//		 //make this a bitmap container
	//		 var container = {
	//				 mapType: 'container',//'parallax'
	//				 children: [elementData] // fillImage: , rectangle:true
	//		 };
	//		 elements.push(container);
	// } else {
	//		 log(prepend, '\t+ new element');
	//		 // Get the other stuff (images, childres, etc...)
	//		 elements.push(elementData);
	// }

	return 0;
}

function exportElement(elementData, layer, mapLayer, prepend) {
	// extract any layers that should be exported as separate elements (Smart Objects):
	parseLayers(elementData.layers, mapLayer, null, prepend+'\t');
	delete elementData.layers;

	log(JSON.stringify(elementData));
	
	if (hasVisibleContents(layer, prepend)) {
		// export PNG
		var filename = getLayerImageName(layer) +'.png';
		var filepath = exports.elementsFolder.toString() +'/'+ filename;
		exportLayer(layer, filepath, prepend);
		elementData.image = 'elements/'+filename;
	}
}

function hasVisibleContents(layer, prepend) {
	var width = getLayerWidth(layer);
	var height = getLayerHeight(layer);
	log(prepend, '\t? contents', quote(layer.name), width+'x'+height);
	// check width and height
	if (width && height) {
		if (!layer.layers) {
			return layer.visible;
		}
		var i, layers, subLayer;
		layers = layer.layerSets;
		for (i = layers.length; i-- > 0;) {
			subLayer = layers[i];
			if (subLayer.visible && hasVisibleContents(subLayer, '\t'+prepend)) {
				return true;
			}
		}
		layers = layer.artLayers;
		for (i = layers.length; i-- > 0;) {
			subLayer = layers[i];
			if (subLayer.visible && getLayerWidth(subLayer) && getLayerHeight(subLayer)) {
				log(prepend, '\t+ visible', quote(subLayer.name), subLayer.width, subLayer.height);
				return true;
			}
		}
	}
	return false;
}


function getLayerImageName(layer) {
	var name = layer.name.replace(/\s*\{.*\}\s*/, '').replace(/[^a-z0-9]+/gi, '_').toLowerCase();
	if (exports.names[name]) {
		alert('A layer with the same name was already exported: '+quote(name));
		log('\tWARNING: Layer name', quote(name), 'is not unique. x', exports.names[name]);
		exports.names[name]++;
	} else {
    
	}
	return name;
}

function exportLayer(layer, filepath, prepend) {
	var file = exports.files[filepath];
	if (file) {
		log('\tWARNING: A file with same name has already been exported '+ quote(filepath));
		alert('A file with same name has already been exported '+ quote(filepath));
		return;
	}

	var parentDoc = app.activeDocument;
	app.displayDialogs = DialogModes.ERROR; //DialogModes.NO;
	// duplicate layer into new document and trim
	var tempDoc = app.documents.add(
		parentDoc.width, parentDoc.height, parentDoc.resolution,
		layer.name, // replace spaces with underscore
		NewDocumentMode.RGB,
		DocumentFill.TRANSPARENT,
		1.0,
		BitsPerChannelType.EIGHT,
		'' // color profile
	);
	app.activeDocument = parentDoc;
	var dupeLayer = layer.duplicate(tempDoc, ElementPlacement.PLACEATBEGINNING);
	app.activeDocument = tempDoc;
	hideElementData(dupeLayer);
	tempDoc.trim(TrimType.TRANSPARENT);

	// export PNG
	var opts = new ExportOptionsSaveForWeb();
	opts.format = SaveDocumentType.PNG;
	opts.PNG8 = false;
	opts.quality = 100;
	//opts.matteColor = RGB black, white or best match ?

	file = exports.files[filepath] = new File(filepath);
	log(prepend, '\texported:', quote(file));
	tempDoc.exportDocument(file, ExportType.SAVEFORWEB, opts);

	tempDoc.close(SaveOptions.DONOTSAVECHANGES);

	//restore doc
	app.activeDocument = parentDoc;
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
	if (!layer.layers) {
		return;
	}
	var i, subLayer, name;
	var layerSets = layer.layerSets;
	for (i = layerSets.length; i-- > 0;) {
		subLayer = layerSets[i];
		name = subLayer.name.toLowerCase();
		if (
			(name.indexOf('data') > -1) ||
			(name.indexOf('entities') > -1)
			) {
			subLayer.visible = false;
			return;
		}
	}
	var layers = layer.artLayers;
	for (i = layers.length; i-- > 0;) {
		subLayer = layers[i];
		name = subLayer.name.toLowerCase();
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

function getElementData(layerSet, x, y, inherit) {
	var i, name, elementData;

	// find any json in the name
	var props = getLayerNameJSON(layerSet);
	
	//find data layerset
	var layerSets = layerSet.layerSets;
	for (i = layerSets.length; i-- > 0;) {
		var subLayer = layerSets[i];
		name = subLayer.name.toLowerCase();
		if (name.indexOf('data') > -1) {
			elementData = getElementData(subLayer, x, y, inherit);
			extend(elementData, props);
			return elementData;
		}
	}

	elementData = extend({
		name: '',
		mapType: 'floor', //'extrusion',
		x: x|0,
		y: y|0,
		z: 0,
		width: 0,
		height: 0,
		depth: 0,
		regX: 0,
		regY: 0,
		shape: null,
		shapes: [],
		layers: []
	}, inherit);

	var depthLayer;
	var shapesLayer;
	var layers = layerSet.artLayers;
	for (i = layers.length; i-- > 0;) {
		var layer = layers[i];
		var width;
		var height;
		name = layer.name.toLowerCase();
		if (name.indexOf('data') > -1 && layer.kind === LayerKind.TEXT) {
			extend(elementData, parseDataIni(layer.textItem.contents));

		} else if (name.indexOf('shape') > -1) {
			shapesLayer = layer; // TODO: there can be more than one
			log('\t...found shape "'+ name + '" ' + layer.kind );
			
			elementData.shape = 'polygons';
			elementData.shapes = elementData.shapes.concat(getPathData(layer, elementData.x, elementData.y));

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
	extend(elementData, props);
	return elementData;
}

function getElementPosition(layer, elementData, prepend) {
	hideElementData(layer);

	//reg point
	var regX = 0, regY = 0;
	if (elementData.shape === 'polygons') {
		var regPoint = getShapesCentroid(elementData.shapes);
		regX = Math.round(regPoint[0]);
		regY = Math.round(regPoint[1]);
	} else if (elementData.shape === 'oval') {
		regX = elementData.shapes[0].width /2;
		regY = elementData.shapes[0].height /2;
	}

	extend(elementData, {
		x: getLayerX(layer) + regX,
		y: getLayerY(layer) + regY + elementData.z,
		regX: regX,
		regY: regY,
		width : getLayerWidth(layer),
		height: getLayerHeight(layer)
	});
}

function getLayerNameJSON(layer) {
	var jsonRegExp = /\s*\{.*\}\s*/;
	var props = {
		name: layer.name.replace(jsonRegExp, '')
	};
	var jsonMatch = layer.name.match(jsonRegExp);
	if (jsonMatch && jsonMatch.length) {
		extend(props, JSON.parse(jsonMatch[0]));
	}
	return props;
}

function getPathData(layer, offsetX, offsetY) {
	// var width = getLayerWidth(layer);
	// var height = getLayerHeight(layer);

	var shapes = [];

	var parentDoc = app.activeDocument;
	parentDoc.activeLayer = layer;
	var path = parentDoc.pathItems[parentDoc.pathItems.length - 1];
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
			poly.push([
				Math.round((point[0]-offsetX)*10)/10,
				Math.round((point[1]-offsetY)*10)/10
			]);
			//		 points[c].leftDirection
			//		 points[c].rightDirection
			//		 points[c].kind
		}
		//var theClose = thePath.subPathItems[b].closed;
	}
	// app.preferences.rulerUnits = originalRulerUnits;
	return shapes;
}

function getShapesCentroid(shapes) {
    var vector = [0,0];
    for(var i=0, len=shapes.length; i<len; i++){
        var v = getPolygonCentroid(shapes[i].polygons[0]);
        vector[0] += v[0];
        vector[1] += v[1];
    }
    vector[0] /= len;
    vector[1] /= len;
    return vector;
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
	return (bounds[2].value - bounds[0].value)|0;
}
function getLayerHeight(layer) {
	var bounds = layer.bounds;
	return (bounds[3].value - bounds[1].value)|0;
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

function extend(target, source) {
	target = target || {};
	if (source) {
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
	}
	return target;
}

function clone(source) {
	return extend(null, source);
}

/* -------------------------------------------------------------------------
	Get Fill colors and bitmaps from Shapes
*/

function contoursToFills(contours) {
	var fills = {};
	for (var i=0;	i<contours.length;	i++) {
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
			for (var i=0;	i<4;	i++) {
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
	for (var i=0;	i<contours.length;	i++) {
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
		//	- remove the ear tip from the list

		//Opt note: actually creates a new list, maybe
		//this should be done in-place instead.	A linked
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

		//	- add the clipped triangle to the triangle list
		var under = (earIndex===0)?(xrem.length-1):(earIndex-1);
		var over = (earIndex===xrem.length-1)?0:(earIndex+1);
		toAdd = new Triangle(xrem[earIndex],yrem[earIndex],xrem[over],yrem[over],xrem[under],yrem[under]);
		buffer[bufferSize] = toAdd;
		++bufferSize;

		//	- replace the old list with the new one
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
//		log('length', nVertices);
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
        //		log('nVertices:', this.nVertices);
		for (i=0; i < this.nVertices; i++){
			if (t.x[0] === this.x[i] && t.y[0] === this.y[i]){
            //				log('found p0');
				if (firstP === -1){
					firstP = i;
					firstT = 0;
				} else{
					secondP = i;
                    secondT = 0;
				}
			} else if (t.x[1] === this.x[i] && t.y[1] === this.y[i]){
            //				log('found p1');
				if (firstP === -1){
					firstP = i;
                    firstT = 1;
				} else{
					secondP = i;
                    secondT = 1;
				}
			} else if (t.x[2] === this.x[i] && t.y[2] === this.y[i]){
	       //				log('found p2');
				if (firstP === -1){
					firstP = i;
                    firstT = 2;
				} else{
					secondP = i;
                    secondT = 2;
				}
			} else {
	       //				log(t.x[0], t.y[0], t.x[1], t.y[1], t.x[2], t.y[2]);
	       //				log(x[0], y[0], x[1], y[1]);
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


/*! JSON v3.2.4 | http://bestiejs.github.com/json3 | Copyright 2012, Kit Cambridge | http://kit.mit-license.org */
var JSON = (function () {
	// Convenience aliases.
	var getClass = {}.toString, isProperty, forEach, undef;

	// Detect the `define` function exposed by asynchronous module loaders. The
	// strict `define` check is necessary for compatibility with `r.js`.
	var isLoader = typeof define === "function" && define.amd, JSON3 = !isLoader && typeof exports == "object" && exports;

	if (JSON3 || isLoader) {
		if (typeof JSON == "object" && JSON) {
			// Delegate to the native `stringify` and `parse` implementations in
			// asynchronous module loaders and CommonJS environments.
			if (isLoader) {
				JSON3 = JSON;
			} else {
				JSON3.stringify = JSON.stringify;
				JSON3.parse = JSON.parse;
			}
		} else if (isLoader) {
			JSON3 = this.JSON = {};
		}
	} else {
		// Export for web browsers and JavaScript engines.
		JSON3 = this.JSON || (this.JSON = {});
	}

	// Local variables.
	var Escapes, toPaddedString, quote, serialize;
	var fromCharCode, Unescapes, abort, lex, get, walk, update, Index, Source;

	// Test the `Date#getUTC*` methods. Based on work by @Yaffle.
	var isExtended = new Date(-3509827334573292), floor, Months, getDay;

	try {
		// The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
		// results for certain dates in Opera >= 10.53.
		isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() == 1 &&
			// Safari < 2.0.2 stores the internal millisecond time value correctly,
			// but clips the values returned by the date methods to the range of
			// signed 32-bit integers ([-2 ** 31, 2 ** 31 - 1]).
			isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
	} catch (exception) {}

	// Internal: Determines whether the native `JSON.stringify` and `parse`
	// implementations are spec-compliant. Based on work by Ken Snyder.
	function has(name) {
		var stringifySupported, parseSupported, value, serialized = '{"A":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}', all = name == "json";
		if (all || name == "json-stringify" || name == "json-parse") {
			// Test `JSON.stringify`.
			if (name == "json-stringify" || all) {
				if ((stringifySupported = typeof JSON3.stringify == "function" && isExtended)) {
					// A test function object with a custom `toJSON` method.
					(value = function () {
						return 1;
					}).toJSON = value;
					try {
						stringifySupported =
							// Firefox 3.1b1 and b2 serialize string, number, and boolean
							// primitives as object literals.
							JSON3.stringify(0) === "0" &&
							// FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
							// literals.
							JSON3.stringify(new Number()) === "0" &&
							JSON3.stringify(new String()) == '""' &&
							// FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
							// does not define a canonical JSON representation (this applies to
							// objects with `toJSON` properties as well, *unless* they are nested
							// within an object or array).
							JSON3.stringify(getClass) === undef &&
							// IE 8 serializes `undefined` as `"undefined"`. Safari <= 5.1.7 and
							// FF 3.1b3 pass this test.
							JSON3.stringify(undef) === undef &&
							// Safari <= 5.1.7 and FF 3.1b3 throw `Error`s and `TypeError`s,
							// respectively, if the value is omitted entirely.
							JSON3.stringify() === undef &&
							// FF 3.1b1, 2 throw an error if the given value is not a number,
							// string, array, object, Boolean, or `null` literal. This applies to
							// objects with custom `toJSON` methods as well, unless they are nested
							// inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
							// methods entirely.
							JSON3.stringify(value) === "1" &&
							JSON3.stringify([value]) == "[1]" &&
							// Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
							// `"[null]"`.
							JSON3.stringify([undef]) == "[null]" &&
							// YUI 3.0.0b1 fails to serialize `null` literals.
							JSON3.stringify(null) == "null" &&
							// FF 3.1b1, 2 halts serialization if an array contains a function:
							// `[1, true, getClass, 1]` serializes as "[1,true,],". These versions
							// of Firefox also allow trailing commas in JSON objects and arrays.
							// FF 3.1b3 elides non-JSON values from objects and arrays, unless they
							// define custom `toJSON` methods.
							JSON3.stringify([undef, getClass, null]) == "[null,null,null]" &&
							// Simple serialization test. FF 3.1b1 uses Unicode escape sequences
							// where character escape codes are expected (e.g., `\b` => `\u0008`).
							JSON3.stringify({ "A": [value, true, false, null, "\0\b\n\f\r\t"] }) == serialized &&
							// FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
							JSON3.stringify(null, value) === "1" &&
							JSON3.stringify([1, 2], null, 1) == "[\n 1,\n 2\n]" &&
							// JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
							// serialize extended years.
							JSON3.stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&
							// The milliseconds are optional in ES 5, but required in 5.1.
							JSON3.stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&
							// Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
							// four-digit years instead of six-digit years. Credits: @Yaffle.
							JSON3.stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&
							// Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
							// values less than 1000. Credits: @Yaffle.
							JSON3.stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
					} catch (exception) {
						stringifySupported = false;
					}
				}
				if (!all) {
					return stringifySupported;
				}
			}
			// Test `JSON.parse`.
			if (name == "json-parse" || all) {
				if (typeof JSON3.parse == "function") {
					try {
						// FF 3.1b1, b2 will throw an exception if a bare literal is provided.
						// Conforming implementations should also coerce the initial argument to
						// a string prior to parsing.
						if (JSON3.parse("0") === 0 && !JSON3.parse(false)) {
							// Simple parsing test.
							value = JSON3.parse(serialized);
							if ((parseSupported = value.A.length == 5 && value.A[0] == 1)) {
								try {
									// Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
									parseSupported = !JSON3.parse('"\t"');
								} catch (exception) {}
								if (parseSupported) {
									try {
										// FF 4.0 and 4.0.1 allow leading `+` signs, and leading and
										// trailing decimal points. FF 4.0, 4.0.1, and IE 9-10 also
										// allow certain octal literals.
										parseSupported = JSON3.parse("01") != 1;
									} catch (exception) {}
								}
							}
						}
					} catch (exception) {
						parseSupported = false;
					}
				}
				if (!all) {
					return parseSupported;
				}
			}
			return stringifySupported && parseSupported;
		}
	}

	if (!has("json")) {
		// Define additional utility methods if the `Date` methods are buggy.
		if (!isExtended) {
			floor = Math.floor;
			// A mapping between the months of the year and the number of days between
			// January 1st and the first of the respective month.
			Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
			// Internal: Calculates the number of days between the Unix epoch and the
			// first day of the given month.
			getDay = function (year, month) {
				return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
			};
		}
		
		// Internal: Determines if a property is a direct property of the given
		// object. Delegates to the native `Object#hasOwnProperty` method.
		if (!(isProperty = {}.hasOwnProperty)) {
			isProperty = function (property) {
				var members = {}, constructor;
				if ((members.__proto__ = null, members.__proto__ = {
					// The *proto* property cannot be set multiple times in recent
					// versions of Firefox and SeaMonkey.
					"toString": 1
				}, members).toString != getClass) {
					// Safari <= 2.0.3 doesn't implement `Object#hasOwnProperty`, but
					// supports the mutable *proto* property.
					isProperty = function (property) {
						// Capture and break the object's prototype chain (see section 8.6.2
						// of the ES 5.1 spec). The parenthesized expression prevents an
						// unsafe transformation by the Closure Compiler.
						var original = this.__proto__, result = property in (this.__proto__ = null, this);
						// Restore the original prototype chain.
						this.__proto__ = original;
						return result;
					};
				} else {
					// Capture a reference to the top-level `Object` constructor.
					constructor = members.constructor;
					// Use the `constructor` property to simulate `Object#hasOwnProperty` in
					// other environments.
					isProperty = function (property) {
						var parent = (this.constructor || constructor).prototype;
						return property in this && !(property in parent && this[property] === parent[property]);
					};
				}
				members = null;
				return isProperty.call(this, property);
			};
		}

		// Internal: Normalizes the `for...in` iteration algorithm across
		// environments. Each enumerated key is yielded to a `callback` function.
		forEach = function (object, callback) {
			var size = 0, Properties, members, property, forEach;

			// Tests for bugs in the current environment's `for...in` algorithm. The
			// `valueOf` property inherits the non-enumerable flag from
			// `Object.prototype` in older versions of IE, Netscape, and Mozilla.
			(Properties = function () {
				this.valueOf = 0;
			}).prototype.valueOf = 0;

			// Iterate over a new instance of the `Properties` class.
			members = new Properties();
			for (property in members) {
				// Ignore all properties inherited from `Object.prototype`.
				if (isProperty.call(members, property)) {
					size++;
				}
			}
			Properties = members = null;

			// Normalize the iteration algorithm.
			if (!size) {
				// A list of non-enumerable properties inherited from `Object.prototype`.
				members = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
				// IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
				// properties.
				forEach = function (object, callback) {
					var isFunction = getClass.call(object) == "[object Function]", property, length;
					for (property in object) {
						// Gecko <= 1.0 enumerates the `prototype` property of functions under
						// certain conditions; IE does not.
						if (!(isFunction && property == "prototype") && isProperty.call(object, property)) {
							callback(property);
						}
					}
					// Manually invoke the callback for each non-enumerable property.
					for (length = members.length; property = members[--length]; isProperty.call(object, property) && callback(property));
				};
			} else if (size == 2) {
				// Safari <= 2.0.4 enumerates shadowed properties twice.
				forEach = function (object, callback) {
					// Create a set of iterated properties.
					var members = {}, isFunction = getClass.call(object) == "[object Function]", property;
					for (property in object) {
						// Store each property name to prevent double enumeration. The
						// `prototype` property of functions is not enumerated due to cross-
						// environment inconsistencies.
						if (!(isFunction && property == "prototype") && !isProperty.call(members, property) && (members[property] = 1) && isProperty.call(object, property)) {
							callback(property);
						}
					}
				};
			} else {
				// No bugs detected; use the standard `for...in` algorithm.
				forEach = function (object, callback) {
					var isFunction = getClass.call(object) == "[object Function]", property, isConstructor;
					for (property in object) {
						if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
							callback(property);
						}
					}
					// Manually invoke the callback for the `constructor` property due to
					// cross-environment inconsistencies.
					if (isConstructor || isProperty.call(object, (property = "constructor"))) {
						callback(property);
					}
				};
			}
			return forEach(object, callback);
		};

		// Public: Serializes a JavaScript `value` as a JSON string. The optional
		// `filter` argument may specify either a function that alters how object and
		// array members are serialized, or an array of strings and numbers that
		// indicates which properties should be serialized. The optional `width`
		// argument may be either a string or number that specifies the indentation
		// level of the output.
		if (!has("json-stringify")) {
			// Internal: A map of control characters and their escaped equivalents.
			Escapes = {
				"\\": "\\\\",
				'"': '\\"',
				"\b": "\\b",
				"\f": "\\f",
				"\n": "\\n",
				"\r": "\\r",
				"\t": "\\t"
			};

			// Internal: Converts `value` into a zero-padded string such that its
			// length is at least equal to `width`. The `width` must be <= 6.
			toPaddedString = function (width, value) {
				// The `|| 0` expression is necessary to work around a bug in
				// Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
				return ("000000" + (value || 0)).slice(-width);
			};

			// Internal: Double-quotes a string `value`, replacing all ASCII control
			// characters (characters with code unit values between 0 and 31) with
			// their escaped equivalents. This is an implementation of the
			// `Quote(value)` operation defined in ES 5.1 section 15.12.3.
			quote = function (value) {
				var result = '"', index = 0, symbol;
				for (; symbol = value.charAt(index); index++) {
					// Escape the reverse solidus, double quote, backspace, form feed, line
					// feed, carriage return, and tab characters.
					result += '\\"\b\f\n\r\t'.indexOf(symbol) > -1 ? Escapes[symbol] :
						// If the character is a control character, append its Unicode escape
						// sequence; otherwise, append the character as-is.
						(Escapes[symbol] = symbol < " " ? "\\u00" + toPaddedString(2, symbol.charCodeAt(0).toString(16)) : symbol);
				}
				return result + '"';
			};

			// Internal: Recursively serializes an object. Implements the
			// `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
			serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
				var value = object[property], className, year, month, date, time, hours, minutes, seconds, milliseconds, results, element, index, length, prefix, any, result;
				if (typeof value == "object" && value) {
					className = getClass.call(value);
					if (className == "[object Date]" && !isProperty.call(value, "toJSON")) {
						if (value > -1 / 0 && value < 1 / 0) {
							// Dates are serialized according to the `Date#toJSON` method
							// specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
							// for the ISO 8601 date time string format.
							if (getDay) {
								// Manually compute the year, month, date, hours, minutes,
								// seconds, and milliseconds if the `getUTC*` methods are
								// buggy. Adapted from @Yaffle's `date-shim` project.
								date = floor(value / 864e5);
								for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++);
								for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++);
								date = 1 + date - getDay(year, month);
								// The `time` value specifies the time within the day (see ES
								// 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
								// to compute `A modulo B`, as the `%` operator does not
								// correspond to the `modulo` operation for negative numbers.
								time = (value % 864e5 + 864e5) % 864e5;
								// The hours, minutes, seconds, and milliseconds are obtained by
								// decomposing the time within the day. See section 15.9.1.10.
								hours = floor(time / 36e5) % 24;
								minutes = floor(time / 6e4) % 60;
								seconds = floor(time / 1e3) % 60;
								milliseconds = time % 1e3;
							} else {
								year = value.getUTCFullYear();
								month = value.getUTCMonth();
								date = value.getUTCDate();
								hours = value.getUTCHours();
								minutes = value.getUTCMinutes();
								seconds = value.getUTCSeconds();
								milliseconds = value.getUTCMilliseconds();
							}
							// Serialize extended years correctly.
							value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) +
								"-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) +
								// Months, dates, hours, minutes, and seconds should have two
								// digits; milliseconds should have three.
								"T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) +
								// Milliseconds are optional in ES 5.0, but required in 5.1.
								"." + toPaddedString(3, milliseconds) + "Z";
						} else {
							value = null;
						}
					} else if (typeof value.toJSON == "function" && ((className != "[object Number]" && className != "[object String]" && className != "[object Array]") || isProperty.call(value, "toJSON"))) {
						// Prototype <= 1.6.1 adds non-standard `toJSON` methods to the
						// `Number`, `String`, `Date`, and `Array` prototypes. JSON 3
						// ignores all `toJSON` methods on these objects unless they are
						// defined directly on an instance.
						value = value.toJSON(property);
					}
				}
				if (callback) {
					// If a replacement function was provided, call it to obtain the value
					// for serialization.
					value = callback.call(object, property, value);
				}
				if (value === null) {
					return "null";
				}
				className = getClass.call(value);
				if (className == "[object Boolean]") {
					// Booleans are represented literally.
					return "" + value;
				} else if (className == "[object Number]") {
					// JSON numbers must be finite. `Infinity` and `NaN` are serialized as
					// `"null"`.
					return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
				} else if (className == "[object String]") {
					// Strings are double-quoted and escaped.
					return quote(value);
				}
				// Recursively serialize objects and arrays.
				if (typeof value == "object") {
					// Check for cyclic structures. This is a linear search; performance
					// is inversely proportional to the number of unique nested objects.
					for (length = stack.length; length--;) {
						if (stack[length] === value) {
							// Cyclic structures cannot be serialized by `JSON.stringify`.
							throw TypeError();
						}
					}
					// Add the object to the stack of traversed objects.
					stack.push(value);
					results = [];
					// Save the current indentation level and indent one additional level.
					prefix = indentation;
					indentation += whitespace;
					if (className == "[object Array]") {
						// Recursively serialize array elements.
						for (index = 0, length = value.length; index < length; any || (any = true), index++) {
							element = serialize(index, value, callback, properties, whitespace, indentation, stack);
							results.push(element === undef ? "null" : element);
						}
						result = any ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
					} else {
						// Recursively serialize object members. Members are selected from
						// either a user-specified list of property names, or the object
						// itself.
						forEach(properties || value, function (property) {
							var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
							if (element !== undef) {
								// According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
								// is not the empty string, let `member` {quote(property) + ":"}
								// be the concatenation of `member` and the `space` character."
								// The "`space` character" refers to the literal space
								// character, not the `space` {width} argument provided to
								// `JSON.stringify`.
								results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
							}
							any || (any = true);
						});
						result = any ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
					}
					// Remove the object from the traversed object stack.
					stack.pop();
					return result;
				}
			};

			// Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
			JSON3.stringify = function (source, filter, width) {
				var whitespace, callback, properties, index, length, value;
				if (typeof filter == "function" || typeof filter == "object" && filter) {
					if (getClass.call(filter) == "[object Function]") {
						callback = filter;
					} else if (getClass.call(filter) == "[object Array]") {
						// Convert the property names array into a makeshift set.
						properties = {};
						for (index = 0, length = filter.length; index < length; value = filter[index++], ((getClass.call(value) == "[object String]" || getClass.call(value) == "[object Number]") && (properties[value] = 1)));
					}
				}
				if (width) {
					if (getClass.call(width) == "[object Number]") {
						// Convert the `width` to an integer and create a string containing
						// `width` number of space characters.
						if ((width -= width % 1) > 0) {
							for (whitespace = "", width > 10 && (width = 10); whitespace.length < width; whitespace += " ");
						}
					} else if (getClass.call(width) == "[object String]") {
						whitespace = width.length <= 10 ? width : width.slice(0, 10);
					}
				}
				// Opera <= 7.54u2 discards the values associated with empty string keys
				// (`""`) only if they are used directly within an object member list
				// (e.g., `!("" in { "": 1})`).
				return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
			};
		}

		// Public: Parses a JSON source string.
		if (!has("json-parse")) {
			fromCharCode = String.fromCharCode;
			// Internal: A map of escaped control characters and their unescaped
			// equivalents.
			Unescapes = {
				"\\": "\\",
				'"': '"',
				"/": "/",
				"b": "\b",
				"t": "\t",
				"n": "\n",
				"f": "\f",
				"r": "\r"
			};

			// Internal: Resets the parser state and throws a `SyntaxError`.
			abort = function() {
				Index = Source = null;
				throw SyntaxError();
			};

			// Internal: Returns the next token, or `"$"` if the parser has reached
			// the end of the source string. A token may be a string, number, `null`
			// literal, or Boolean literal.
			lex = function () {
				var source = Source, length = source.length, symbol, value, begin, position, sign;
				while (Index < length) {
					symbol = source.charAt(Index);
					if ("\t\r\n ".indexOf(symbol) > -1) {
						// Skip whitespace tokens, including tabs, carriage returns, line
						// feeds, and space characters.
						Index++;
					} else if ("{}[]:,".indexOf(symbol) > -1) {
						// Parse a punctuator token at the current position.
						Index++;
						return symbol;
					} else if (symbol == '"') {
						// Advance to the next character and parse a JSON string at the
						// current position. String tokens are prefixed with the sentinel
						// `@` character to distinguish them from punctuators.
						for (value = "@", Index++; Index < length;) {
							symbol = source.charAt(Index);
							if (symbol < " ") {
								// Unescaped ASCII control characters are not permitted.
								abort();
							} else if (symbol == "\\") {
								// Parse escaped JSON control characters, `"`, `\`, `/`, and
								// Unicode escape sequences.
								symbol = source.charAt(++Index);
								if ('\\"/btnfr'.indexOf(symbol) > -1) {
									// Revive escaped control characters.
									value += Unescapes[symbol];
									Index++;
								} else if (symbol == "u") {
									// Advance to the first character of the escape sequence.
									begin = ++Index;
									// Validate the Unicode escape sequence.
									for (position = Index + 4; Index < position; Index++) {
										symbol = source.charAt(Index);
										// A valid sequence comprises four hexdigits that form a
										// single hexadecimal value.
										if (!(symbol >= "0" && symbol <= "9" || symbol >= "a" && symbol <= "f" || symbol >= "A" && symbol <= "F")) {
											// Invalid Unicode escape sequence.
											abort();
										}
									}
									// Revive the escaped character.
									value += fromCharCode("0x" + source.slice(begin, Index));
								} else {
									// Invalid escape sequence.
									abort();
								}
							} else {
								if (symbol == '"') {
									// An unescaped double-quote character marks the end of the
									// string.
									break;
								}
								// Append the original character as-is.
								value += symbol;
								Index++;
							}
						}
						if (source.charAt(Index) == '"') {
							Index++;
							// Return the revived string.
							return value;
						}
						// Unterminated string.
						abort();
					} else {
						// Parse numbers and literals.
						begin = Index;
						// Advance the scanner's position past the sign, if one is
						// specified.
						if (symbol == "-") {
							sign = true;
							symbol = source.charAt(++Index);
						}
						// Parse an integer or floating-point value.
						if (symbol >= "0" && symbol <= "9") {
							// Leading zeroes are interpreted as octal literals.
							if (symbol == "0" && (symbol = source.charAt(Index + 1), symbol >= "0" && symbol <= "9")) {
								// Illegal octal literal.
								abort();
							}
							sign = false;
							// Parse the integer component.
							for (; Index < length && (symbol = source.charAt(Index), symbol >= "0" && symbol <= "9"); Index++);
							// Floats cannot contain a leading decimal point; however, this
							// case is already accounted for by the parser.
							if (source.charAt(Index) == ".") {
								position = ++Index;
								// Parse the decimal component.
								for (; position < length && (symbol = source.charAt(position), symbol >= "0" && symbol <= "9"); position++);
								if (position == Index) {
									// Illegal trailing decimal.
									abort();
								}
								Index = position;
							}
							// Parse exponents.
							symbol = source.charAt(Index);
							if (symbol == "e" || symbol == "E") {
								// Skip past the sign following the exponent, if one is
								// specified.
								symbol = source.charAt(++Index);
								if (symbol == "+" || symbol == "-") {
									Index++;
								}
								// Parse the exponential component.
								for (position = Index; position < length && (symbol = source.charAt(position), symbol >= "0" && symbol <= "9"); position++);
								if (position == Index) {
									// Illegal empty exponent.
									abort();
								}
								Index = position;
							}
							// Coerce the parsed value to a JavaScript number.
							return +source.slice(begin, Index);
						}
						// A negative sign may only precede numbers.
						if (sign) {
							abort();
						}
						// `true`, `false`, and `null` literals.
						if (source.slice(Index, Index + 4) == "true") {
							Index += 4;
							return true;
						} else if (source.slice(Index, Index + 5) == "false") {
							Index += 5;
							return false;
						} else if (source.slice(Index, Index + 4) == "null") {
							Index += 4;
							return null;
						}
						// Unrecognized token.
						abort();
					}
				}
				// Return the sentinel `$` character if the parser has reached the end
				// of the source string.
				return "$";
			};

			// Internal: Parses a JSON `value` token.
			get = function (value) {
				var results, any, key;
				if (value == "$") {
					// Unexpected end of input.
					abort();
				}
				if (typeof value == "string") {
					if (value.charAt(0) == "@") {
						// Remove the sentinel `@` character.
						return value.slice(1);
					}
					// Parse object and array literals.
					if (value == "[") {
						// Parses a JSON array, returning a new JavaScript array.
						results = [];
						for (;; any || (any = true)) {
							value = lex();
							// A closing square bracket marks the end of the array literal.
							if (value == "]") {
								break;
							}
							// If the array literal contains elements, the current token
							// should be a comma separating the previous element from the
							// next.
							if (any) {
								if (value == ",") {
									value = lex();
									if (value == "]") {
										// Unexpected trailing `,` in array literal.
										abort();
									}
								} else {
									// A `,` must separate each array element.
									abort();
								}
							}
							// Elisions and leading commas are not permitted.
							if (value == ",") {
								abort();
							}
							results.push(get(value));
						}
						return results;
					} else if (value == "{") {
						// Parses a JSON object, returning a new JavaScript object.
						results = {};
						for (;; any || (any = true)) {
							value = lex();
							// A closing curly brace marks the end of the object literal.
							if (value == "}") {
								break;
							}
							// If the object literal contains members, the current token
							// should be a comma separator.
							if (any) {
								if (value == ",") {
									value = lex();
									if (value == "}") {
										// Unexpected trailing `,` in object literal.
										abort();
									}
								} else {
									// A `,` must separate each object member.
									abort();
								}
							}
							// Leading commas are not permitted, object property names must be
							// double-quoted strings, and a `:` must separate each property
							// name and value.
							if (value == "," || typeof value != "string" || value.charAt(0) != "@" || lex() != ":") {
								abort();
							}
							results[value.slice(1)] = get(lex());
						}
						return results;
					}
					// Unexpected token encountered.
					abort();
				}
				return value;
			};

			// Internal: Updates a traversed object member.
			update = function(source, property, callback) {
				var element = walk(source, property, callback);
				if (element === undef) {
					delete source[property];
				} else {
					source[property] = element;
				}
			};

			// Internal: Recursively traverses a parsed JSON object, invoking the
			// `callback` function for each value. This is an implementation of the
			// `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
			walk = function (source, property, callback) {
				var value = source[property], length;
				if (typeof value == "object" && value) {
					if (getClass.call(value) == "[object Array]") {
						for (length = value.length; length--;) {
							update(value, length, callback);
						}
					} else {
						// `forEach` can't be used to traverse an array in Opera <= 8.54,
						// as `Object#hasOwnProperty` returns `false` for array indices
						// (e.g., `![1, 2, 3].hasOwnProperty("0")`).
						forEach(value, function (property) {
							update(value, property, callback);
						});
					}
				}
				return callback.call(source, property, value);
			};

			// Public: `JSON.parse`. See ES 5.1 section 15.12.2.
			JSON3.parse = function (source, callback) {
				var result, value;
				Index = 0;
				Source = source;
				result = get(lex());
				// If a JSON string contains multiple tokens, it is invalid.
				if (lex() != "$") {
					abort();
				}
				// Reset the parser state.
				Index = Source = null;
				return callback && getClass.call(callback) == "[object Function]" ? walk((value = {}, value[""] = result, value), "", callback) : result;
			};
		}
	}

    return JSON3;

}).call(this);

main();
