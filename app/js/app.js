var map;
var images = {"construction" : "https://i.ibb.co/BfL4BZv/construction.png", "accident" : "https://i.ibb.co/b5XMPx6/accident.png"}
var start = [8.65439,50.11175];
var end = [8.66898,50.09575];
var routes = [
    {
        type: "driving",
        start: [8.65439,50.11175],
        end:[8.66898,50.09575],
        color: '#FFFFFF'
    },
    {
        type: "cycling",
        start: [8.65439,50.11175],
        end:[8.66898,50.09575],
        color: '#00FF00'
    },
    {
        type: "cycling",
        start: [8.65439,50.11175],
        end:[8.66898,50.09575],
        color: '#00FFFF'
    },
]
var i = 0;


setup();


function getRoute(index) {
    // make a directions request using cycling profile
    // an arbitrary start will always be the same
    // only the end or destination will change

    var url = 'https://api.mapbox.com/directions/v5/mapbox/'+routes[index].type+'/' + routes[index].start[0] + ',' + routes[index].start[1] + ';' + routes[index].end[0] + ',' + routes[index].end[1] + '?steps=true&geometries=geojson&access_token=' + mapboxgl.accessToken;
    var type = routes[index].type
    // make an XHR request https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
    var req = new XMLHttpRequest();
    req.responseType = 'json';
    req.open('GET', url, true);
    req.onload = function() {
      var data = req.response.routes[0];
      var route = data.geometry.coordinates;
      var geojson = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route
        }
      };
      // if the route already exists on the map, reset it using setData
      if (map.getSource('route')) {
        map.getSource('route').setData(geojson);
      } else { // otherwise, make a new request
        map.addLayer({
          id: 'route'+index,
          type: 'line',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: geojson.geometry.coordinates
              }
            }
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': routes[index].color,
            'line-width': 5
          }
        });
        // Add starting point to the map
        map.addLayer({
            id: 'point'+index+"-"+type,
            type: 'circle',
            source: {
                type: 'geojson',
                data: {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: {},
                    geometry: {
                    type: 'Point',
                    coordinates:  routes[index].end
                    }
                }
                ]
                }
            },
            paint: {
                'circle-radius': 10,
                'circle-color': '#3887be'
            }
            });

            map.addLayer({
                id: 'point2'+index+type,
                type: 'circle',
                source: {
                  type: 'geojson',
                  data: {
                    type: 'FeatureCollection',
                    features: [{
                      type: 'Feature',
                      properties: {},
                      geometry: {
                        type: 'Point',
                        coordinates: routes[index].start
                      }
                    }
                    ]
                  }
                },
                paint: {
                  'circle-radius': 10,
                  'circle-color': '#3887be'
                }
              });
      }
      // add turn instructions here at the end
    };
    req.send();
  }
function setup(){
    var firebaseConfig = {
        apiKey: "AIzaSyCLERzxYULgJMfBee99YKzHsRmHEy9Voeo",
        databaseURL: "https://maps-cae1b.firebaseio.com/",
        projectId: "project-566506422659",
        appID: "maps-cae1b",
      };
      // Initialize Firebase
      firebase.initializeApp(firebaseConfig)
        var eventsRef = firebase.database().ref('/events');
        eventsRef.on('value', function(snapshot) {
            
            if(i != 0){
                setMarker(images[snapshot.val().type] ,[snapshot.val().coordinate.longitude, snapshot.val().coordinate.latitude]);
                getRoute(i);
            }
            i++;
        });
    mapboxgl.accessToken = 'pk.eyJ1IjoiY2VkYW5vZXJuZXN0byIsImEiOiJjazAycWVnNzYxMnRiM21xdDBzdm8wdzllIn0.EhHoWLFYF8TcQdtjea_3fg';
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/dark-v9',
        center: [	8.6664871, 50.1072834],
        zoom: 14
    });
   /*map.addControl(new MapboxDirections({
        accessToken: mapboxgl.accessToken
        }), 'top-left');*/
    map.addControl(new mapboxgl.NavigationControl());
    map.on('load', function() {
        // make an initial directions request that
        // starts and ends at the same location
        getRoute(i);
      
        // Add starting point to the map

        // this is where the code from the next step will go
      });
      
}

function setMarker(imageURI ,coordinate){



    map.loadImage(imageURI, function(error, image) {
        if (error) throw error;
        map.addImage("custom-marker"+i, image);
            /* Style layer: A style layer ties together the source and image and specifies how they are displayed on the map. */
            map.addLayer({
            id: "markers"+i,
            type: "symbol",
            /* Source: A data source specifies the geographic coordinate where the image marker gets placed. */
            source: {
                type: "geojson",
                data: {
                    type: 'FeatureCollection',
                    features: [
                    {
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: "Point",
                                coordinates: coordinate
                            }
                    }
                    ]
            }
            },
            layout: {
                "icon-image": "custom-marker"+i,
            }
            });
        });
}