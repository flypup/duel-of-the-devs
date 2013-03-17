ec && ec.loadMap({
  "name": "testmap",
  "path": "data/testmap",
  "width": 1280,
  "height": 1280,
  "layers": [
    {
      "name": "background",
      "elements": [
        {
          "mapType": "container",
          "children": [
            {
              "x": 0,
              "y": 0,
              "width": 1280,
              "height": 256,
              "rectangle": true,
              "fillColor": "#006699"
            }
          ]
        }
      ]
    },
    {
      "name": "floors back",
      "elements": [
        {
          "name": "floorOutsideBackRight",
          "x": 929.5,
          "y": 491.5,
          "width": 707,
          "height": 565,
          "regX": 353.5,
          "regY": 282.5,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 929.5,
            "ty": 491.5
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 0,
          "mHeight": 565,
          "mWidth": 707,
          "mZ": 0,
          "shape": "polygons",
          "type": "Box",
          "children": [
            {
              "x": -0.5,
              "y": -0.5,
              "width": 707,
              "height": 565,
              "polygons": [
                [
                  [
                    707,
                    565
                  ],
                  [
                    481.25,
                    565
                  ],
                  [
                    0,
                    373.3
                  ],
                  [
                    0,
                    0
                  ],
                  [
                    704.35,
                    26.35
                  ]
                ]
              ],
              "fillColor": "#cccc99"
            }
          ],
          "shapes": [
            {
              "x": -0.5,
              "y": -0.5,
              "width": 707,
              "height": 565,
              "polygons": [
                [
                  [
                    707,
                    565
                  ],
                  [
                    481.25,
                    565
                  ],
                  [
                    0,
                    373.3
                  ],
                  [
                    0,
                    0
                  ],
                  [
                    704.35,
                    26.35
                  ]
                ]
              ]
            }
          ]
        },
        {
          "name": "floorOutsideBackLeft",
          "x": 288,
          "y": 492,
          "width": 576,
          "height": 565.05,
          "regX": 288,
          "regY": 282,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 288,
            "ty": 492
          },
          "mapType": "floor",
          "mass": 3,
          "mDepth": 0,
          "mHeight": 565.05,
          "mWidth": 576,
          "mZ": 0,
          "shape": "polygons",
          "type": "Box",
          "children": [
            {
              "x": 0,
              "y": 0,
              "width": 576,
              "height": 565.05,
              "polygons": [
                [
                  [
                    0,
                    43.5
                  ],
                  [
                    576,
                    0
                  ],
                  [
                    576,
                    373.55
                  ],
                  [
                    95.65,
                    563.95
                  ],
                  [
                    0,
                    565.05
                  ]
                ]
              ],
              "fillColor": "#cccc99"
            }
          ],
          "shapes": [
            {
              "x": 0,
              "y": 0,
              "width": 576,
              "height": 565.05,
              "polygons": [
                [
                  [
                    0,
                    43.5
                  ],
                  [
                    576,
                    0
                  ],
                  [
                    576,
                    373.55
                  ],
                  [
                    95.65,
                    563.95
                  ],
                  [
                    0,
                    565.05
                  ]
                ]
              ]
            }
          ]
        }
      ]
    },
    {
      "name": "floor inside",
      "elements": [
        {
          "name": "floorInsde",
          "x": 576.4,
          "y": 775.75,
          "width": 960,
          "height": 384.05,
          "regX": 480,
          "regY": 192,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 576.4,
            "ty": 775.75
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 0,
          "mHeight": 384.05,
          "mWidth": 960,
          "mZ": 0,
          "shape": "polygons",
          "type": "Box",
          "children": [
            {
              "x": 0,
              "y": 0,
              "width": 960,
              "height": 384.05,
              "polygons": [
                [
                  [
                    960,
                    192.15
                  ],
                  [
                    480,
                    384.05
                  ],
                  [
                    0,
                    190.7
                  ],
                  [
                    480,
                    0
                  ]
                ]
              ],
              "fillColor": "#666699"
            }
          ],
          "shapes": [
            {
              "x": 49,
              "y": 14,
              "width": 862,
              "height": 355.95,
              "polygons": [
                [
                  [
                    862,
                    178.1
                  ],
                  [
                    431,
                    355.95
                  ],
                  [
                    0,
                    176.75
                  ],
                  [
                    431,
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
      "name": "floors front",
      "elements": [
        {
          "name": "floorOutsideWindow",
          "x": 284.2,
          "y": 1029.75,
          "width": 584.35,
          "height": 508.2,
          "regX": 292.15,
          "regY": 254.1,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 284.2,
            "ty": 1029.75
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 0,
          "mHeight": 508.2,
          "mWidth": 584.35,
          "mZ": 0,
          "shape": "polygons",
          "type": "Box",
          "children": [
            {
              "x": -0.14999999999997726,
              "y": -0.09999999999999432,
              "width": 584.35,
              "height": 508.2,
              "polygons": [
                [
                  [
                    0,
                    0
                  ],
                  [
                    103.65,
                    0
                  ],
                  [
                    9.95,
                    508.2
                  ],
                  [
                    0,
                    508.2
                  ]
                ],
                [
                  [
                    9.95,
                    508.2
                  ],
                  [
                    103.65,
                    0
                  ],
                  [
                    584.35,
                    191.75
                  ],
                  [
                    584.35,
                    508.2
                  ]
                ]
              ],
              "fillColor": "#cccc99"
            }
          ],
          "shapes": [
            {
              "x": -0.14999999999997726,
              "y": -0.09999999999999432,
              "width": 584.35,
              "height": 508.2,
              "polygons": [
                [
                  [
                    0,
                    0
                  ],
                  [
                    103.65,
                    0
                  ],
                  [
                    584.35,
                    191.75
                  ],
                  [
                    584.35,
                    508.2
                  ],
                  [
                    0,
                    508.2
                  ]
                ]
              ]
            }
          ]
        },
        {
          "name": "floorOutsideDoor",
          "x": 929.5,
          "y": 1029.85,
          "width": 706.25,
          "height": 507.95,
          "regX": 353.1,
          "regY": 253.95,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 929.5,
            "ty": 1029.85
          },
          "mapType": "floor",
          "mass": 0,
          "mDepth": 0,
          "mHeight": 507.95,
          "mWidth": 706.25,
          "mZ": 0,
          "shape": "polygons",
          "type": "Box",
          "children": [
            {
              "x": -0.10000000000002274,
              "y": -0.9499999999999886,
              "width": 706.25,
              "height": 507.95,
              "polygons": [
                [
                  [
                    480.7,
                    0
                  ],
                  [
                    706.25,
                    0
                  ],
                  [
                    706.25,
                    507.95
                  ],
                  [
                    0,
                    507.95
                  ],
                  [
                    0,
                    191.5
                  ]
                ],
                [
                  [
                    706.25,
                    507.95
                  ],
                  [
                    706.25,
                    0
                  ],
                  [
                    706.25,
                    261.6
                  ],
                  [
                    706.25,
                    503.95
                  ]
                ]
              ],
              "fillColor": "#cccc99"
            }
          ],
          "shapes": [
            {
              "x": -0.10000000000002274,
              "y": -0.9499999999999886,
              "width": 706.25,
              "height": 507.95,
              "polygons": [
                [
                  [
                    480.7,
                    0
                  ],
                  [
                    706.25,
                    0
                  ],
                  [
                    706.25,
                    507.95
                  ],
                  [
                    0,
                    507.95
                  ],
                  [
                    0,
                    191.5
                  ]
                ]
              ]
            }
          ]
        }
      ]
    },
    {
      "name": "walls back",
      "elements": [
        {
          "name": "wallBehindWindow",
          "x": 337,
          "y": 680,
          "width": 480,
          "height": 510,
          "regX": 240,
          "regY": 415,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 337,
            "ty": 680
          },
          "mapType": "wall",
          "mass": 0,
          "mDepth": 320,
          "mHeight": 0,
          "mWidth": 480,
          "mZ": 0,
          "shape": "polygons",
          "type": "Box",
          "children": [
            {
              "x": 0,
              "y": 0,
              "width": 480,
              "height": 510,
              "polygons": [
                [
                  [
                    480,
                    0
                  ],
                  [
                    480,
                    319.2
                  ],
                  [
                    0,
                    510
                  ],
                  [
                    0,
                    190.75
                  ]
                ]
              ],
              "fillColor": "#804382"
            }
          ],
          "shapes": [
            {
              "x": 0,
              "y": 319.2,
              "width": 480,
              "height": 190.8,
              "polygons": [
                [
                  [
                    480,
                    0
                  ],
                  [
                    480,
                    17
                  ],
                  [
                    43.45,
                    190.8
                  ],
                  [
                    0,
                    190.8
                  ]
                ]
              ]
            }
          ]
        },
        {
          "name": "wallBehindDoor",
          "x": 816,
          "y": 680,
          "width": 480,
          "height": 510,
          "regX": 240,
          "regY": 415,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 816,
            "ty": 680
          },
          "mapType": "wall",
          "mass": 0,
          "mDepth": 320,
          "mHeight": 0,
          "mWidth": 480,
          "mZ": 0,
          "shape": "polygons",
          "type": "Box",
          "children": [
            {
              "x": 0,
              "y": 0,
              "width": 480,
              "height": 510,
              "polygons": [
                [
                  [
                    0,
                    318.35
                  ],
                  [
                    0,
                    0
                  ],
                  [
                    480,
                    191.7
                  ],
                  [
                    480,
                    510
                  ]
                ]
              ],
              "fillColor": "#663366"
            }
          ],
          "shapes": [
            {
              "x": 0,
              "y": 318.35,
              "width": 480,
              "height": 191.65,
              "polygons": [
                [
                  [
                    0,
                    16.95
                  ],
                  [
                    0,
                    0
                  ],
                  [
                    480,
                    191.65
                  ],
                  [
                    437,
                    191.65
                  ]
                ]
              ]
            }
          ]
        }
      ]
    },
    {
      "name": "walls front",
      "elements": [
        {
          "name": "wallDoor",
          "x": 816,
          "y": 872,
          "width": 480,
          "height": 509,
          "regX": 240,
          "regY": 415,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 816,
            "ty": 872
          },
          "mapType": "wall",
          "mass": 0,
          "mDepth": 320,
          "mHeight": 0,
          "mWidth": 480,
          "mZ": 0,
          "shape": "polygons",
          "type": "Box",
          "children": [
            {
              "x": 257.05,
              "y": 238.8,
              "width": 24.95,
              "height": 158.35,
              "polygons": [
                [
                  [
                    0,
                    0
                  ],
                  [
                    24.95,
                    10.05
                  ],
                  [
                    24.95,
                    158.35
                  ],
                  [
                    0,
                    147.15
                  ]
                ]
              ],
              "fillColor": "#b498b4"
            },
            {
              "x": 0,
              "y": 0,
              "width": 480,
              "height": 509,
              "polygons": [
                [
                  [
                    282,
                    397.15
                  ],
                  [
                    282,
                    248.85
                  ],
                  [
                    480,
                    0
                  ],
                  [
                    480,
                    318.6
                  ]
                ],
                [
                  [
                    480,
                    0
                  ],
                  [
                    282,
                    248.85
                  ],
                  [
                    189.95,
                    285.4
                  ],
                  [
                    0,
                    190.4
                  ]
                ],
                [
                  [
                    0,
                    509
                  ],
                  [
                    0,
                    190.4
                  ],
                  [
                    189.95,
                    285.4
                  ],
                  [
                    189.95,
                    433.65
                  ]
                ]
              ],
              "fillColor": "#804382"
            }
          ],
          "shapes": [
            {
              "x": 257.05,
              "y": 312.9,
              "width": 222.95,
              "height": 84.25,
              "polygons": [
                [
                  [
                    24.95,
                    84.25
                  ],
                  [
                    0,
                    73.05
                  ],
                  [
                    195,
                    0
                  ],
                  [
                    222.95,
                    5.7
                  ]
                ]
              ]
            },
            {
              "x": 0,
              "y": 422.95,
              "width": 189.95,
              "height": 89.05,
              "polygons": [
                [
                  [
                    167,
                    0
                  ],
                  [
                    189.95,
                    10.7
                  ],
                  [
                    0,
                    89.05
                  ],
                  [
                    0,
                    66.05
                  ]
                ]
              ]
            }
          ]
        },
        {
          "name": "wallWindow",
          "x": 336,
          "y": 872,
          "width": 480,
          "height": 510,
          "regX": 240,
          "regY": 416,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 336,
            "ty": 872
          },
          "mapType": "wall",
          "mass": 0,
          "mDepth": 320,
          "mHeight": 0,
          "mWidth": 480,
          "mZ": 0,
          "shape": "polygons",
          "type": "Box",
          "image": "map/wallWindow.png",
          "shapes": [
            {
              "x": 0,
              "y": 314.05,
              "width": 480,
              "height": 197.95,
              "polygons": [
                [
                  [
                    0,
                    4.3
                  ],
                  [
                    21.25,
                    0
                  ],
                  [
                    480,
                    176.75
                  ],
                  [
                    480,
                    197.95
                  ]
                ]
              ]
            }
          ]
        }
      ]
    },
    {
      "name": "grass",
      "elements": [
        {
          "name": "grass1",
          "x": 711.6,
          "y": 1055.4,
          "width": 101.6,
          "height": 67.35,
          "regX": 50.8,
          "regY": 67.35,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 711.6,
            "ty": 1055.4
          },
          "mapType": "wall",
          "mass": 0,
          "mDepth": 67,
          "mHeight": 0,
          "mWidth": 101,
          "mZ": 0,
          "shape": "box",
          "type": "Box",
          "image": "map/grass.png"
        }
      ]
    }
  ]
});