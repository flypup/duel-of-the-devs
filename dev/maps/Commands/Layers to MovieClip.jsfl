
/* 
 *	Take selected layers and copy them to a new MovieClip Symbol.
 *	Place the new Symbol on a new layer above the selected layers.
  *	Remove previously selected layers.
*/


fl.outputPanel.clear();
var document = fl.getDocumentDOM();
var library = document.library;
var currentTimeline = document.getTimeline();

var selectedLayers = currentTimeline.getSelectedLayers();
var symbol = createMovieClipFromSelectedLayers(currentTimeline);


// add to timeline
currentTimeline.setSelectedLayers(Math.min.apply(Math, selectedLayers));
var layerIndex = currentTimeline.addNewLayer('__Layers to MovieClip__', 'normal', false);
currentTimeline.setSelectedLayers(layerIndex);
document.addItem({x: 0, y: 0}, symbol);

// delete copied layers
deleteLayers(currentTimeline, selectedLayers);

function createMovieClipFromSelectedLayers(timeline) {
	
	/* Name the new Symbol */

	var folderName = '__Layers to MovieClip__';

	// TODO: if a folder is selected, add the MovieClip there
	// TODO: if a symbol is selected, we could paste into the selected symbol
	//fl.trace('selected library items: '+ library.getSelectedItems().length);

	var symbolName = folderName +'/'+ (timeline.name || 'selection');
	var namesTaken = 1;
	while (library.itemExists(symbolName)) {
		symbolName = folderName +'/'+ (timeline.name || 'selection') +' ('+namesTaken+')';
		namesTaken++;
	}

	var newSymbol = true;

	/* Create the new Symbol */

	var success = library.addNewItem('movie clip', symbolName);
	if (!success) {
		return;
	}
	var index  = library.findItemIndex(symbolName);
	var symbol = library.items[index];

	/* Copy and paste each layer */

	fl.trace('Moving layers from '+timeline.name+' to symbol '+symbol.name);

	timeline.copyLayers();

	library.editItem(symbol.name);
	var layerPastedIndex = symbol.timeline.pasteLayers();
	if (layerPastedIndex < 0) {
		fl.trace('Paste failed: '+layerPastedIndex+'. Check that the selection was not duplicated in the current timeline.');
	} else {
		if (newSymbol) {
			symbol.timeline.deleteLayer(symbol.timeline.layers.length-1);
		}
	}
	/* Show the results */

	document.exitEditMode();
	library.expandFolder(true, false, folderName);

	return symbol;
}

function deleteLayers(timeline, layerIndexes) {
	timeline.setSelectedLayers(0);
	for (var i=layerIndexes.length; i-- >0;) {
		timeline.deleteLayer(layerIndexes[i]);
	} 
}

function selectionToLayers(timeline) {
	var selectedLayers = timeline.getSelectedLayers();
	var layers = [];
	var i;
	if (selectedLayers.length === 0) {
		alert('Select the layers in the timeline you want to make a symbol from.');
		return;
	}
	for (i=0; i<selectedLayers.length; i++) {
		layers.push(timeline.layers[i]);
	}
	fl.trace(layers);
	return layers;
}
