ec && ec.loadMap({
  "name": "hallway",
  "path": "data/hallway",
  "width": 2560,
  "height": 3840,
  "layers": [
    {
      "name": "sketch",
      "elements": [
        {
          "name": "sketch",
          "x": 0,
          "y": 0,
          "width": 1024,
          "height": 848,
          "regX": 0,
          "regY": 0,
          "matrix": {
            "a": 1,
            "b": 0,
            "c": 0,
            "d": 1,
            "tx": 0,
            "ty": 0
          },
          "mapType": "parallax",
          "mass": 0,
          "mDepth": 0,
          "mHeight": 848,
          "mWidth": 1024,
          "mZ": 0,
          "shape": "box",
          "type": "Box",
          "image": "elements_hallway/hallway_sketch.png"
        }
      ]
    },
    {
      "name": "floor",
      "elements": [
        {
          "name": "floor",
          "x": 527,
          "y": 534,
          "visible": false,
          "mapType": "floor",
          "mass": 0,
          "mDepth": 1,
          "mZ": -1,
          "shape": "polygons",
          "type": "Box",
          "shapes": [
            {
              "x": -513.95,
              "y": -252.95,
              "width": 998.95,
              "height": 547.95,
              "polygons": [
                [
                  [
                    810.95,
                    0
                  ],
                  [
                    998.95,
                    37
                  ],
                  [
                    306.95,
                    547.95
                  ],
                  [
                    0,
                    442.95
                  ]
                ]
              ]
            }
          ]
        }
      ]
    },
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
          "z": 0,
          "shape": "polygons",
          "shapes": [
            {
              "x": -107.9,
              "y": 679.25,
              "width": 615.9,
              "height": 217.3,
              "polygons": [
                [
                  [
                    0,
                    0
                  ],
                  [
                    615.9,
                    217.3
                  ],
                  [
                    2,
                    216.3
                  ]
                ]
              ]
            },
            {
              "x": -106.9,
              "y": 269.9,
              "width": 942.55,
              "height": 517.5,
              "polygons": [
                [
                  [
                    942.55,
                    0
                  ],
                  [
                    0,
                    517.5
                  ],
                  [
                    0,
                    1.7
                  ]
                ]
              ]
            },
            {
              "x": 187.5,
              "y": 311.7,
              "width": 843.25,
              "height": 584.85,
              "polygons": [
                [
                  [
                    843.25,
                    584.85
                  ],
                  [
                    0,
                    584.35
                  ],
                  [
                    841.25,
                    0
                  ]
                ]
              ]
            }
          ]
        }
      ]
    }
  ]
});