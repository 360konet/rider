<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar class="transparent-toolbar">
        <ion-title color="primary">
          Rider
          <ion-icon aria-hidden="true" :icon="notificationsOutline" style="float:right; font-size: 24px; cursor: pointer;" />
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ride-content">
      <div id="map" class="map-container"></div>

      <ion-card color="white">
        <ion-card-header>
          <ion-card-title style="color:brown">
            Rider <span style="float:right;color:brown" color="primary">GHS {{ fare }}</span>
          </ion-card-title>
        </ion-card-header>

        <ion-card-content>
          <div class="input-wrapper">
            <input id="destination-input" type="text" placeholder="Enter your destination" class="input-field" />
          </div>
        
          <!-- Wrap buttons in a div with class "button-group" -->
          <div class="button-group">
            <ion-button @click="checkPath('car')">Car</ion-button>
            <ion-button @click="checkPath('bike')">Bike</ion-button>
          </div>

          <ion-list v-if="availableDrivers.length > 0">
            <ion-item v-for="driver in availableDrivers" :key="driver.id">
              <ion-avatar slot="start">
                <img src="https://via.placeholder.com/50" alt="Driver Image" />
              </ion-avatar>
              <ion-label>
                <h2 style="color:white; ">{{ driver.name }}</h2>
                <p style="color:white; ">{{ driver.vehicle.brand }} - {{ driver.vehicle.model }} ({{ driver.vehicle.plate }})</p>
              </ion-label>
              <ion-button color="primary" @click="selectDriver(driver)">Select</ion-button>
            </ion-item>
          </ion-list>
        </ion-card-content>

      </ion-card>

    </ion-content>
  </ion-page>
</template>

<script setup>
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonButton, IonIcon, IonList, IonItem, IonAvatar, IonLabel
} from "@ionic/vue";
import { notificationsOutline } from "ionicons/icons";
import { ref, onMounted } from "vue";
import axios from 'axios';
import { useRoute } from 'vue-router';


const API_URL = "http://127.0.0.1:8000/api";
const availableDrivers = ref([]); 


const destination = ref("");
const fare = ref("0.00");
const route = useRoute();
const userId = ref(route.params.userId);
let map, currentPosition = null, userMarker = null, destinationMarker = null;
let autocomplete, directionsService, directionsRenderer, distanceMatrixService;

onMounted(() => {
  initMap();

  userId.value = (route.query.userId || localStorage.getItem('userId')) ?? "";
  console.log("User ID in Booking Page:", userId.value);
});

const initMap = () => {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 5.6037, lng: -0.1870 },
    zoom: 12,
  });
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({ map });
  distanceMatrixService = new google.maps.DistanceMatrixService();

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      currentPosition = { lat: position.coords.latitude, lng: position.coords.longitude };
      map.setCenter(currentPosition);
      userMarker = new google.maps.Marker({ position: currentPosition, map, title: "Your Location" });
    });
  }

  const destinationInput = document.getElementById("destination-input");
  autocomplete = new google.maps.places.Autocomplete(destinationInput, { types: ["geocode"] });
  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (place.geometry && place.geometry.location) {
      destination.value = place.formatted_address;
    }
  });
};


const selectDriver = async (driver) => {
  if (!currentPosition || !destination.value) {
    alert("Please select a valid destination.");
    return;
  }

  try {
    const response = await axios.post(`${API_URL}/book-ride`, {
      user_id: userId.value, 
      driver_id: driver.id,
      vehicle_type: driver.vehicle.type,
      source: JSON.stringify(currentPosition), 
      destination: destination.value,     
      amount: fare.value,     
    });

    console.log(response.data);
    alert('Ride booked successfully');
  } catch (error) {
    console.error('Error booking ride:', error);
  }
};





const checkPath = async (vehicleType) => { // Add 'async' here
  if (!currentPosition || !destination.value) {
    console.log("Current location or destination not available.");
    return;
  }

  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address: destination.value }, async (results, status) => { // Ensure async here if needed
    if (status === google.maps.GeocoderStatus.OK) {
      const destinationLocation = results[0].geometry.location;

      if (destinationMarker) destinationMarker.setMap(null);
      destinationMarker = new google.maps.Marker({ position: destinationLocation, map, title: "Destination" });
      drawRoute(currentPosition, destinationLocation);
      calculateFare(currentPosition, destinationLocation, vehicleType);

      try {
        const response = await axios.get(`${API_URL}/drivers/${vehicleType}`);
        availableDrivers.value = response.data;
      } catch (error) {
        console.error("Error fetching drivers:", error);
      }
    } else {
      console.log("Geocode failed: " + status);
    }
  });
};


const drawRoute = (origin, destination) => {
  directionsService.route({ origin, destination, travelMode: google.maps.TravelMode.DRIVING }, (result, status) => {
    if (status === google.maps.DirectionsStatus.OK) {
      directionsRenderer.setDirections(result);
    } else {
      console.log("Directions request failed due to " + status);
    }
  });
};

const calculateFare = (origin, destination, vehicleType) => {
  distanceMatrixService.getDistanceMatrix(
    { origins: [origin], destinations: [destination], travelMode: google.maps.TravelMode.DRIVING },
    (response, status) => {
      if (status === google.maps.DistanceMatrixStatus.OK) {
        const element = response.rows[0].elements[0];
        if (element.status === "OK") {
          const distanceInKm = element.distance.value / 1000;
          const durationInMinutes = element.duration.value / 60;
          
          let baseFare, costPerKm, costPerMinute, minimumCharge;

          if (vehicleType === 'car') {
            baseFare = 2.20;
            costPerKm = 1.00;
            costPerMinute = 0.40;
            minimumCharge = 5.00;
          } else if (vehicleType === 'bike') {
            baseFare = 1.50;
            costPerKm = 0.80;
            costPerMinute = 0.30;
            minimumCharge = 3.00;
          }

          let totalFare = baseFare + (distanceInKm * costPerKm) + (durationInMinutes * costPerMinute);
          if (totalFare < minimumCharge) totalFare = minimumCharge;
          fare.value = totalFare.toFixed(2);
        } else {
          console.log("Distance Matrix request failed due to " + element.status);
        }
      } else {
        console.log("Distance Matrix API error: " + status);
      }
    }
  );
};
</script>

<style scoped>
.transparent-toolbar {
  --background: transparent;
  --box-shadow: none;
  color: white;
}
.map-container {
  height: 60%;
  width: 100%;
}
.ride-content {
  display: flex;
  flex-direction: column;
}
.input-wrapper {
  width: 100%;
  position: relative;
}

.input-field {
  width: 100%;
  padding: 10px;
  border: 1px solid #e60000; /* Keeps only the border */
  border-radius: 5px;
  font-size: 16px;
  background: transparent; /* Makes the background transparent */
  color: #e60000; /* Text color */
  outline: none; /* Removes focus outline */
}

.input-field::placeholder {
  color: #e60000; /* Makes placeholder text semi-transparent */
}

.input-field:focus {
  border-color: #e60000; /* Changes border color on focus */
}


.button-group {
  display: flex;
  justify-content: space-between;
  gap: 10px; /* Adjust spacing between buttons */
  width: 100%;
}

.button-group ion-button {
  flex: 1; /* Makes buttons take equal width */
}



</style>