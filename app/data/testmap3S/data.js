ec && ec.loadMap({
  "name": "testmap3S",
  "path": "data/testmap3S",
  "width": 1428,
  "height": 1002,
  "layers": [
    {
      "name": "bounds",
      "elements": [
        {
          "name": "bounds left",
          "mapType": "wall",
          "x": 43,
          "y": 283,
          "z": 0,
          "width": 695,
          "height": 1410,
          "depth": 780,
          "regX": 48,
          "regY": 995,
          "shape": "polygons",
          "shapes": [
            {
              "x": 0,
              "y": 0,
              "polygons": [
                [
                  [
                    2,
                    793
                  ],
                  [
                    5,
                    1393
                  ],
                  [
                    137,
                    799
                  ]
                ]
              ]
            }
          ]
        },
        {
          "name": "bounds top",
          "mapType": "wall",
          "x": 805,
          "y": 86,
          "z": 0,
          "width": 1422,
          "height": 875,
          "depth": 780,
          "regX": 792,
          "regY": 798,
          "shape": "polygons",
          "shapes": [
            {
              "x": 0,
              "y": 0,
              "polygons": [
                [
                  [
                    1,
                    804
                  ],
                  [
                    1409,
                    872
                  ],
                  [
                    966,
                    718
                  ]
                ]
              ]
            }
          ]
        }
      ]
    },
    {
      "name": "background",
      "elements": [
        {
          "name": "full area",
          "mapType": "floor",
          "x": 713,
          "y": 501,
          "z": 0,
          "width": 1432,
          "height": 1005,
          "depth": 0,
          "regX": 717,
          "regY": 502,
          "shape": "polygons",
          "shapes": [
            {
              "x": 0,
              "y": 0,
              "polygons": [
                [
                  [
                    3,
                    1003
                  ],
                  [
                    1431,
                    1004
                  ],
                  [
                    1431,
                    1
                  ],
                  [
                    1,
                    1
                  ]
                ]
              ]
            }
          ]
        }
      ]
    },
    {
      "name": "bg layer",
      "elements": [
        {
          "name": "wall",
          "mapType": "wall",
          "x": 740,
          "y": 419,
          "z": 35,
          "width": 999,
          "height": 214,
          "depth": 151,
          "regX": 480,
          "regY": 178,
          "shape": "polygons",
          "shapes": [
            {
              "x": 0,
              "y": 0,
              "polygons": [
                [
                  [
                    1,
                    165
                  ],
                  [
                    956,
                    206
                  ],
                  [
                    960,
                    191
                  ],
                  [
                    4,
                    150
                  ]
                ]
              ]
            }
          ],
          "material": "brick",
          "image": "elements/wall.png"
        },
        {
          "name": "little floor",
          "mapType": "parallax",
          "x": 169,
          "y": 887,
          "width": 259,
          "height": 70,
          "image": "elements/little_floor.png"
        },
        {
          "name": "floor",
          "mapType": "floor",
          "x": 694,
          "y": 588,
          "z": 0,
          "width": 1053,
          "height": 472,
          "depth": 35,
          "regX": 525,
          "regY": 219,
          "shape": "polygons",
          "shapes": [
            {
              "x": 0,
              "y": 0,
              "polygons": [
                [
                  [
                    1,
                    393
                  ],
                  [
                    957,
                    435
                  ],
                  [
                    1048,
                    45
                  ],
                  [
                    92,
                    1
                  ]
                ]
              ]
            }
          ],
          "material": "earth",
          "image": "elements/floor.png"
        }
      ]
    },
    {
      "name": "small pillar",
      "elements": [
        {
          "name": "small pillar",
          "mapType": "floor",
          "x": 293,
          "y": 420.5,
          "z": 35,
          "width": 124,
          "height": 150,
          "depth": 98,
          "regX": 58,
          "regY": 25.5,
          "shape": "oval",
          "shapes": [
            {
              "x": 0,
              "y": 0,
              "width": 116,
              "height": 51
            }
          ],
          "material": "wood",
          "image": "elements/small_pillar.png"
        }
      ]
    },
    {
      "name": "little box",
      "elements": [
        {
          "name": "little box",
          "mapType": "floor",
          "x": 1036,
          "y": 360,
          "z": 35,
          "width": 155,
          "height": 206,
          "depth": 135,
          "regX": 77,
          "regY": 34,
          "shape": "polygons",
          "shapes": [
            {
              "x": 0,
              "y": 0,
              "polygons": [
                [
                  [
                    1,
                    62
                  ],
                  [
                    140,
                    67
                  ],
                  [
                    154,
                    6
                  ],
                  [
                    14,
                    1
                  ]
                ]
              ]
            }
          ],
          "material": "stone",
          "image": "elements/little_box.png"
        }
      ]
    },
    {
      "name": "big box",
      "elements": [
        {
          "name": "big box",
          "mapType": "floor",
          "x": 557,
          "y": 410,
          "z": 35,
          "width": 453,
          "height": 411,
          "depth": 196,
          "regX": 227,
          "regY": 106,
          "shape": "polygons",
          "shapes": [
            {
              "x": 0,
              "y": 0,
              "polygons": [
                [
                  [
                    1,
                    193
                  ],
                  [
                    407,
                    210
                  ],
                  [
                    452,
                    19
                  ],
                  [
                    46,
                    1
                  ]
                ]
              ]
            }
          ],
          "material": "wood",
          "image": "elements/big_box.png"
        }
      ]
    },
    {
      "name": "mixed box",
      "elements": [
        {
          "name": "mixed box",
          "mapType": "floor",
          "x": 958,
          "y": 592,
          "z": 35,
          "width": 156,
          "height": 206,
          "depth": 129,
          "regX": 52,
          "regY": 34,
          "shape": "polygons",
          "shapes": [
            {
              "x": 0,
              "y": 0,
              "polygons": [
                [
                  [
                    1,
                    62
                  ],
                  [
                    141,
                    67
                  ],
                  [
                    50,
                    4
                  ],
                  [
                    15,
                    2
                  ]
                ]
              ]
            },
            {
              "x": 0,
              "y": 0,
              "polygons": [
                [
                  [
                    110,
                    29
                  ],
                  [
                    141,
                    67
                  ],
                  [
                    155,
                    7
                  ]
                ]
              ]
            }
          ],
          "material": "stone",
          "image": "elements/mixed_box.png"
        }
      ]
    },
    {
      "name": "floating box",
      "elements": [
        {
          "name": "floating box",
          "mapType": "floor",
          "x": 816,
          "y": 698,
          "z": 300,
          "width": 250,
          "height": 129,
          "depth": 25,
          "regX": 125,
          "regY": 52,
          "shape": "polygons",
          "shapes": [
            {
              "x": 0,
              "y": 0,
              "polygons": [
                [
                  [
                    1,
                    49
                  ],
                  [
                    164,
                    103
                  ],
                  [
                    249,
                    56
                  ],
                  [
                    87,
                    1
                  ]
                ]
              ]
            }
          ],
          "material": "metal",
          "image": "elements/floating_box.png"
        }
      ]
    },
    {
      "name": "pillar",
      "elements": [
        {
          "name": "pillar",
          "mapType": "floor",
          "x": 416,
          "y": 520.5,
          "z": 35,
          "width": 127,
          "height": 330,
          "depth": 279,
          "regX": 58,
          "regY": 25.5,
          "shape": "oval",
          "shapes": [
            {
              "x": 0,
              "y": 0,
              "width": 116,
              "height": 51
            }
          ],
          "material": "wood",
          "image": "elements/pillar.png"
        }
      ]
    },
    {
      "name": "little test",
      "elements": [
        {
          "name": "little test",
          "mapType": "floor",
          "x": 1355,
          "y": 906,
          "z": 0,
          "width": 142,
          "height": 130,
          "depth": 61,
          "regX": 71,
          "regY": 35,
          "shape": "polygons",
          "shapes": [
            {
              "x": 0,
              "y": 0,
              "polygons": [
                [
                  [
                    1,
                    68
                  ],
                  [
                    140,
                    69
                  ],
                  [
                    140,
                    1
                  ],
                  [
                    1,
                    1
                  ]
                ]
              ]
            }
          ],
          "image": "elements/little_test.png"
        }
      ]
    }
  ],
  "entities": []
});
