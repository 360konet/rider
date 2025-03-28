<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="header-toolbar">
        <ion-title>Ride History</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="history-content">
      <div class="search-container">
        <ion-img src="/img/reportimg.png" class="search-image" />
        <ion-input v-model="from" placeholder="From" fill="outline" class="search-input"></ion-input>
        <ion-input v-model="to" placeholder="To" fill="outline" class="search-input"></ion-input>
        <ion-button expand="block" class="search-button" @click="fetchRideHistory">Filter</ion-button>
      </div>

      <ion-spinner v-if="loading" name="dots"></ion-spinner>
      <p v-if="error" class="error-message">{{ error }}</p>

      <ion-list v-if="!loading && rides.length > 0" class="history-list" color="white">
        <ion-item v-for="ride in rides" :key="ride.id" class="history-item" color="white">
          <ion-label>
            <h3>{{ ride.source }} to {{ ride.destination }}</h3>
            <p>{{ formatDate(ride.ride_start) }}</p>
          </ion-label>
          <ion-button class="more-button" @click="viewRideDetails(ride)">More</ion-button>
        </ion-item>
      </ion-list>

      <p v-if="!loading && rides.length === 0" class="no-rides">No rides found.</p>

      <!-- Ride Details Modal -->
      <ion-modal :is-open="showModal" @didDismiss="showModal = false">
        <ion-header>
          <ion-toolbar>
            <ion-title style="color:white;">Ride Details</ion-title>
            <ion-buttons slot="end" style="color:red;">
              <ion-button @click="showModal = false">Close</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content class="modal-content">
          <div v-if="selectedRide">
            <p><strong>From:</strong> {{ selectedRide.source }}</p>
            <p><strong>To:</strong> {{ selectedRide.destination }}</p>
            <p><strong>Vehicle Type:</strong> {{ selectedRide.vehicle_type }}</p>
            <p><strong>Status:</strong> {{ selectedRide.status }}</p>
            <p><strong>Start Time:</strong> {{ formatDate(selectedRide.ride_start) }}</p>
            <p><strong>End Time:</strong> {{ formatDate(selectedRide.ride_end) }}</p>
            <p><strong>Driver:</strong> {{ selectedRide.driver?.name || 'N/A' }}</p>
          </div>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonLabel,
  IonItem,
  IonList,
  IonButton,
  IonImg,
  IonInput,
  IonSpinner,
  IonModal,
  IonButtons
} from "@ionic/vue";
import { useRoute } from "vue-router";
import { ref, onMounted } from "vue";
import axios from "axios";

const route = useRoute();
const userId = route.params.userId;

// State Variables
const rides = ref([]);
const loading = ref(false);
const error = ref("");
const from = ref("");
const to = ref("");
const showModal = ref(false);
const selectedRide = ref(null);

// Fetch Ride History from API
const fetchRideHistory = async () => {
  if (!userId) return;
  loading.value = true;
  error.value = "";

  try {
    const response = await axios.get(`http://127.0.0.1:8000/api/rides/${userId}`, {
      params: { from: from.value, to: to.value }
    });

    rides.value = response.data.rides;
  } catch (err) {
    console.error("Error fetching ride history:", err);
    error.value = err.response?.data?.message || "Failed to fetch ride history.";
  } finally {
    loading.value = false;
  }
};

const reverseGeocode = (lat, lng) => {
  const geocoder = new google.maps.Geocoder();
  const latLng = new google.maps.LatLng(lat, lng);

  geocoder.geocode({ location: latLng }, (results, status) => {
    if (status === google.maps.GeocoderStatus.OK) {
      if (results[0]) {
        destination.value = results[0].formatted_address;
      } else {
        console.log("No results found");
      }
    } else {
      console.log("Geocoder failed due to: " + status);
    }
  });
};


// Format Date
const formatDate = (dateString: string) => {
  return dateString ? new Date(dateString).toLocaleString() : "N/A";
};

// Show Ride Details Modal
const viewRideDetails = (ride: any) => {
  selectedRide.value = ride;
  showModal.value = true;
};

// Fetch ride history when component is mounted
onMounted(fetchRideHistory);
</script>

<style scoped>
.header-toolbar {
  --background: #e60000;
  color: white;
  text-align: center;
}

.history-content {
  background: white;
  padding: 15px;
}

.search-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 15px;
}

.history-list {
  margin-top: 10px;
}

.history-item {
  background: white !important;
  border: 1px solid #e60000;
  border-radius: 10px;
  margin-bottom: 10px;
  padding: 12px;
}

.more-button {
  --background: #e60000;
  --color: white;
  border-radius: 8px;
}

.modal-content {
  padding: 20px;
}

.error-message {
  color: red;
  text-align: center;
  font-weight: bold;
}

.no-rides {
  text-align: center;
  color: gray;
  font-style: italic;
}
</style>
