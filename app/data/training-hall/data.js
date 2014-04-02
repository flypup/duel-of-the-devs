ec && ec.loadMap({
  "name": "training-hall",
  "path": "data/training-hall",
  "width": 8192,
  "height": 8192,
  "layers": [
    {
      "name": "bounds",
      "elements": [
        {
          "name": "bounds",
          "x": 0,
          "y": 0,
          "visible": false,
          "mapType": "wall",
          "mass": 0,
          "depth": -1,
          "mHeight": 0,
          "mZ": 0,
          "shape": "polygons",
          "type": "Box",
          "shapes": [
            {
              "x": 52,
              "y": 1468.3,
              "width": 1786.4,
              "height": 170.05,
              "polygons": [
                [
                  [
                    0,
                    0
                  ],
                  [
                    1786.4,
                    0
                  ],
                  [
                    872.2,
                    170.05
                  ]
                ]
              ]
            },
            {
              "x": 124,
              "y": 276,
              "width": 284.1,
              "height": 1352.35,
              "polygons": [
                [
                  [
                    284.1,
                    0
                  ],
                  [
                    92.05,
                    1352.35
                  ],
                  [
                    0,
                    528.15
                  ]
                ]
              ]
            },
            {
              "x": 1518.35,
              "y": 318,
              "width": 308.1,
              "height": 1294.35,
              "polygons": [
                [
                  [
                    0,
                    0
                  ],
                  [
                    308.1,
                    480.15
                  ],
                  [
                    186.05,
                    1294.35
                  ]
                ]
              ]
            },
            {
              "x": 212.05,
              "y": 290,
              "width": 1478.35,
              "height": 148.05,
              "polygons": [
                [
                  [
                    0,
                    148.05
                  ],
                  [
                    742.15,
                    0
                  ],
                  [
                    1478.35,
                    148.05
                  ]
                ]
              ]
            }
          ]
        }
      ]
    },
    {
      "name": "art",
      "elements": [
        {
          "mapType": "container",
          "children": [
            {
              "x": 384,
              "y": 296.5,
              "width": 1152,
              "height": 140,
              "rectangle": true,
              "fillColor": "#999999"
            },
            {
              "x": 240,
              "y": 436.5,
              "width": 1439.95,
              "height": 1024,
              "polygons": [
                [
                  [
                    -816,
                    -948.5
                  ],
                  [
                    336,
                    -948.5
                  ],
                  [
                    479.95,
                    75.5
                  ],
                  [
                    -960,
                    75.5
                  ]
                ]
              ],
              "fillColor": "#cccccc"
            }
          ]
        }
      ]
    },
    {
      "name": "floor",
      "elements": [
        {
          "name": "floor",
          "x": 960,
          "y": 948.5,
          "visible": false,
          "mapType": "floor",
          "mass": 0,
          "mDepth": 32,
          "mZ": 0,
          "shape": "polygons",
          "type": "Box",
          "shapes": [
            {
              "x": -720,
              "y": -512,
              "width": 1439.95,
              "height": 1024,
              "polygons": [
                [
                  [
                    1296,
                    0
                  ],
                  [
                    1439.95,
                    1024
                  ],
                  [
                    0,
                    1024
                  ],
                  [
                    144,
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
      "name": " scene: monks training",
      "elements": [
        {
          "name": "guard",
          "x": 839.25,
          "y": 864.45,
          "entityClass": "Player",
          "frequency": 0,
          "inputClass": "GoalBasedInput",
          "poolSize": 0,
          "z": 0,
          "mapType": "spawn"
        },
        {
          "name": "guard",
          "x": 835.25,
          "y": 969.55,
          "entityClass": "Player",
          "frequency": 0,
          "inputClass": "GoalBasedInput",
          "poolSize": 0,
          "z": 0,
          "mapType": "spawn"
        },
        {
          "name": "guard",
          "x": 835.25,
          "y": 1074.65,
          "entityClass": "Player",
          "frequency": 0,
          "inputClass": "GoalBasedInput",
          "poolSize": 0,
          "z": 0,
          "mapType": "spawn"
        },
        {
          "name": "guard",
          "x": 959.3,
          "y": 860.45,
          "entityClass": "Player",
          "frequency": 0,
          "inputClass": "GoalBasedInput",
          "poolSize": 0,
          "z": 0,
          "mapType": "spawn"
        },
        {
          "name": "guard",
          "x": 963.3,
          "y": 969.55,
          "entityClass": "Player",
          "frequency": 0,
          "inputClass": "GoalBasedInput",
          "poolSize": 0,
          "z": 0,
          "mapType": "spawn"
        },
        {
          "name": "guard",
          "x": 963.3,
          "y": 1070.65,
          "entityClass": "Player",
          "frequency": 0,
          "inputClass": "GoalBasedInput",
          "poolSize": 0,
          "z": 0,
          "mapType": "spawn"
        },
        {
          "name": "guard",
          "x": 1091.3,
          "y": 864.45,
          "entityClass": "Player",
          "frequency": 0,
          "inputClass": "GoalBasedInput",
          "poolSize": 0,
          "z": 0,
          "mapType": "spawn"
        },
        {
          "name": "guard",
          "x": 1095.3,
          "y": 969.55,
          "entityClass": "Player",
          "frequency": 0,
          "inputClass": "GoalBasedInput",
          "poolSize": 0,
          "z": 0,
          "mapType": "spawn"
        },
        {
          "name": "guard",
          "x": 1091.3,
          "y": 1070.65,
          "entityClass": "Player",
          "frequency": 0,
          "inputClass": "GoalBasedInput",
          "poolSize": 0,
          "z": 0,
          "mapType": "spawn"
        },
        {
          "name": "guard",
          "x": 1219.35,
          "y": 864.45,
          "entityClass": "Player",
          "frequency": 0,
          "inputClass": "GoalBasedInput",
          "poolSize": 0,
          "z": 0,
          "mapType": "spawn"
        },
        {
          "name": "guard",
          "x": 1215.35,
          "y": 969.55,
          "entityClass": "Player",
          "frequency": 0,
          "inputClass": "GoalBasedInput",
          "poolSize": 0,
          "z": 0,
          "mapType": "spawn"
        },
        {
          "name": "guard",
          "x": 1219.35,
          "y": 1070.65,
          "entityClass": "Player",
          "frequency": 0,
          "inputClass": "GoalBasedInput",
          "poolSize": 0,
          "z": 0,
          "mapType": "spawn"
        },
        {
          "name": "guard",
          "x": 1339.35,
          "y": 864.45,
          "entityClass": "Player",
          "frequency": 0,
          "inputClass": "GoalBasedInput",
          "poolSize": 0,
          "z": 0,
          "mapType": "spawn"
        },
        {
          "name": "guard",
          "x": 1339.35,
          "y": 969.55,
          "entityClass": "Player",
          "frequency": 0,
          "inputClass": "GoalBasedInput",
          "poolSize": 0,
          "z": 0,
          "mapType": "spawn"
        },
        {
          "name": "guard",
          "x": 1339.35,
          "y": 1070.65,
          "entityClass": "Player",
          "frequency": 0,
          "inputClass": "GoalBasedInput",
          "poolSize": 0,
          "z": 0,
          "mapType": "spawn"
        },
        {
          "name": "guard",
          "x": 1502,
          "y": 842.5,
          "action": "",
          "z": 0,
          "mapType": "spawn"
        },
        {
          "name": "guard",
          "x": 1461.4,
          "y": 969.55,
          "entityClass": "Player",
          "frequency": 0,
          "inputClass": "GoalBasedInput",
          "poolSize": 0,
          "z": 0,
          "mapType": "spawn"
        },
        {
          "name": "guard",
          "x": 1461.4,
          "y": 1070.65,
          "entityClass": "Player",
          "frequency": 0,
          "inputClass": "GoalBasedInput",
          "poolSize": 0,
          "z": 0,
          "mapType": "spawn"
        },
        {
          "name": "guard",
          "x": 454.7,
          "y": 864.45,
          "entityClass": "Player",
          "frequency": 0,
          "inputClass": "GoalBasedInput",
          "poolSize": 0,
          "z": 0,
          "mapType": "spawn"
        },
        {
          "name": "guard",
          "x": 450.7,
          "y": 969.55,
          "entityClass": "Player",
          "frequency": 0,
          "inputClass": "GoalBasedInput",
          "poolSize": 0,
          "z": 0,
          "mapType": "spawn"
        },
        {
          "name": "guard",
          "x": 450.7,
          "y": 1074.65,
          "entityClass": "Player",
          "frequency": 0,
          "inputClass": "GoalBasedInput",
          "poolSize": 0,
          "z": 0,
          "mapType": "spawn"
        },
        {
          "name": "guard",
          "x": 574.75,
          "y": 860.45,
          "entityClass": "Player",
          "frequency": 0,
          "inputClass": "GoalBasedInput",
          "poolSize": 0,
          "z": 0,
          "mapType": "spawn"
        },
        {
          "name": "guard",
          "x": 578.75,
          "y": 969.55,
          "entityClass": "Player",
          "frequency": 0,
          "inputClass": "GoalBasedInput",
          "poolSize": 0,
          "z": 0,
          "mapType": "spawn"
        },
        {
          "name": "guard",
          "x": 578.75,
          "y": 1070.65,
          "entityClass": "Player",
          "frequency": 0,
          "inputClass": "GoalBasedInput",
          "poolSize": 0,
          "z": 0,
          "mapType": "spawn"
        },
        {
          "name": "guard",
          "x": 706.75,
          "y": 864.45,
          "entityClass": "Player",
          "frequency": 0,
          "inputClass": "GoalBasedInput",
          "poolSize": 0,
          "z": 0,
          "mapType": "spawn"
        },
        {
          "name": "guard",
          "x": 710.75,
          "y": 969.55,
          "entityClass": "Player",
          "frequency": 0,
          "inputClass": "GoalBasedInput",
          "poolSize": 0,
          "z": 0,
          "mapType": "spawn"
        },
        {
          "name": "guard",
          "x": 706.75,
          "y": 1070.65,
          "entityClass": "Player",
          "frequency": 0,
          "inputClass": "GoalBasedInput",
          "poolSize": 0,
          "z": 0,
          "mapType": "spawn"
        },
        {
          "name": "guard",
          "x": 950.7,
          "y": 1236.6,
          "entityClass": "Player",
          "frequency": 0,
          "inputClass": "GoalBasedInput",
          "poolSize": 0,
          "z": 0,
          "mapType": "spawn"
        }
      ]
    },
    {
      "name": "pillars",
      "elements": [
        {
          "name": "pillar",
          "x": 1541,
          "y": 1305.5,
          "width": 53.05,
          "height": 538.5,
          "regX": 26.5,
          "regY": 512,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 1541,
            "ty": 1305.5
          },
          "mapType": "wall",
          "mass": 0,
          "mDepth": 512,
          "mHeight": 53,
          "mWidth": 53,
          "mZ": 0,
          "shape": "circle",
          "type": "Custom",
          "children": [
            {
              "x": -0.5,
              "y": 0,
              "width": 53,
              "height": 538.5,
              "polygons": [
                [
                  [
                    26.5,
                    0
                  ],
                  [
                    45.25,
                    7.75
                  ],
                  [
                    53,
                    26.5
                  ],
                  [
                    45.25,
                    45.25
                  ],
                  [
                    26.5,
                    53
                  ],
                  [
                    7.75,
                    45.25
                  ],
                  [
                    0,
                    26.5
                  ],
                  [
                    7.75,
                    7.75
                  ]
                ],
                [
                  [
                    26.5,
                    485.5
                  ],
                  [
                    45.25,
                    493.25
                  ],
                  [
                    53,
                    512
                  ],
                  [
                    45.25,
                    530.75
                  ],
                  [
                    26.5,
                    538.5
                  ],
                  [
                    7.75,
                    530.75
                  ],
                  [
                    0,
                    512
                  ],
                  [
                    7.75,
                    493.25
                  ]
                ]
              ],
              "fillColor": "#000000"
            },
            {
              "x": -0.5,
              "y": 0,
              "width": 53.05,
              "height": 538.5,
              "polygons": [
                [
                  [
                    26.5,
                    0
                  ],
                  [
                    45.25,
                    7.75
                  ],
                  [
                    53,
                    26.5
                  ],
                  [
                    45.25,
                    45.25
                  ],
                  [
                    26.5,
                    53
                  ],
                  [
                    7.75,
                    45.25
                  ],
                  [
                    0,
                    27.15
                  ],
                  [
                    0,
                    25.8
                  ],
                  [
                    7.75,
                    7.75
                  ]
                ],
                [
                  [
                    0,
                    27.15
                  ],
                  [
                    7.75,
                    45.25
                  ],
                  [
                    0,
                    512.65
                  ]
                ],
                [
                  [
                    7.75,
                    45.25
                  ],
                  [
                    26.5,
                    53
                  ],
                  [
                    0,
                    512.65
                  ]
                ],
                [
                  [
                    26.5,
                    53
                  ],
                  [
                    45.25,
                    45.25
                  ],
                  [
                    53,
                    512
                  ],
                  [
                    45.25,
                    530.75
                  ],
                  [
                    26.5,
                    538.5
                  ],
                  [
                    7.75,
                    530.75
                  ],
                  [
                    0,
                    512.65
                  ]
                ],
                [
                  [
                    53,
                    512
                  ],
                  [
                    45.25,
                    45.25
                  ],
                  [
                    53,
                    26.5
                  ],
                  [
                    53.05,
                    26.5
                  ],
                  [
                    53.05,
                    512
                  ]
                ]
              ],
              "fillColor": "#660000"
            }
          ]
        },
        {
          "name": "pillar",
          "x": 1154.4,
          "y": 1305.5,
          "width": 53.05,
          "height": 538.5,
          "regX": 26.5,
          "regY": 512,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 1154.4,
            "ty": 1305.5
          },
          "mapType": "wall",
          "mass": 0,
          "mDepth": 512,
          "mHeight": 53,
          "mWidth": 53,
          "mZ": 0,
          "shape": "circle",
          "type": "Custom",
          "children": [
            {
              "x": -0.5,
              "y": 0,
              "width": 53,
              "height": 538.5,
              "polygons": [
                [
                  [
                    26.5,
                    0
                  ],
                  [
                    45.25,
                    7.75
                  ],
                  [
                    53,
                    26.5
                  ],
                  [
                    45.25,
                    45.25
                  ],
                  [
                    26.5,
                    53
                  ],
                  [
                    7.75,
                    45.25
                  ],
                  [
                    0,
                    26.5
                  ],
                  [
                    7.75,
                    7.75
                  ]
                ],
                [
                  [
                    26.5,
                    485.5
                  ],
                  [
                    45.25,
                    493.25
                  ],
                  [
                    53,
                    512
                  ],
                  [
                    45.25,
                    530.75
                  ],
                  [
                    26.5,
                    538.5
                  ],
                  [
                    7.75,
                    530.75
                  ],
                  [
                    0,
                    512
                  ],
                  [
                    7.75,
                    493.25
                  ]
                ]
              ],
              "fillColor": "#000000"
            },
            {
              "x": -0.5,
              "y": 0,
              "width": 53.05,
              "height": 538.5,
              "polygons": [
                [
                  [
                    26.5,
                    0
                  ],
                  [
                    45.25,
                    7.75
                  ],
                  [
                    53,
                    26.5
                  ],
                  [
                    45.25,
                    45.25
                  ],
                  [
                    26.5,
                    53
                  ],
                  [
                    7.75,
                    45.25
                  ],
                  [
                    0,
                    27.15
                  ],
                  [
                    0,
                    25.8
                  ],
                  [
                    7.75,
                    7.75
                  ]
                ],
                [
                  [
                    0,
                    27.15
                  ],
                  [
                    7.75,
                    45.25
                  ],
                  [
                    0,
                    512.65
                  ]
                ],
                [
                  [
                    7.75,
                    45.25
                  ],
                  [
                    26.5,
                    53
                  ],
                  [
                    0,
                    512.65
                  ]
                ],
                [
                  [
                    26.5,
                    53
                  ],
                  [
                    45.25,
                    45.25
                  ],
                  [
                    53,
                    512
                  ],
                  [
                    45.25,
                    530.75
                  ],
                  [
                    26.5,
                    538.5
                  ],
                  [
                    7.75,
                    530.75
                  ],
                  [
                    0,
                    512.65
                  ]
                ],
                [
                  [
                    53,
                    512
                  ],
                  [
                    45.25,
                    45.25
                  ],
                  [
                    53,
                    26.5
                  ],
                  [
                    53.05,
                    26.5
                  ],
                  [
                    53.05,
                    512
                  ]
                ]
              ],
              "fillColor": "#660000"
            }
          ]
        },
        {
          "name": "pillar",
          "x": 767.4,
          "y": 1305.5,
          "width": 53.05,
          "height": 538.5,
          "regX": 26.5,
          "regY": 512,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 767.4,
            "ty": 1305.5
          },
          "mapType": "wall",
          "mass": 0,
          "mDepth": 512,
          "mHeight": 53,
          "mWidth": 53,
          "mZ": 0,
          "shape": "circle",
          "type": "Custom",
          "children": [
            {
              "x": -0.5,
              "y": 0,
              "width": 53,
              "height": 538.5,
              "polygons": [
                [
                  [
                    26.5,
                    0
                  ],
                  [
                    45.25,
                    7.75
                  ],
                  [
                    53,
                    26.5
                  ],
                  [
                    45.25,
                    45.25
                  ],
                  [
                    26.5,
                    53
                  ],
                  [
                    7.75,
                    45.25
                  ],
                  [
                    0,
                    26.5
                  ],
                  [
                    7.75,
                    7.75
                  ]
                ],
                [
                  [
                    26.5,
                    485.5
                  ],
                  [
                    45.25,
                    493.25
                  ],
                  [
                    53,
                    512
                  ],
                  [
                    45.25,
                    530.75
                  ],
                  [
                    26.5,
                    538.5
                  ],
                  [
                    7.75,
                    530.75
                  ],
                  [
                    0,
                    512
                  ],
                  [
                    7.75,
                    493.25
                  ]
                ]
              ],
              "fillColor": "#000000"
            },
            {
              "x": -0.5,
              "y": 0,
              "width": 53.05,
              "height": 538.5,
              "polygons": [
                [
                  [
                    26.5,
                    0
                  ],
                  [
                    45.25,
                    7.75
                  ],
                  [
                    53,
                    26.5
                  ],
                  [
                    45.25,
                    45.25
                  ],
                  [
                    26.5,
                    53
                  ],
                  [
                    7.75,
                    45.25
                  ],
                  [
                    0,
                    27.15
                  ],
                  [
                    0,
                    25.8
                  ],
                  [
                    7.75,
                    7.75
                  ]
                ],
                [
                  [
                    0,
                    27.15
                  ],
                  [
                    7.75,
                    45.25
                  ],
                  [
                    0,
                    512.65
                  ]
                ],
                [
                  [
                    7.75,
                    45.25
                  ],
                  [
                    26.5,
                    53
                  ],
                  [
                    0,
                    512.65
                  ]
                ],
                [
                  [
                    26.5,
                    53
                  ],
                  [
                    45.25,
                    45.25
                  ],
                  [
                    53,
                    512
                  ],
                  [
                    45.25,
                    530.75
                  ],
                  [
                    26.5,
                    538.5
                  ],
                  [
                    7.75,
                    530.75
                  ],
                  [
                    0,
                    512.65
                  ]
                ],
                [
                  [
                    53,
                    512
                  ],
                  [
                    45.25,
                    45.25
                  ],
                  [
                    53,
                    26.5
                  ],
                  [
                    53.05,
                    26.5
                  ],
                  [
                    53.05,
                    512
                  ]
                ]
              ],
              "fillColor": "#660000"
            }
          ]
        },
        {
          "name": "pillar",
          "x": 375.55,
          "y": 1305.5,
          "width": 53.05,
          "height": 538.5,
          "regX": 26.5,
          "regY": 512,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 375.55,
            "ty": 1305.5
          },
          "mapType": "wall",
          "mass": 0,
          "mDepth": 512,
          "mHeight": 53,
          "mWidth": 53,
          "mZ": 0,
          "shape": "circle",
          "type": "Custom",
          "children": [
            {
              "x": -0.5,
              "y": 0,
              "width": 53,
              "height": 538.5,
              "polygons": [
                [
                  [
                    26.5,
                    0
                  ],
                  [
                    45.25,
                    7.75
                  ],
                  [
                    53,
                    26.5
                  ],
                  [
                    45.25,
                    45.25
                  ],
                  [
                    26.5,
                    53
                  ],
                  [
                    7.75,
                    45.25
                  ],
                  [
                    0,
                    26.5
                  ],
                  [
                    7.75,
                    7.75
                  ]
                ],
                [
                  [
                    26.5,
                    485.5
                  ],
                  [
                    45.25,
                    493.25
                  ],
                  [
                    53,
                    512
                  ],
                  [
                    45.25,
                    530.75
                  ],
                  [
                    26.5,
                    538.5
                  ],
                  [
                    7.75,
                    530.75
                  ],
                  [
                    0,
                    512
                  ],
                  [
                    7.75,
                    493.25
                  ]
                ]
              ],
              "fillColor": "#000000"
            },
            {
              "x": -0.5,
              "y": 0,
              "width": 53.05,
              "height": 538.5,
              "polygons": [
                [
                  [
                    26.5,
                    0
                  ],
                  [
                    45.25,
                    7.75
                  ],
                  [
                    53,
                    26.5
                  ],
                  [
                    45.25,
                    45.25
                  ],
                  [
                    26.5,
                    53
                  ],
                  [
                    7.75,
                    45.25
                  ],
                  [
                    0,
                    27.15
                  ],
                  [
                    0,
                    25.8
                  ],
                  [
                    7.75,
                    7.75
                  ]
                ],
                [
                  [
                    0,
                    27.15
                  ],
                  [
                    7.75,
                    45.25
                  ],
                  [
                    0,
                    512.65
                  ]
                ],
                [
                  [
                    7.75,
                    45.25
                  ],
                  [
                    26.5,
                    53
                  ],
                  [
                    0,
                    512.65
                  ]
                ],
                [
                  [
                    26.5,
                    53
                  ],
                  [
                    45.25,
                    45.25
                  ],
                  [
                    53,
                    512
                  ],
                  [
                    45.25,
                    530.75
                  ],
                  [
                    26.5,
                    538.5
                  ],
                  [
                    7.75,
                    530.75
                  ],
                  [
                    0,
                    512.65
                  ]
                ],
                [
                  [
                    53,
                    512
                  ],
                  [
                    45.25,
                    45.25
                  ],
                  [
                    53,
                    26.5
                  ],
                  [
                    53.05,
                    26.5
                  ],
                  [
                    53.05,
                    512
                  ]
                ]
              ],
              "fillColor": "#660000"
            }
          ]
        },
        {
          "name": "pillar",
          "x": 1441.45,
          "y": 520.5,
          "width": 53.05,
          "height": 538.5,
          "regX": 26.5,
          "regY": 512,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 1441.45,
            "ty": 520.5
          },
          "mapType": "wall",
          "mass": 0,
          "mDepth": 512,
          "mHeight": 53,
          "mWidth": 53,
          "mZ": 0,
          "shape": "circle",
          "type": "Custom",
          "children": [
            {
              "x": -0.5,
              "y": 0,
              "width": 53,
              "height": 538.5,
              "polygons": [
                [
                  [
                    26.5,
                    0
                  ],
                  [
                    45.25,
                    7.75
                  ],
                  [
                    53,
                    26.5
                  ],
                  [
                    45.25,
                    45.25
                  ],
                  [
                    26.5,
                    53
                  ],
                  [
                    7.75,
                    45.25
                  ],
                  [
                    0,
                    26.5
                  ],
                  [
                    7.75,
                    7.75
                  ]
                ],
                [
                  [
                    26.5,
                    485.5
                  ],
                  [
                    45.25,
                    493.25
                  ],
                  [
                    53,
                    512
                  ],
                  [
                    45.25,
                    530.75
                  ],
                  [
                    26.5,
                    538.5
                  ],
                  [
                    7.75,
                    530.75
                  ],
                  [
                    0,
                    512
                  ],
                  [
                    7.75,
                    493.25
                  ]
                ]
              ],
              "fillColor": "#000000"
            },
            {
              "x": -0.5,
              "y": 0,
              "width": 53.05,
              "height": 538.5,
              "polygons": [
                [
                  [
                    26.5,
                    0
                  ],
                  [
                    45.25,
                    7.75
                  ],
                  [
                    53,
                    26.5
                  ],
                  [
                    45.25,
                    45.25
                  ],
                  [
                    26.5,
                    53
                  ],
                  [
                    7.75,
                    45.25
                  ],
                  [
                    0,
                    27.15
                  ],
                  [
                    0,
                    25.8
                  ],
                  [
                    7.75,
                    7.75
                  ]
                ],
                [
                  [
                    0,
                    27.15
                  ],
                  [
                    7.75,
                    45.25
                  ],
                  [
                    0,
                    512.65
                  ]
                ],
                [
                  [
                    7.75,
                    45.25
                  ],
                  [
                    26.5,
                    53
                  ],
                  [
                    0,
                    512.65
                  ]
                ],
                [
                  [
                    26.5,
                    53
                  ],
                  [
                    45.25,
                    45.25
                  ],
                  [
                    53,
                    512
                  ],
                  [
                    45.25,
                    530.75
                  ],
                  [
                    26.5,
                    538.5
                  ],
                  [
                    7.75,
                    530.75
                  ],
                  [
                    0,
                    512.65
                  ]
                ],
                [
                  [
                    53,
                    512
                  ],
                  [
                    45.25,
                    45.25
                  ],
                  [
                    53,
                    26.5
                  ],
                  [
                    53.05,
                    26.5
                  ],
                  [
                    53.05,
                    512
                  ]
                ]
              ],
              "fillColor": "#660000"
            }
          ]
        },
        {
          "name": "pillar",
          "x": 1122.55,
          "y": 520.5,
          "width": 53.05,
          "height": 538.5,
          "regX": 26.5,
          "regY": 512,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 1122.55,
            "ty": 520.5
          },
          "mapType": "wall",
          "mass": 0,
          "mDepth": 512,
          "mHeight": 53,
          "mWidth": 53,
          "mZ": 0,
          "shape": "circle",
          "type": "Custom",
          "children": [
            {
              "x": -0.5,
              "y": 0,
              "width": 53,
              "height": 538.5,
              "polygons": [
                [
                  [
                    26.5,
                    0
                  ],
                  [
                    45.25,
                    7.75
                  ],
                  [
                    53,
                    26.5
                  ],
                  [
                    45.25,
                    45.25
                  ],
                  [
                    26.5,
                    53
                  ],
                  [
                    7.75,
                    45.25
                  ],
                  [
                    0,
                    26.5
                  ],
                  [
                    7.75,
                    7.75
                  ]
                ],
                [
                  [
                    26.5,
                    485.5
                  ],
                  [
                    45.25,
                    493.25
                  ],
                  [
                    53,
                    512
                  ],
                  [
                    45.25,
                    530.75
                  ],
                  [
                    26.5,
                    538.5
                  ],
                  [
                    7.75,
                    530.75
                  ],
                  [
                    0,
                    512
                  ],
                  [
                    7.75,
                    493.25
                  ]
                ]
              ],
              "fillColor": "#000000"
            },
            {
              "x": -0.5,
              "y": 0,
              "width": 53.05,
              "height": 538.5,
              "polygons": [
                [
                  [
                    26.5,
                    0
                  ],
                  [
                    45.25,
                    7.75
                  ],
                  [
                    53,
                    26.5
                  ],
                  [
                    45.25,
                    45.25
                  ],
                  [
                    26.5,
                    53
                  ],
                  [
                    7.75,
                    45.25
                  ],
                  [
                    0,
                    27.15
                  ],
                  [
                    0,
                    25.8
                  ],
                  [
                    7.75,
                    7.75
                  ]
                ],
                [
                  [
                    0,
                    27.15
                  ],
                  [
                    7.75,
                    45.25
                  ],
                  [
                    0,
                    512.65
                  ]
                ],
                [
                  [
                    7.75,
                    45.25
                  ],
                  [
                    26.5,
                    53
                  ],
                  [
                    0,
                    512.65
                  ]
                ],
                [
                  [
                    26.5,
                    53
                  ],
                  [
                    45.25,
                    45.25
                  ],
                  [
                    53,
                    512
                  ],
                  [
                    45.25,
                    530.75
                  ],
                  [
                    26.5,
                    538.5
                  ],
                  [
                    7.75,
                    530.75
                  ],
                  [
                    0,
                    512.65
                  ]
                ],
                [
                  [
                    53,
                    512
                  ],
                  [
                    45.25,
                    45.25
                  ],
                  [
                    53,
                    26.5
                  ],
                  [
                    53.05,
                    26.5
                  ],
                  [
                    53.05,
                    512
                  ]
                ]
              ],
              "fillColor": "#660000"
            }
          ]
        },
        {
          "name": "pillar",
          "x": 797.45,
          "y": 520.5,
          "width": 53.05,
          "height": 538.5,
          "regX": 26.5,
          "regY": 512,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 797.45,
            "ty": 520.5
          },
          "mapType": "wall",
          "mass": 0,
          "mDepth": 512,
          "mHeight": 53,
          "mWidth": 53,
          "mZ": 0,
          "shape": "circle",
          "type": "Custom",
          "children": [
            {
              "x": -0.5,
              "y": 0,
              "width": 53,
              "height": 538.5,
              "polygons": [
                [
                  [
                    26.5,
                    0
                  ],
                  [
                    45.25,
                    7.75
                  ],
                  [
                    53,
                    26.5
                  ],
                  [
                    45.25,
                    45.25
                  ],
                  [
                    26.5,
                    53
                  ],
                  [
                    7.75,
                    45.25
                  ],
                  [
                    0,
                    26.5
                  ],
                  [
                    7.75,
                    7.75
                  ]
                ],
                [
                  [
                    26.5,
                    485.5
                  ],
                  [
                    45.25,
                    493.25
                  ],
                  [
                    53,
                    512
                  ],
                  [
                    45.25,
                    530.75
                  ],
                  [
                    26.5,
                    538.5
                  ],
                  [
                    7.75,
                    530.75
                  ],
                  [
                    0,
                    512
                  ],
                  [
                    7.75,
                    493.25
                  ]
                ]
              ],
              "fillColor": "#000000"
            },
            {
              "x": -0.5,
              "y": 0,
              "width": 53.05,
              "height": 538.5,
              "polygons": [
                [
                  [
                    26.5,
                    0
                  ],
                  [
                    45.25,
                    7.75
                  ],
                  [
                    53,
                    26.5
                  ],
                  [
                    45.25,
                    45.25
                  ],
                  [
                    26.5,
                    53
                  ],
                  [
                    7.75,
                    45.25
                  ],
                  [
                    0,
                    27.15
                  ],
                  [
                    0,
                    25.8
                  ],
                  [
                    7.75,
                    7.75
                  ]
                ],
                [
                  [
                    0,
                    27.15
                  ],
                  [
                    7.75,
                    45.25
                  ],
                  [
                    0,
                    512.65
                  ]
                ],
                [
                  [
                    7.75,
                    45.25
                  ],
                  [
                    26.5,
                    53
                  ],
                  [
                    0,
                    512.65
                  ]
                ],
                [
                  [
                    26.5,
                    53
                  ],
                  [
                    45.25,
                    45.25
                  ],
                  [
                    53,
                    512
                  ],
                  [
                    45.25,
                    530.75
                  ],
                  [
                    26.5,
                    538.5
                  ],
                  [
                    7.75,
                    530.75
                  ],
                  [
                    0,
                    512.65
                  ]
                ],
                [
                  [
                    53,
                    512
                  ],
                  [
                    45.25,
                    45.25
                  ],
                  [
                    53,
                    26.5
                  ],
                  [
                    53.05,
                    26.5
                  ],
                  [
                    53.05,
                    512
                  ]
                ]
              ],
              "fillColor": "#660000"
            }
          ]
        },
        {
          "name": "pillar",
          "x": 477.75,
          "y": 520.5,
          "width": 53.05,
          "height": 538.5,
          "regX": 26.5,
          "regY": 512,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 477.75,
            "ty": 520.5
          },
          "mapType": "wall",
          "mass": 0,
          "mDepth": 512,
          "mHeight": 53,
          "mWidth": 53,
          "mZ": 0,
          "shape": "circle",
          "type": "Custom",
          "children": [
            {
              "x": -0.5,
              "y": 0,
              "width": 53,
              "height": 538.5,
              "polygons": [
                [
                  [
                    26.5,
                    0
                  ],
                  [
                    45.25,
                    7.75
                  ],
                  [
                    53,
                    26.5
                  ],
                  [
                    45.25,
                    45.25
                  ],
                  [
                    26.5,
                    53
                  ],
                  [
                    7.75,
                    45.25
                  ],
                  [
                    0,
                    26.5
                  ],
                  [
                    7.75,
                    7.75
                  ]
                ],
                [
                  [
                    26.5,
                    485.5
                  ],
                  [
                    45.25,
                    493.25
                  ],
                  [
                    53,
                    512
                  ],
                  [
                    45.25,
                    530.75
                  ],
                  [
                    26.5,
                    538.5
                  ],
                  [
                    7.75,
                    530.75
                  ],
                  [
                    0,
                    512
                  ],
                  [
                    7.75,
                    493.25
                  ]
                ]
              ],
              "fillColor": "#000000"
            },
            {
              "x": -0.5,
              "y": 0,
              "width": 53.05,
              "height": 538.5,
              "polygons": [
                [
                  [
                    26.5,
                    0
                  ],
                  [
                    45.25,
                    7.75
                  ],
                  [
                    53,
                    26.5
                  ],
                  [
                    45.25,
                    45.25
                  ],
                  [
                    26.5,
                    53
                  ],
                  [
                    7.75,
                    45.25
                  ],
                  [
                    0,
                    27.15
                  ],
                  [
                    0,
                    25.8
                  ],
                  [
                    7.75,
                    7.75
                  ]
                ],
                [
                  [
                    0,
                    27.15
                  ],
                  [
                    7.75,
                    45.25
                  ],
                  [
                    0,
                    512.65
                  ]
                ],
                [
                  [
                    7.75,
                    45.25
                  ],
                  [
                    26.5,
                    53
                  ],
                  [
                    0,
                    512.65
                  ]
                ],
                [
                  [
                    26.5,
                    53
                  ],
                  [
                    45.25,
                    45.25
                  ],
                  [
                    53,
                    512
                  ],
                  [
                    45.25,
                    530.75
                  ],
                  [
                    26.5,
                    538.5
                  ],
                  [
                    7.75,
                    530.75
                  ],
                  [
                    0,
                    512.65
                  ]
                ],
                [
                  [
                    53,
                    512
                  ],
                  [
                    45.25,
                    45.25
                  ],
                  [
                    53,
                    26.5
                  ],
                  [
                    53.05,
                    26.5
                  ],
                  [
                    53.05,
                    512
                  ]
                ]
              ],
              "fillColor": "#660000"
            }
          ]
        }
      ]
    }
  ],
  "entities": [],
  "bounds": [],
  "spawnPoints": [
    {
      x: 1500,
      y: 842,
      z: 0
    },
    {
      x: 950,
      y: 420,
      z: 0
    }
  ]
});