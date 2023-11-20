function initMap(): void {
  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer({
    suppressMarkers: true,
    polylineOptions: {
      strokeColor: '#000000', // Set color for route 1
      strokeOpacity: 0    // Set opacity for route 1
    },
  });
  const map = new google.maps.Map(
    document.getElementById("map") as HTMLElement,
    {
      zoom: 15,
      center: { lat: 51.5157, lng: -0.1192 },
    }
  );

  directionsRenderer.setMap(map);

  const flightPath1 = new google.maps.Polyline({
    path: [],
    geodesic: true,
    strokeColor: '#FF0000',//red
    strokeOpacity: 0.5
  });

  const flightPath2 = new google.maps.Polyline({
    path: [],
    geodesic: true,
    strokeColor: '#00FF00',//green
    strokeOpacity: 0.5
  });

  const flightPath3 = new google.maps.Polyline({
    path: [],
    geodesic: true,
    strokeColor: '#0000FF',//blue
    strokeOpacity: .5
  });

  const flightPath4 = new google.maps.Polyline({
    path: [],
    geodesic: true,
    strokeColor: '#FF00FF',//yellow
    strokeOpacity: .5
  });

  const aiPath3 = new google.maps.Polyline({
    path: [],
    geodesic: true,
    strokeColor: '#FFC0CB',//pink
    strokeOpacity: .8
  });

  flightPath1.setMap(map);
  flightPath2.setMap(map);
  flightPath3.setMap(map);
  flightPath4.setMap(map);
  aiPath3.setMap(map);


  const searchButton = document.getElementById("searchButton") as HTMLElement;

  searchButton.addEventListener("click", () => {
    // Call the existing onChangeHandler function
    onChangeHandler();
  });

  const marker = new google.maps.Marker({
    map: map,
    position: map.getCenter(),
    draggable: true,
    visible: false
  });

  const startMarker = new google.maps.Marker({
  map: map,
  title: 'Start Point',
  label: {
    text: 'i',
    color: 'white', // Set the color to white
    fontWeight: 'bold', // Make it bold
  }
});

  const endMarker = new google.maps.Marker({
  map: map,
  title: 'End Point',
  label: {
    text: 'g1',
    color: 'white', // Set the color to white
    fontWeight: 'bold', // Make it bold
  }
});
  const endMarker2 = new google.maps.Marker({
  map: map,
  title: 'End Point',
  label: {
    text: 'g2',
    color: 'white', // Set the color to white
    fontWeight: 'bold', // Make it bold
  }
});
  const midMarker = new google.maps.Marker({
  map: map,
  title: 'obs Point',
  label: {
    text: 'o',
    color: 'white', // Set the color to white
    fontWeight: 'bold', // Make it bold
  }
});

 


  const onChangeHandler = async function () {
    try {
      const route1Promise = calculateAndDisplayRoute(directionsService, 
        directionsRenderer, 
        flightPath1,
        (document.getElementById("start") as HTMLInputElement).value,
        (document.getElementById("end") as HTMLInputElement).value);

      const route2Promise = calculateAndDisplayRoute(directionsService, 
        directionsRenderer, 
        flightPath2,
        (document.getElementById("start") as HTMLInputElement).value,
        (document.getElementById("end2") as HTMLInputElement).value);

      const route3Promise = calculateAndDisplayRouteWithMarker(directionsService, 
        directionsRenderer, 
        marker.getPosition() as google.maps.LatLng, 
        document.getElementById("end") as HTMLInputElement, 
        flightPath3);  

      const route4Promise = calculateAndDisplayRouteWithMarker(directionsService, 
        directionsRenderer, 
        marker.getPosition() as google.maps.LatLng, 
        document.getElementById("end2") as HTMLInputElement, 
        flightPath4);

      //DRAW AI LINE
      loadDirections(map, aiPath3);

      midMarker.setPosition(marker.getPosition() as google.maps.LatLng);

      // Wait for both promises to resolve
      await Promise.all([route1Promise, route2Promise, route3Promise, route4Promise]);

       const route1Points = flightPath1.getPath().getArray();
        const randomIndex = Math.floor(Math.random() * route1Points.length);
        const randomPoint = route1Points[randomIndex];

        // Set the marker position to the random point from route1
        marker.setPosition(randomPoint);

        const route1Start = flightPath1.getPath().getArray();
        startMarker.setPosition(route1Start[0]);
        const route2end = flightPath2.getPath().getArray();
        endMarker.setPosition(route1Start[route1Start.length-1]);
        endMarker2.setPosition(route2end[route2end.length-1]);

        const commonPoints = markcommon(flightPath1, flightPath3);

    // Add markers for common points
    // commonPoints.forEach(point => {
    //   new google.maps.Marker({
    //     position: point,
    //     map: map, // Assuming map is accessible here
    //     title: 'Common Point',
    //   });
    // });

    const similarityPercentage1to3 = calculateSimilarity(flightPath1, flightPath3);
    const similarityPercentage2to4 = calculateSimilarity(flightPath2, flightPath4);
    const similarityPercentage3 = calculateSimilarity(flightPath1, aiPath3);

    const intentPercentage1 = similarityPercentage1to3 / (similarityPercentage1to3 + similarityPercentage2to4) * 100;
    const intentPercentage2 = similarityPercentage2to4 / (similarityPercentage1to3 + similarityPercentage2to4) * 100;

    document.getElementById("similarity-percentage-1to3").innerText = `Similarity 1: ${similarityPercentage1to3.toFixed(2)}%`;
    document.getElementById("similarity-percentage-2to3").innerText = `Similarity 2: ${similarityPercentage2to4.toFixed(2)}%`;
    
    document.getElementById("similarity3").innerText = `Similarity 1: ${similarityPercentage3.toFixed(2)}%`;

    // Display intent percentages on the web page
    document.getElementById("intent-percentage-1").innerText = `Goal 1: ${intentPercentage1.toFixed(2)}%`;
    document.getElementById("intent-percentage-2").innerText = `Goal 2: ${intentPercentage2.toFixed(2)}%`;
    } catch (error) {
      console.error("Error during route calculation: " + error);
    }
  };

  (document.getElementById("start") as HTMLElement).addEventListener(
    "change",
    onChangeHandler
  );
  (document.getElementById("end") as HTMLElement).addEventListener(
    "change",
    onChangeHandler
  );
  (document.getElementById("end2") as HTMLElement).addEventListener(
    "change",
    onChangeHandler
  );

  marker.addListener('dragend', () => {
    onChangeHandler();
  });
}

async function loadDirections(map: google.maps.Map, flightPath: google.maps.Polyline): Promise<void> {
  try {
    for (let i = 1; i <= 5; i++) {
      const response = await fetch(`direction${i}.txt`);
      const routeText = await response.text();

      await parseDirections(map, routeText);
    }

    // Display only the shortest route after all routes are loaded
    if (shortestRouteResponse) {
      await parseAndDisplayDirections(map, shortestRouteResponse.routeText, shortestRouteResponse.routeColor, flightPath);
    }
  } catch (error) {
    console.error('Error loading directions:', error);
  }
}


let shortestRouteLength: number = Infinity;
let shortestRouteResponse: { routeText: string, routeColor: string } | null = null;

async function parseDirections(map: google.maps.Map, routeText: string): Promise<void> {
  const routeColor = '#FF0000'; 

  const coordinates = parseCoordinates(routeText);

  if (coordinates.length >= 2) {
    const routeLength = await calculateRouteLength(coordinates);

    if (routeLength < shortestRouteLength) {
      shortestRouteLength = routeLength;
      shortestRouteResponse = { routeText, routeColor };
    }
  } else {
    console.error("At least two valid coordinates are required for directions.");
  }
}

// Modify the parseAndDisplayDirections function
async function parseAndDisplayDirections(map: google.maps.Map, routeText: string, routeColor: string, flightPath: google.maps.Polyline): Promise<void> {
  const coordinates = parseCoordinates(routeText);

  if (coordinates.length >= 2) {
    await calculateAndDisplayDirections(map, coordinates, routeColor, flightPath);
  } else {
    console.error("At least two valid coordinates are required for directions.");
  }
}

function parseCoordinates(routeText: string): google.maps.LatLngLiteral[] {
  const regex = /\((-?\d+\.\d+),\s*(-?\d+\.\d+)\)/g;
  let match;
  const parsedCoordinates: google.maps.LatLngLiteral[] = [];

  while ((match = regex.exec(routeText)) !== null) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);

    if (!isNaN(lat) && !isNaN(lng)) {
      parsedCoordinates.push({ lat, lng });
    }
  }

  return parsedCoordinates;
}

async function calculateAndDisplayDirections(
  map: google.maps.Map,
  coordinates: google.maps.LatLngLiteral[],
  routeColor: string,
  flightPath: google.maps.Polyline
): Promise<void> {
  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer({
    map,
    suppressMarkers: true,
    polylineOptions: {
      strokeColor: `${routeColor}80`,
      strokeOpacity: 0
    },
  });

  const waypoints = coordinates.slice(1, -1).map(coord => ({
    location: new google.maps.LatLng(coord.lat, coord.lng),
    stopover: false,
  }));

  return new Promise<void>((resolve, reject) => {
    directionsService.route(
      {
        origin: coordinates[0],
        destination: coordinates[coordinates.length - 1],
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      async (response, status) => {
        if (status === 'OK' && response) {
       
            directionsRenderer.setDirections(response);
            const route = response.routes[0];
            const path = route.overview_path.map((point) => ({ lat: point.lat(), lng: point.lng() }));
            flightPath.setPath(path);
          
          resolve();
        } else {
          window.alert(`Directions request failed due to ${status}`);
          reject();
        }
      }
    );
  });
}

async function calculateRouteLength(response: any): Promise<number> {
  let totalDistance = 0;

  if (response.routes && response.routes.length > 0) {
    const route = response.routes[0];

    if (route.legs && route.legs.length > 0) {
      route.legs.forEach((leg: any) => {
        if (leg.steps && leg.steps.length > 0) {
          leg.steps.forEach((step: any) => {
            if (step.distance && step.distance.value) {
              totalDistance += step.distance.value;
            }
          });
        }
      });
    }
  }

  // Convert the total distance to your desired unit (e.g., meters to kilometers)
  const totalDistanceInKm = totalDistance / 1000;

  return totalDistanceInKm;
}




function calculateAndDisplayRoute(
  directionsService: google.maps.DirectionsService,
  directionsRenderer: google.maps.DirectionsRenderer,
  flightPath: google.maps.Polyline,
  origin: string,
  destination: string
): Promise<void> {
  return directionsService
    .route({
      origin: {
        query: origin,
      },
      destination: {
        query: destination,
      },
      travelMode: google.maps.TravelMode.DRIVING,
    })
    .then((response) => {
      directionsRenderer.setDirections(response);

      const route = response.routes[0];
      const path = route.overview_path.map((point) => ({ lat: point.lat(), lng: point.lng() }));
      flightPath.setPath(path);
    })
    .catch((e) => {
      console.error("Directions request failed due to " + e);
      throw e; // Rethrow the error to propagate it to the caller
    });
}

function markcommon(route1: google.maps.Polyline, route2: google.maps.Polyline): google.maps.LatLng[] {
  const path1 = route1.getPath().getArray();
  const path2 = route2.getPath().getArray();

  const commonPoints = path1.filter(point1 =>
    path2.some(point2 =>
      arePointsEqual(point1, point2)
    )
  );

  return commonPoints;
}

function calculateSimilarity(route1: google.maps.Polyline, route2: google.maps.Polyline): number {
  const path1 = route1.getPath().getArray();
  const path2 = route2.getPath().getArray();

  if (path1.length === 0 && path2.length === 0) {
    return 1000; // If either path is empty, consider them 100% similar
  }

  const commonPoints = path1.filter(point1 =>
    path2.some(point2 =>
      arePointsEqual(point1, point2)
    )
  );

  const similarityPercentage = (commonPoints.length / Math.min(path1.length, path2.length)) * 100;

  if (similarityPercentage > 100){
    return 100;
  }
  return similarityPercentage;
}

function arePointsEqual(point1: google.maps.LatLng, point2: google.maps.LatLng): boolean {
  const epsilon = 1e-3;
  const latDiff = Math.abs(point1.lat() - point2.lat());
  const lngDiff = Math.abs(point1.lng() - point2.lng());

  return latDiff < epsilon && lngDiff < epsilon;
}

function calculateAndDisplayRouteWithMarker(
  directionsService: google.maps.DirectionsService,
  directionsRenderer: google.maps.DirectionsRenderer,
  markerPosition: google.maps.LatLng,
  endInput: HTMLInputElement,
  flightPath: google.maps.Polyline
): Promise<void> {
  const startInput = document.getElementById("start") as HTMLInputElement;

  return directionsService
    .route({
      origin: {
        query: startInput.value,
      },
      waypoints: [{
        location: markerPosition,
        stopover: true,
      }],
      destination: {
        query: endInput.value,
      },
      travelMode: google.maps.TravelMode.DRIVING,
    })
    .then((response) => {
      directionsRenderer.setDirections(response);

      const route = response.routes[0];
      const path = route.overview_path.map((point) => ({ lat: point.lat(), lng: point.lng() }));
      flightPath.setPath(path);
    })
    .catch((e) => {
      console.error("Directions request failed due to " + e);
      throw e; // Rethrow the error to propagate it to the caller
    });
}


declare global {
  interface Window {
    initMap: () => void;
  }
}

window.initMap = initMap;
export {};
