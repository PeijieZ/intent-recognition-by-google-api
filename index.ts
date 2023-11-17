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

  flightPath1.setMap(map);
  flightPath2.setMap(map);
  flightPath3.setMap(map);
  flightPath4.setMap(map);

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
      document.getElementById("similarity-percentage-1to3").innerText = `Percentage Similarity (1 to 3): ${similarityPercentage1to3.toFixed(2)}%`;
      document.getElementById("similarity-percentage-2to3").innerText = `Percentage Similarity (2 to 4): ${similarityPercentage2to4.toFixed(2)}%`;
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