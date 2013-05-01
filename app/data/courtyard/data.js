ec && ec.loadMap({
  "name": "courtyard",
  "path": "data/courtyard",
  "width": 2560,
  "height": 3840,
  "layers": [
    {
      "name": "sky",
      "group": "background",
      "elements": [
        {
          "mapType": "container",
          "children": [
            {
              "x": 0,
              "y": 0,
              "width": 2560,
              "height": 1248,
              "rectangle": true,
              "fillColor": "#000033"
            }
          ]
        }
      ]
    },
    {
      "name": "moon",
      "group": "background",
      "elements": [
        {
          "name": "moon",
          "x": 1665,
          "y": 572,
          "width": 80,
          "height": 80,
          "regX": 40,
          "regY": 40,
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
          "image": "elements/moon.png"
        }
      ]
    },
    {
      "name": "trees",
      "group": "background",
      "elements": [
        {
          "name": "trees1",
          "x": 397.3,
          "y": 1245.05,
          "width": 800,
          "height": 640,
          "regX": 400,
          "regY": 540,
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
          "image": "elements/trees.png"
        },
        {
          "name": "trees2",
          "x": 2177.3,
          "y": 1245.05,
          "width": 800,
          "height": 640,
          "regX": 400,
          "regY": 540,
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
          "image": "elements/trees.png"
        }
      ]
    },
    {
      "name": "ground",
      "elements": [
        {
          "name": "ground",
          "x": 1280,
          "y": 2816,
          "visible": false,
          "mapType": "floor",
          "mass": 0,
          "mDepth": 1,
          "mHeight": 2048,
          "mWidth": 2560,
          "mZ": 0,
          "notes": "ground",
          "shape": "box",
          "type": "Box"
        },
        {
          "mapType": "container",
          "children": [
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
        }
      ]
    },
    {
      "name": "boundsNorthWest",
      "group": "top bounds",
      "elements": [
        {
          "name": "boundsNorthWest",
          "x": 444,
          "y": 1500,
          "visible": false,
          "mapType": "wall",
          "mass": 0,
          "mDepth": 2000,
          "mHeight": 128,
          "mWidth": 870,
          "mZ": 0,
          "shape": "box",
          "type": "Box"
        }
      ]
    },
    {
      "name": "boundsNorthEast",
      "group": "top bounds",
      "elements": [
        {
          "name": "boundsNorthEast",
          "x": 2120,
          "y": 1500,
          "visible": false,
          "mapType": "wall",
          "mass": 0,
          "mDepth": 2000,
          "mHeight": 128,
          "mWidth": 870,
          "mZ": 0,
          "shape": "box",
          "type": "Box"
        }
      ]
    },
    {
      "name": "boundsTop",
      "group": "top bounds",
      "elements": [
        {
          "name": "boundsTop",
          "x": 1280,
          "y": 1272,
          "visible": false,
          "mapType": "wall",
          "mass": 0,
          "mDepth": 2000,
          "mHeight": 128,
          "mWidth": 832,
          "mZ": 0,
          "shape": "box",
          "type": "Box"
        }
      ]
    },
    {
      "name": "wall bounds top",
      "elements": [
        {
          "name": "wallnorthwest",
          "x": 484,
          "y": 1536,
          "width": 768,
          "height": 160,
          "regX": 384,
          "regY": 160,
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
          "children": [
            {
              "x": 0,
              "y": 0,
              "width": 768,
              "height": 160,
              "rectangle": true,
              "fillColor": "#330000"
            }
          ]
        },
        {
          "name": "wallnortheast",
          "x": 2084,
          "y": 1536,
          "width": 768,
          "height": 160,
          "regX": 384,
          "regY": 160,
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
          "children": [
            {
              "x": 0,
              "y": 0,
              "width": 768,
              "height": 160,
              "rectangle": true,
              "fillColor": "#330000"
            }
          ]
        }
      ]
    },
    {
      "name": "roof bounds north",
      "elements": [
        {
          "mapType": "container",
          "children": [
            {
              "x": 0,
              "y": 1248,
              "width": 870,
              "height": 128,
              "rectangle": true,
              "fillImage": "elements/fills/rooftiles_64.png"
            },
            {
              "x": 1700,
              "y": 1248,
              "width": 863,
              "height": 128,
              "rectangle": true,
              "fillImage": "elements/fills/rooftiles_64.png"
            }
          ]
        }
      ]
    },
    {
      "name": "wall",
      "group": "temple",
      "elements": [
        {
          "name": "templeFront",
          "x": 1284,
          "y": 1584,
          "width": 832,
          "height": 274,
          "regX": 416,
          "regY": 274,
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
          "mDepth": 200,
          "mHeight": 480,
          "mWidth": 832,
          "mZ": 128,
          "shape": "box",
          "type": "Box",
          "image": "elements/templefront.png"
        }
      ]
    },
    {
      "name": "roof",
      "group": "temple",
      "elements": [
        {
          "name": "roof",
          "x": 1280,
          "y": 1188,
          "width": 1024,
          "height": 496,
          "regX": 512,
          "regY": 364,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 1280,
            "ty": 1188
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 32,
          "mHeight": 250,
          "mWidth": 1024,
          "mZ": 400,
          "shape": "polygons",
          "type": "Box",
          "image": "elements/roof.png",
          "shapes": [
            {
              "x": 0,
              "y": 0,
              "width": 1024,
              "height": 464,
              "polygons": [
                [
                  [
                    898.35,
                    0
                  ],
                  [
                    989.7,
                    236.7
                  ],
                  [
                    1024,
                    464
                  ],
                  [
                    0,
                    464
                  ],
                  [
                    34,
                    236.7
                  ],
                  [
                    126.2,
                    0
                  ]
                ]
              ]
            }
          ]
        }
      ]
    },
    {
      "name": "ledge right",
      "group": "ledge",
      "elements": [
        {
          "name": "ledgesidewest",
          "x": 2080,
          "y": 1600,
          "width": 760,
          "height": 128,
          "regX": 380,
          "regY": 64,
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
          "children": [
            {
              "x": 0,
              "y": 0,
              "width": 760,
              "height": 128,
              "rectangle": true,
              "fillColor": "#87867b"
            }
          ]
        }
      ]
    },
    {
      "name": "ledge left",
      "group": "ledge",
      "elements": [
        {
          "name": "ledgesidewest",
          "x": 488,
          "y": 1600,
          "width": 760,
          "height": 128,
          "regX": 380,
          "regY": 64,
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
          "children": [
            {
              "x": 0,
              "y": 0,
              "width": 760,
              "height": 128,
              "rectangle": true,
              "fillColor": "#87867b"
            }
          ]
        }
      ]
    },
    {
      "name": "ledge center",
      "group": "ledge",
      "elements": [
        {
          "name": "ledgefront",
          "x": 1284,
          "y": 1624,
          "width": 832,
          "height": 80,
          "regX": 416,
          "regY": 40,
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
          "children": [
            {
              "x": 0,
              "y": 0,
              "width": 832,
              "height": 80,
              "rectangle": true,
              "fillColor": "#87867b"
            }
          ]
        }
      ]
    },
    {
      "name": "ledge wall",
      "group": "ledge",
      "elements": [
        {
          "mapType": "container",
          "children": [
            {
              "x": 80,
              "y": 1664,
              "width": 960,
              "height": 128,
              "rectangle": true,
              "fillImage": "elements/fills/bricksgray2_64.png"
            },
            {
              "x": 1520,
              "y": 1664,
              "width": 960,
              "height": 128,
              "rectangle": true,
              "fillImage": "elements/fills/bricksgray2_64.png"
            }
          ]
        }
      ]
    },
    {
      "name": "ledge bannister",
      "group": "ledge",
      "elements": [
        {
          "name": "bannister1",
          "x": 559,
          "y": 1664,
          "width": 960,
          "height": 80,
          "regX": 480,
          "regY": 80,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 559,
            "ty": 1664
          },
          "mapType": "wall",
          "mDepth": 56,
          "mHeight": 16,
          "mWidth": 960,
          "mZ": 128,
          "shape": "box",
          "type": "Box",
          "image": "elements/bannister.png"
        },
        {
          "name": "bannister2",
          "x": 1999,
          "y": 1664,
          "width": 960,
          "height": 80,
          "regX": 480,
          "regY": 80,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 1999,
            "ty": 1664
          },
          "mapType": "wall",
          "mDepth": 56,
          "mHeight": 16,
          "mWidth": 960,
          "mZ": 128,
          "shape": "box",
          "type": "Box",
          "image": "elements/bannister.png"
        }
      ]
    },
    {
      "name": "steps",
      "group": "ledge",
      "elements": [
        {
          "name": "stairs",
          "x": 1280,
          "y": 1920,
          "width": 480,
          "height": 256,
          "regX": 240,
          "regY": 256,
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
          "image": "elements/steps.png"
        }
      ]
    },
    {
      "name": "entities",
      "group": "entities",
      "elements": [
        {
          "name": "cauldron2",
          "x": 1632,
          "y": 3188,
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
      "name": "wall bounds sides",
      "elements": [
        {
          "name": "wallwestnorth",
          "x": 54,
          "y": 2692,
          "width": 108,
          "height": 427,
          "regX": 54,
          "regY": 427,
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
          "mHeight": 1152,
          "mWidth": 108,
          "mZ": 0,
          "shape": "box",
          "type": "Box",
          "children": [
            {
              "x": 0,
              "y": 0,
              "width": 108,
              "height": 427,
              "polygons": [
                [
                  [
                    0,
                    0
                  ],
                  [
                    108,
                    107
                  ],
                  [
                    108,
                    427
                  ],
                  [
                    0,
                    427
                  ]
                ]
              ],
              "fillColor": "#330000"
            }
          ]
        },
        {
          "name": "walleastnorth",
          "x": 2506,
          "y": 2692,
          "width": 108,
          "height": 427,
          "regX": 54,
          "regY": 427,
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
          "mHeight": 1152,
          "mWidth": 108,
          "mZ": 0,
          "shape": "box",
          "type": "Box",
          "children": [
            {
              "x": 0,
              "y": 0,
              "width": 108,
              "height": 427,
              "polygons": [
                [
                  [
                    0,
                    0
                  ],
                  [
                    108,
                    107
                  ],
                  [
                    108,
                    427
                  ],
                  [
                    0,
                    427
                  ]
                ]
              ],
              "fillColor": "#330000"
            }
          ]
        },
        {
          "name": "wallwestsouth",
          "x": 54,
          "y": 3840,
          "visible": false,
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
          "name": "walleastsouth",
          "x": 2506,
          "y": 3840,
          "visible": false,
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
      "name": "roof sides north",
      "elements": [
        {
          "name": "roofsideeastnorth",
          "x": 2496,
          "y": 1820,
          "width": 128,
          "height": 1145,
          "regX": 64,
          "regY": 572.5,
          "matrix": {
            "a": -1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 2496,
            "ty": 1820
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 1020,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "children": [
            {
              "x": 0,
              "y": -0.5,
              "width": 128,
              "height": 256,
              "image": "elements/roofsidepanel.png"
            },
            {
              "x": 0,
              "y": 126.5,
              "width": 128,
              "height": 256,
              "image": "elements/roofsidepanel.png"
            },
            {
              "x": 0,
              "y": 253.5,
              "width": 128,
              "height": 256,
              "image": "elements/roofsidepanel.png"
            },
            {
              "x": 0,
              "y": 379.5,
              "width": 128,
              "height": 256,
              "image": "elements/roofsidepanel.png"
            },
            {
              "x": 0,
              "y": 507.5,
              "width": 128,
              "height": 256,
              "image": "elements/roofsidepanel.png"
            },
            {
              "x": 0,
              "y": 634.5,
              "width": 128,
              "height": 256,
              "image": "elements/roofsidepanel.png"
            },
            {
              "x": 0,
              "y": 761.5,
              "width": 128,
              "height": 256,
              "image": "elements/roofsidepanel.png"
            },
            {
              "x": 0,
              "y": 888.5,
              "width": 128,
              "height": 256,
              "image": "elements/roofsidepanel.png"
            }
          ]
        },
        {
          "name": "roofsidewestnorth",
          "x": 64,
          "y": 1820,
          "width": 128,
          "height": 1145,
          "regX": 64,
          "regY": 572.5,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 64,
            "ty": 1820
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 1020,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "children": [
            {
              "x": 0,
              "y": -0.5,
              "width": 128,
              "height": 256,
              "image": "elements/roofsidepanel.png"
            },
            {
              "x": 0,
              "y": 126.5,
              "width": 128,
              "height": 256,
              "image": "elements/roofsidepanel.png"
            },
            {
              "x": 0,
              "y": 253.5,
              "width": 128,
              "height": 256,
              "image": "elements/roofsidepanel.png"
            },
            {
              "x": 0,
              "y": 379.5,
              "width": 128,
              "height": 256,
              "image": "elements/roofsidepanel.png"
            },
            {
              "x": 0,
              "y": 507.5,
              "width": 128,
              "height": 256,
              "image": "elements/roofsidepanel.png"
            },
            {
              "x": 0,
              "y": 634.5,
              "width": 128,
              "height": 256,
              "image": "elements/roofsidepanel.png"
            },
            {
              "x": 0,
              "y": 761.5,
              "width": 128,
              "height": 256,
              "image": "elements/roofsidepanel.png"
            },
            {
              "x": 0,
              "y": 888.5,
              "width": 128,
              "height": 256,
              "image": "elements/roofsidepanel.png"
            }
          ]
        }
      ]
    },
    {
      "name": "roof sides south",
      "elements": [
        {
          "name": "roofsideeastsouth",
          "x": 2496,
          "y": 3388,
          "width": 128,
          "height": 1145,
          "regX": 64,
          "regY": 572.5,
          "matrix": {
            "a": -1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 2496,
            "ty": 3388
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 1016,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "children": [
            {
              "x": 0,
              "y": -0.5,
              "width": 128,
              "height": 256,
              "image": "elements/roofsidepanel.png"
            },
            {
              "x": 0,
              "y": 126.5,
              "width": 128,
              "height": 256,
              "image": "elements/roofsidepanel.png"
            },
            {
              "x": 0,
              "y": 253.5,
              "width": 128,
              "height": 256,
              "image": "elements/roofsidepanel.png"
            },
            {
              "x": 0,
              "y": 379.5,
              "width": 128,
              "height": 256,
              "image": "elements/roofsidepanel.png"
            },
            {
              "x": 0,
              "y": 507.5,
              "width": 128,
              "height": 256,
              "image": "elements/roofsidepanel.png"
            },
            {
              "x": 0,
              "y": 634.5,
              "width": 128,
              "height": 256,
              "image": "elements/roofsidepanel.png"
            },
            {
              "x": 0,
              "y": 761.5,
              "width": 128,
              "height": 256,
              "image": "elements/roofsidepanel.png"
            },
            {
              "x": 0,
              "y": 888.5,
              "width": 128,
              "height": 256,
              "image": "elements/roofsidepanel.png"
            }
          ]
        },
        {
          "name": "roofsidewestsouth",
          "x": 64,
          "y": 3388,
          "width": 128,
          "height": 1145,
          "regX": 64,
          "regY": 572.5,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 64,
            "ty": 3388
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 64,
          "mHeight": 1016,
          "mWidth": 128,
          "mZ": 288,
          "shape": "box",
          "type": "Box",
          "children": [
            {
              "x": 0,
              "y": -0.5,
              "width": 128,
              "height": 256,
              "image": "elements/roofsidepanel.png"
            },
            {
              "x": 0,
              "y": 126.5,
              "width": 128,
              "height": 256,
              "image": "elements/roofsidepanel.png"
            },
            {
              "x": 0,
              "y": 253.5,
              "width": 128,
              "height": 256,
              "image": "elements/roofsidepanel.png"
            },
            {
              "x": 0,
              "y": 379.5,
              "width": 128,
              "height": 256,
              "image": "elements/roofsidepanel.png"
            },
            {
              "x": 0,
              "y": 507.5,
              "width": 128,
              "height": 256,
              "image": "elements/roofsidepanel.png"
            },
            {
              "x": 0,
              "y": 634.5,
              "width": 128,
              "height": 256,
              "image": "elements/roofsidepanel.png"
            },
            {
              "x": 0,
              "y": 761.5,
              "width": 128,
              "height": 256,
              "image": "elements/roofsidepanel.png"
            },
            {
              "x": 0,
              "y": 888.5,
              "width": 128,
              "height": 256,
              "image": "elements/roofsidepanel.png"
            }
          ]
        }
      ]
    },
    {
      "name": "roof bounds south",
      "elements": [
        {
          "mapType": "container",
          "children": [
            {
              "x": 0,
              "y": 3776,
              "width": 2560,
              "height": 64,
              "polygons": [
                [
                  [
                    2490,
                    0
                  ],
                  [
                    2560,
                    64
                  ],
                  [
                    0,
                    64
                  ],
                  [
                    70,
                    0
                  ]
                ]
              ],
              "fillImage": "elements/fills/rooftiles_64.png"
            }
          ]
        }
      ]
    }
  ]
});