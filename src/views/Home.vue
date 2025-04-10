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
          <!-- Conditionally hide input and button group when status is "Pending", "Accepted", "OnRide" -->
          <div class="input-wrapper" v-if="!['Pending', 'Accepted', 'OnRide', 'Completed'].includes(rideStatus)">
            <input id="destination-input" type="text" placeholder="Enter your destination" class="input-field" />
          </div>
          
          <div class="button-group" v-if="!['Pending', 'Accepted', 'OnRide', 'Completed'].includes(rideStatus)">
            <ion-button @click="checkPath('car')">Car</ion-button>
            <ion-button @click="checkPath('bike')">Bike</ion-button>
          </div>


          <!-- Show drivers list only if no driver is selected and status is not "Pending", "Accepted", or "OnRide" -->
          <ion-list v-if="!selectedDriver && availableDrivers.length > 0 && !['Pending', 'Accepted', 'OnRide'].includes(rideStatus)">
            <ion-item v-for="driver in availableDrivers" :key="driver.id">
              <ion-avatar slot="start">
                <img src="/img/user.jpg" alt="Driver Image" />
              </ion-avatar>
              <ion-label>
                <h2 style="color:white; ">{{ driver.name }}</h2>
                <p style="color:white; ">{{ driver.vehicle.brand }} - {{ driver.vehicle.model }} ({{ driver.vehicle.plate }})</p>
              </ion-label>
              <ion-button color="primary" @click="selectDriver(driver)">Select</ion-button>
            </ion-item>
          </ion-list>

          <!-- Show status section if a ride is booked -->
          <ion-card v-if="rideStatus && rideStatus !== 'No Ride'" style="background-color: white;">
            <ion-card-header>
              <ion-card-title style="color:black">Status: {{ rideStatus }}</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <p style="color:black" v-if="rideStatus === 'Accepted'">Your driver, {{ driverName }}, is on the way.</p>
              <p style="color:black" v-if="rideStatus === 'OnRide'">Your ride has started.</p>
              <p style="color:black" v-if="rideStatus === 'Completed'">Ride completed. Thank you!</p>
            </ion-card-content>
          </ion-card>

          <!-- Show Call and Chat buttons only when the ride is accepted -->
          <div v-if="rideStatus === 'Accepted'">
            <ion-button color="secondary" @click="makeCall(driverName)" style="margin-top: 10px;">
              <ion-icon :icon="callOutline" slot="start" />
              Call Driver
            </ion-button>

            <ion-button color="primary" @click="startChat(driverData)">
              <ion-icon :icon="chatbubbleOutline" slot="start" />
              Chat Driver
            </ion-button>
          </div>
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
import { ref, onMounted, onUnmounted } from "vue";
import axios from 'axios';
import { useRoute } from 'vue-router';
import { notificationsOutline, callOutline, chatbubbleOutline } from "ionicons/icons"; // Import necessary icons
import { useRouter } from 'vue-router';

const API_URL = "https://dririd.nxtremeprojectnew.com/api";
const availableDrivers = ref([]); 
const driverData = ref(null); // this will hold the full driver object


const destination = ref("");
const fare = ref("0.00");
const route = useRoute();
const userId = ref(route.params.userId);
let map, currentPosition = null, userMarker = null, destinationMarker = null;
let autocomplete, directionsService, directionsRenderer, distanceMatrixService;
const rideStatus = ref("No Ride");
const driverName = ref("");
const pollingInterval = ref(null);


const makeCall = (driver) => {
  const driverPhone = driver.phoneNumber; // Ensure this field is populated correctly from the API
  if (driverPhone) {
    window.location.href = `tel:${driverPhone}`; // Open phone dialer with the driver's number
  } else {
    alert('Driver phone number is not available.');
  }
};

const router = useRouter();  // Make sure the router is initialized here

const startChat = (driver) => {
  if (driver && driver.id && driver.ride_id) {
    router.push({ 
      name: 'Chat', 
      params: { 
        driverId: driver.id, 
        rideId: driver.ride_id 
      } 
    });
  } else {
    console.error('Driver ID or Ride ID is missing:', driver);
    alert('Unable to start chat. Driver ID or Ride ID is missing.');
  }
};




onMounted(() => {
  initMap();
  //userId.value = (route.query.userId || localStorage.getItem('userId')) ?? "";
  userId.value = route.params.userId || localStorage.getItem('userId');

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
    }, (error) => {
      console.error("Geolocation error:", error);
      alert("Please enable location services.");
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
    rideStatus.value = 'Pending'; // Adjust this based on response status
    alert('Ride booked successfully');
    rideId.value = response.data.ride_id; // Store ride ID from the response for accountability
  } catch (error) {
    console.error('Error booking ride:', error);
  }
};



// Function to check ride status
const fetchRideStatus = async () => {
  try {
    const response = await axios.get(`${API_URL}/ride-status/${userId.value}`);
    rideStatus.value = response.data.status;
    
    // Full driver object
    driverData.value = response.data.driver;

    // Optional: name for display
    driverName.value = response.data.driver.name;

    // Check if ride is completed, then refresh the page
    if (rideStatus.value === "Completed") {
      alert("Ride completed. Refreshing the screen...");
      window.location.reload(); // Force refresh
    }
  } catch (error) {
    rideStatus.value = "No Ride";
    driverData.value = null;
    driverName.value = "";
  }
};

onMounted(() => {
  fetchRideStatus();
  pollingInterval.value = setInterval(fetchRideStatus, 3000);
});



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


onMounted(() => {
  fetchRideStatus();
  pollingInterval.value = setInterval(fetchRideStatus, 3000);
});

// Cleanup when component is unmounted
onUnmounted(() => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value);
  }
});
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