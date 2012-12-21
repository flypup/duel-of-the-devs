﻿ec.loadMap({
  "name": "courtyard",
  "path": "data/courtyard",
  "width": 2560,
  "height": 3840,
  "layers": [
    {
      "name": "sky",
      "shapes": [
        {
          "x": 0,
          "y": 0,
          "width": 2560,
          "height": 1280,
          "rectangle": true,
          "fillColor": "#000033"
        }
      ]
    },
    {
      "name": "moon",
      "elements": [
        {
          "name": "moon",
          "x": 1665,
          "y": 572,
          "regX": 40,
          "regY": 40,
          "width": 80,
          "height": 80,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 1665,
            "ty": 572
          },
          "mapType": "parallax",
          "mDepth": 0,
          "mHeight": 80,
          "mWidth": 80,
          "mZ": 0,
          "shape": "box",
          "type": "Box",
          "image": "map/moon.png"
        }
      ]
    },
    {
      "name": "trees",
      "elements": [
        {
          "name": "trees1",
          "x": 397.3,
          "y": 1245.05,
          "regX": 400,
          "regY": 540,
          "width": 800,
          "height": 640,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 397.3,
            "ty": 1245.05
          },
          "mapType": "parallax",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 64,
          "mWidth": 800,
          "mZ": 0,
          "shape": "box",
          "type": "Box",
          "image": "map/trees.png"
        },
        {
          "name": "trees2",
          "x": 2177.3,
          "y": 1245.05,
          "regX": 400,
          "regY": 540,
          "width": 800,
          "height": 640,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 2177.3,
            "ty": 1245.05
          },
          "mapType": "parallax",
          "mass": 0,
          "mDepth": 0,
          "mHeight": 640,
          "mWidth": 800,
          "mZ": 0,
          "shape": "box",
          "type": "Box",
          "image": "map/trees.png"
        }
      ]
    },
    {
      "name": "wall bounds top",
      "elements": [
        {
          "name": "wallnorth1",
          "x": 484,
          "y": 1536,
          "regX": 384,
          "regY": 160,
          "width": 768,
          "height": 160,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 484,
            "ty": 1536
          },
          "mapType": "wall",
          "mass": 0,
          "mDepth": 160,
          "mHeight": 128,
          "mWidth": 768,
          "mZ": 128,
          "shape": "box",
          "type": "Box",
          "image": "map/wallnorth.png"
        },
        {
          "name": "wallnorth1",
          "x": 2084,
          "y": 1536,
          "regX": 384,
          "regY": 160,
          "width": 768,
          "height": 160,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 2084,
            "ty": 1536
          },
          "mapType": "wall",
          "mass": 0,
          "mDepth": 160,
          "mHeight": 128,
          "mWidth": 768,
          "mZ": 128,
          "shape": "box",
          "type": "Box",
          "image": "map/wallnorth.png"
        }
      ]
    },
    {
      "name": "ledge left",
      "elements": [
        {
          "name": "ledgesidewest",
          "x": 488,
          "y": 1600,
          "regX": 380,
          "regY": 64,
          "width": 760,
          "height": 128,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 488,
            "ty": 1600
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 128,
          "mHeight": 128,
          "mWidth": 760,
          "mZ": 0,
          "shape": "box",
          "type": "Box",
          "image": "map/ledgeside.png"
        }
      ]
    },
    {
      "name": "ledge center",
      "elements": [
        {
          "name": "ledgefront",
          "x": 1284,
          "y": 1624,
          "regX": 416,
          "regY": 40,
          "width": 832,
          "height": 80,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 1284,
            "ty": 1624
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 128,
          "mHeight": 80,
          "mWidth": 832,
          "mZ": 0,
          "shape": "box",
          "type": "Box",
          "image": "map/ledgefront.png"
        }
      ]
    },
    {
      "name": "ledge right",
      "elements": [
        {
          "name": "ledgesidewest",
          "x": 2080,
          "y": 1600,
          "regX": 380,
          "regY": 64,
          "width": 760,
          "height": 128,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 2080,
            "ty": 1600
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 128,
          "mHeight": 128,
          "mWidth": 760,
          "mZ": 0,
          "shape": "box",
          "type": "Box",
          "image": "map/ledgeside.png"
        }
      ]
    },
    {
      "name": "roof bounds north",
      "shapes": [
        {
          "x": 0,
          "y": 1248,
          "width": 896,
          "height": 128,
          "rectangle": true,
          "fillColor": "#336666"
        },
        {
          "x": 1664,
          "y": 1248,
          "width": 896,
          "height": 128,
          "rectangle": true,
          "fillColor": "#336666"
        }
      ]
    },
    {
      "name": "wall",
      "elements": [
        {
          "name": "templeFront",
          "x": 1284,
          "y": 1584,
          "regX": 416,
          "regY": 274,
          "width": 832,
          "height": 274,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 1284,
            "ty": 1584
          },
          "mapType": "wall",
          "mass": 0,
          "mDepth": 320,
          "mHeight": 480,
          "mWidth": 832,
          "mZ": 128,
          "shape": "box",
          "type": "Box",
          "image": "map/templefront.png"
        }
      ]
    },
    {
      "name": "ledge wall",
      "shapes": [
        {
          "x": 80,
          "y": 1664,
          "width": 960,
          "height": 128,
          "rectangle": true,
          "fillImage": "map/fills/bricksgray2_64.png"
        },
        {
          "x": 1520,
          "y": 1664,
          "width": 960,
          "height": 128,
          "rectangle": true,
          "fillImage": "map/fills/bricksgray2_64.png"
        }
      ]
    },
    {
      "name": "ledge bannister",
      "elements": [
        {
          "name": "bannister1",
          "x": 560,
          "y": 1664,
          "regX": 480,
          "regY": 80,
          "width": 960,
          "height": 80,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 560,
            "ty": 1664
          },
          "mapType": "wall",
          "mDepth": 56,
          "mHeight": 16,
          "mWidth": 960,
          "mZ": 128,
          "shape": "box",
          "type": "Box",
          "image": "map/bannister.png"
        },
        {
          "name": "bannister2",
          "x": 2000,
          "y": 1664,
          "regX": 480,
          "regY": 80,
          "width": 960,
          "height": 80,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 2000,
            "ty": 1664
          },
          "mapType": "wall",
          "mDepth": 56,
          "mHeight": 16,
          "mWidth": 960,
          "mZ": 128,
          "shape": "box",
          "type": "Box",
          "image": "map/bannister.png"
        }
      ]
    },
    {
      "name": "courtyard",
      "group": "courtyard",
      "elements": [
        {
          "name": "instance0",
          "x": 1280,
          "y": 2816,
          "regX": 0,
          "regY": 0,
          "width": 0,
          "height": 0,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 1280,
            "ty": 2816
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 0,
          "mHeight": 1984,
          "mWidth": 2560,
          "mZ": 0,
          "shape": "box",
          "type": "Box"
        }
      ],
      "shapes": [
        {
          "x": 1520,
          "y": 3068,
          "width": 932,
          "height": 708,
          "rectangle": true,
          "fillColor": "#c0c0b6"
        },
        {
          "x": 1520,
          "y": 1792,
          "width": 932,
          "height": 900,
          "rectangle": true,
          "fillColor": "#c0c0b6"
        },
        {
          "x": 108,
          "y": 3068,
          "width": 932,
          "height": 708,
          "rectangle": true,
          "fillColor": "#c0c0b6"
        },
        {
          "x": 108,
          "y": 1792,
          "width": 932,
          "height": 900,
          "rectangle": true,
          "fillColor": "#c0c0b6"
        },
        {
          "x": 1040,
          "y": 1920,
          "width": 480,
          "height": 772,
          "rectangle": true,
          "fillColor": "#ada9a8"
        },
        {
          "x": 1536,
          "y": 2692,
          "width": 1024,
          "height": 376,
          "rectangle": true,
          "fillColor": "#ada9a8"
        },
        {
          "x": 1024,
          "y": 2692,
          "width": 512,
          "height": 376,
          "rectangle": true,
          "fillColor": "#ada9a8"
        },
        {
          "x": 0,
          "y": 2692,
          "width": 1024,
          "height": 376,
          "rectangle": true,
          "fillColor": "#ada9a8"
        },
        {
          "x": 1040,
          "y": 3068,
          "width": 480,
          "height": 708,
          "rectangle": true,
          "fillColor": "#ada9a8"
        }
      ]
    },
    {
      "name": "steps",
      "elements": [
        {
          "name": "stairs",
          "x": 1280,
          "y": 1920,
          "regX": 240,
          "regY": 256,
          "width": 480,
          "height": 256,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 1280,
            "ty": 1920
          },
          "mapType": "steps",
          "mDepth": 128,
          "mHeight": 128,
          "mWidth": 480,
          "mZ": 0,
          "shape": "box",
          "type": "Box",
          "image": "map/steps.png"
        }
      ]
    },
    {
      "name": "entities",
      "elements": [
        {
          "name": "cauldron2",
          "x": 1632,
          "y": 3188,
          "regX": 128,
          "regY": 148,
          "width": 256,
          "height": 255,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 1632,
            "ty": 3188
          },
          "mapType": "entity",
          "mass": 0,
          "mDepth": 48,
          "mHeight": 192,
          "mWidth": 192,
          "mZ": 0,
          "shape": "circle",
          "type": "Circle"
        },
        {
          "name": "cauldron1",
          "x": 926,
          "y": 3188,
          "regX": 128,
          "regY": 148,
          "width": 256,
          "height": 255,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 926,
            "ty": 3188
          },
          "mapType": "entity",
          "mass": 0,
          "mDepth": 48,
          "mHeight": 192,
          "mWidth": 192,
          "mZ": 0,
          "shape": "circle",
          "type": "Circle"
        },
        {
          "name": "lionStatue5",
          "x": 1096,
          "y": 2136,
          "regX": 40,
          "regY": 180,
          "width": 80,
          "height": 212,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 1096,
            "ty": 2136
          },
          "mapType": "entity",
          "mass": 0,
          "mDepth": 148,
          "mHeight": 64,
          "mWidth": 64,
          "mZ": 0,
          "shape": "box",
          "type": "Box"
        },
        {
          "name": "lionStatue6",
          "x": 1464,
          "y": 2136,
          "regX": 40,
          "regY": 180,
          "width": 80,
          "height": 212,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 1464,
            "ty": 2136
          },
          "mapType": "entity",
          "mass": 0,
          "mDepth": 148,
          "mHeight": 64,
          "mWidth": 64,
          "mZ": 0,
          "shape": "box",
          "type": "Box"
        },
        {
          "name": "lionStatue3",
          "x": 1096,
          "y": 2436,
          "regX": 40,
          "regY": 180,
          "width": 80,
          "height": 212,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 1096,
            "ty": 2436
          },
          "mapType": "entity",
          "mass": 0,
          "mDepth": 148,
          "mHeight": 64,
          "mWidth": 64,
          "mZ": 0,
          "shape": "box",
          "type": "Box"
        },
        {
          "name": "lionStatue4",
          "x": 1464,
          "y": 2436,
          "regX": 40,
          "regY": 180,
          "width": 80,
          "height": 212,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 1464,
            "ty": 2436
          },
          "mapType": "entity",
          "mass": 0,
          "mDepth": 148,
          "mHeight": 64,
          "mWidth": 64,
          "mZ": 0,
          "shape": "box",
          "type": "Box"
        },
        {
          "name": "lionStatue1",
          "x": 1096,
          "y": 2740,
          "regX": 40,
          "regY": 180,
          "width": 80,
          "height": 212,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 1096,
            "ty": 2740
          },
          "mapType": "entity",
          "mass": 0,
          "mDepth": 148,
          "mHeight": 64,
          "mWidth": 64,
          "mZ": 0,
          "shape": "box",
          "type": "Box"
        },
        {
          "name": "lionStatue2",
          "x": 1464,
          "y": 2740,
          "regX": 40,
          "regY": 180,
          "width": 80,
          "height": 212,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 1464,
            "ty": 2740
          },
          "mapType": "entity",
          "mass": 0,
          "mDepth": 148,
          "mHeight": 64,
          "mWidth": 64,
          "mZ": 0,
          "shape": "box",
          "type": "Box"
        }
      ]
    },
    {
      "name": "wall bounds south sides",
      "elements": [
        {
          "name": "wallsouthwest",
          "x": 54,
          "y": 3840,
          "regX": 0,
          "regY": 0,
          "width": 0,
          "height": 0,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 54,
            "ty": 3840
          },
          "mapType": "wall",
          "mass": 0,
          "mDepth": 288,
          "mHeight": 772,
          "mWidth": 108,
          "mZ": 0,
          "shape": "box",
          "type": "Box"
        },
        {
          "name": "wallsouthwest",
          "x": 2506,
          "y": 3840,
          "regX": 0,
          "regY": 0,
          "width": 0,
          "height": 0,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 2506,
            "ty": 3840
          },
          "mapType": "wall",
          "mass": 0,
          "mDepth": 288,
          "mHeight": 772,
          "mWidth": 108,
          "mZ": 0,
          "shape": "box",
          "type": "Box"
        }
      ]
    },
    {
      "name": "wall bounds north sides",
      "elements": [
        {
          "name": "wallnorthwest",
          "x": 54,
          "y": 2692,
          "regX": 54,
          "regY": 427,
          "width": 108,
          "height": 427,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 54,
            "ty": 2692
          },
          "mapType": "wall",
          "mass": 0,
          "mDepth": 288,
          "mHeight": 1200,
          "mWidth": 108,
          "mZ": 0,
          "shape": "box",
          "type": "Box",
          "image": "map/wallnortheastwest.png"
        },
        {
          "name": "wallnortheast",
          "x": 2506,
          "y": 2692,
          "regX": 54,
          "regY": 427,
          "width": 108,
          "height": 427,
          "matrix": {
            "a": -1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 2506,
            "ty": 2692
          },
          "mapType": "wall",
          "mass": 0,
          "mDepth": 288,
          "mHeight": 1200,
          "mWidth": 108,
          "mZ": 0,
          "shape": "box",
          "type": "Box",
          "image": "map/wallnortheastwest.png"
        }
      ]
    },
    {
      "name": "roof bounds east",
      "elements": [
        {
          "name": "instance17",
          "x": 2496,
          "y": 1376,
          "regX": 64,
          "regY": 128,
          "width": 128,
          "height": 256,
          "matrix": {
            "a": -1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 2496,
            "ty": 1376
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 128,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "image": "map/roofsidepanel.png"
        },
        {
          "name": "instance16",
          "x": 2496,
          "y": 1503,
          "regX": 64,
          "regY": 128,
          "width": 128,
          "height": 256,
          "matrix": {
            "a": -1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 2496,
            "ty": 1503
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 128,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "image": "map/roofsidepanel.png"
        },
        {
          "name": "instance15",
          "x": 2496,
          "y": 1630,
          "regX": 64,
          "regY": 128,
          "width": 128,
          "height": 256,
          "matrix": {
            "a": -1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 2496,
            "ty": 1630
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 128,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "image": "map/roofsidepanel.png"
        },
        {
          "name": "instance14",
          "x": 2496,
          "y": 1757,
          "regX": 64,
          "regY": 128,
          "width": 128,
          "height": 256,
          "matrix": {
            "a": -1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 2496,
            "ty": 1757
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 128,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "image": "map/roofsidepanel.png"
        },
        {
          "name": "instance13",
          "x": 2496,
          "y": 1884,
          "regX": 64,
          "regY": 128,
          "width": 128,
          "height": 256,
          "matrix": {
            "a": -1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 2496,
            "ty": 1884
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 128,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "image": "map/roofsidepanel.png"
        },
        {
          "name": "instance12",
          "x": 2496,
          "y": 2011,
          "regX": 64,
          "regY": 128,
          "width": 128,
          "height": 256,
          "matrix": {
            "a": -1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 2496,
            "ty": 2011
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 128,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "image": "map/roofsidepanel.png"
        },
        {
          "name": "instance11",
          "x": 2496,
          "y": 2138,
          "regX": 64,
          "regY": 128,
          "width": 128,
          "height": 256,
          "matrix": {
            "a": -1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 2496,
            "ty": 2138
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 128,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "image": "map/roofsidepanel.png"
        },
        {
          "name": "instance10",
          "x": 2496,
          "y": 2265,
          "regX": 64,
          "regY": 128,
          "width": 128,
          "height": 256,
          "matrix": {
            "a": -1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 2496,
            "ty": 2265
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 128,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "image": "map/roofsidepanel.png"
        },
        {
          "name": "instance9",
          "x": 2496,
          "y": 2784.1,
          "regX": 64,
          "regY": 128,
          "width": 128,
          "height": 256,
          "matrix": {
            "a": -1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 2496,
            "ty": 2784.1
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 128,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "image": "map/roofsidepanel.png"
        },
        {
          "name": "instance8",
          "x": 2496,
          "y": 2912,
          "regX": 64,
          "regY": 128,
          "width": 128,
          "height": 256,
          "matrix": {
            "a": -1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 2496,
            "ty": 2912
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 128,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "image": "map/roofsidepanel.png"
        },
        {
          "name": "instance7",
          "x": 2496,
          "y": 3039,
          "regX": 64,
          "regY": 128,
          "width": 128,
          "height": 256,
          "matrix": {
            "a": -1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 2496,
            "ty": 3039
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 128,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "image": "map/roofsidepanel.png"
        },
        {
          "name": "instance6",
          "x": 2496,
          "y": 3166,
          "regX": 64,
          "regY": 128,
          "width": 128,
          "height": 256,
          "matrix": {
            "a": -1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 2496,
            "ty": 3166
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 128,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "image": "map/roofsidepanel.png"
        },
        {
          "name": "instance5",
          "x": 2496,
          "y": 3293,
          "regX": 64,
          "regY": 128,
          "width": 128,
          "height": 256,
          "matrix": {
            "a": -1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 2496,
            "ty": 3293
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 128,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "image": "map/roofsidepanel.png"
        },
        {
          "name": "instance4",
          "x": 2496,
          "y": 3420,
          "regX": 64,
          "regY": 128,
          "width": 128,
          "height": 256,
          "matrix": {
            "a": -1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 2496,
            "ty": 3420
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 128,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "image": "map/roofsidepanel.png"
        },
        {
          "name": "instance3",
          "x": 2496,
          "y": 3547,
          "regX": 64,
          "regY": 128,
          "width": 128,
          "height": 256,
          "matrix": {
            "a": -1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 2496,
            "ty": 3547
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 128,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "image": "map/roofsidepanel.png"
        },
        {
          "name": "instance2",
          "x": 2496,
          "y": 3674,
          "regX": 64,
          "regY": 128,
          "width": 128,
          "height": 256,
          "matrix": {
            "a": -1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 2496,
            "ty": 3674
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 128,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "image": "map/roofsidepanel.png"
        },
        {
          "name": "instance1",
          "x": 2496,
          "y": 3801,
          "regX": 64,
          "regY": 128,
          "width": 128,
          "height": 256,
          "matrix": {
            "a": -1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 2496,
            "ty": 3801
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 128,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "image": "map/roofsidepanel.png"
        },
        {
          "name": "instance0",
          "x": 2496,
          "y": 3928,
          "regX": 64,
          "regY": 128,
          "width": 128,
          "height": 256,
          "matrix": {
            "a": -1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 2496,
            "ty": 3928
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 128,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "image": "map/roofsidepanel.png"
        }
      ]
    },
    {
      "name": "roof bounds west",
      "elements": [
        {
          "name": "instance17",
          "x": 64,
          "y": 1376,
          "regX": 64,
          "regY": 128,
          "width": 128,
          "height": 256,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 64,
            "ty": 1376
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 128,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "image": "map/roofsidepanel.png"
        },
        {
          "name": "instance16",
          "x": 64,
          "y": 1503,
          "regX": 64,
          "regY": 128,
          "width": 128,
          "height": 256,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 64,
            "ty": 1503
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 128,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "image": "map/roofsidepanel.png"
        },
        {
          "name": "instance15",
          "x": 64,
          "y": 1630,
          "regX": 64,
          "regY": 128,
          "width": 128,
          "height": 256,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 64,
            "ty": 1630
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 128,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "image": "map/roofsidepanel.png"
        },
        {
          "name": "instance14",
          "x": 64,
          "y": 1757,
          "regX": 64,
          "regY": 128,
          "width": 128,
          "height": 256,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 64,
            "ty": 1757
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 128,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "image": "map/roofsidepanel.png"
        },
        {
          "name": "instance13",
          "x": 64,
          "y": 1884,
          "regX": 64,
          "regY": 128,
          "width": 128,
          "height": 256,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 64,
            "ty": 1884
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 128,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "image": "map/roofsidepanel.png"
        },
        {
          "name": "instance12",
          "x": 64,
          "y": 2011,
          "regX": 64,
          "regY": 128,
          "width": 128,
          "height": 256,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 64,
            "ty": 2011
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 128,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "image": "map/roofsidepanel.png"
        },
        {
          "name": "instance11",
          "x": 64,
          "y": 2138,
          "regX": 64,
          "regY": 128,
          "width": 128,
          "height": 256,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 64,
            "ty": 2138
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 128,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "image": "map/roofsidepanel.png"
        },
        {
          "name": "instance10",
          "x": 64,
          "y": 2265,
          "regX": 64,
          "regY": 128,
          "width": 128,
          "height": 256,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 64,
            "ty": 2265
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 128,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "image": "map/roofsidepanel.png"
        },
        {
          "name": "instance9",
          "x": 64,
          "y": 2784,
          "regX": 64,
          "regY": 128,
          "width": 128,
          "height": 256,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 64,
            "ty": 2784
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 128,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "image": "map/roofsidepanel.png"
        },
        {
          "name": "instance8",
          "x": 64,
          "y": 2912,
          "regX": 64,
          "regY": 128,
          "width": 128,
          "height": 256,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 64,
            "ty": 2912
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 128,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "image": "map/roofsidepanel.png"
        },
        {
          "name": "instance7",
          "x": 64,
          "y": 3039,
          "regX": 64,
          "regY": 128,
          "width": 128,
          "height": 256,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 64,
            "ty": 3039
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 128,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "image": "map/roofsidepanel.png"
        },
        {
          "name": "instance6",
          "x": 64,
          "y": 3166,
          "regX": 64,
          "regY": 128,
          "width": 128,
          "height": 256,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 64,
            "ty": 3166
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 128,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "image": "map/roofsidepanel.png"
        },
        {
          "name": "instance5",
          "x": 64,
          "y": 3293,
          "regX": 64,
          "regY": 128,
          "width": 128,
          "height": 256,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 64,
            "ty": 3293
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 128,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "image": "map/roofsidepanel.png"
        },
        {
          "name": "instance4",
          "x": 64,
          "y": 3420,
          "regX": 64,
          "regY": 128,
          "width": 128,
          "height": 256,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 64,
            "ty": 3420
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 128,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "image": "map/roofsidepanel.png"
        },
        {
          "name": "instance3",
          "x": 64,
          "y": 3547,
          "regX": 64,
          "regY": 128,
          "width": 128,
          "height": 256,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 64,
            "ty": 3547
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 128,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "image": "map/roofsidepanel.png"
        },
        {
          "name": "instance2",
          "x": 64,
          "y": 3674,
          "regX": 64,
          "regY": 128,
          "width": 128,
          "height": 256,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 64,
            "ty": 3674
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 128,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "image": "map/roofsidepanel.png"
        },
        {
          "name": "instance1",
          "x": 64,
          "y": 3801,
          "regX": 64,
          "regY": 128,
          "width": 128,
          "height": 256,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 64,
            "ty": 3801
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 128,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "image": "map/roofsidepanel.png"
        },
        {
          "name": "instance0",
          "x": 64,
          "y": 3928,
          "regX": 64,
          "regY": 128,
          "width": 128,
          "height": 256,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 64,
            "ty": 3928
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 128,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "image": "map/roofsidepanel.png"
        }
      ]
    },
    {
      "name": "roof bounds south",
      "shapes": [
        {
          "x": 0,
          "y": 3776,
          "width": 2560,
          "height": 64,
          "polygons": [
            [
              [
                2560,
                0
              ],
              [
                2490,
                64
              ],
              [
                70,
                64
              ],
              [
                0,
                0
              ]
            ]
          ],
          "fillColor": "#336666"
        }
      ]
    },
    {
      "name": "roof",
      "elements": [
        {
          "name": "roof",
          "x": 1280,
          "y": 1188,
          "regX": 512,
          "regY": 364,
          "width": 1024,
          "height": 496,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 1280,
            "ty": 1188
          },
          "mapType": "floor",
          "mDepth": 32,
          "mHeight": 250,
          "mWidth": 1024,
          "mZ": 400,
          "notes": "Needs better shape",
          "shape": "box",
          "type": "Box",
          "image": "map/roof.png"
        }
      ]
    }
  ]
});
