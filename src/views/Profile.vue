<template>
  <ion-page>
    <ion-content :fullscreen="true" class="white-background">
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="profile-image-container">
          <ion-img src="/img/logincover.jpg" class="profile-image" />
        </div>
        <ion-label class="profile-name">{{ user.name || 'N/A' }}</ion-label>
        <p>{{ user.status || 'N/A' }}</p>
      </div>

      <!-- Profile Details -->
      <ion-card class="transparent-card">
        <ion-list class="transparent-list">
          <ion-item class="transparent-item no-background">
            <ion-icon slot="start" :icon="phonePortraitOutline" />
            <ion-label>Phone</ion-label>
            <ion-note slot="end">{{ user.phone || 'N/A' }}</ion-note>
          </ion-item>
          <ion-item class="transparent-item no-background">
            <ion-icon slot="start" :icon="mailOpenOutline" />
            <ion-label>Email</ion-label>
            <ion-note slot="end">{{ user.email || 'N/A' }}</ion-note>
          </ion-item>
          <ion-item class="transparent-item no-background">
            <ion-icon slot="start" :icon="locateOutline" />
            <ion-label>Current Location</ion-label>
            <ion-note slot="end">{{ user.location || 'Unknown' }}</ion-note>
          </ion-item>
          <ion-item class="transparent-item no-background">
            <ion-icon slot="start" :icon="timeOutline" />
            <ion-label>Created At</ion-label>
            <ion-note slot="end">{{ formatDate(user.created_at) || 'N/A' }}</ion-note>
          </ion-item>
        </ion-list>
        <ion-button expand="block" class="red-button">Edit Profile</ion-button>
      </ion-card>


      <ion-card class="transparent-card">
        <ion-list class="transparent-list">
          <ion-item class="transparent-item no-background">
            <ion-icon slot="start" :icon="chatbubbleOutline" />
            <ion-label>Language</ion-label>
            <ion-note slot="end">English</ion-note>
          </ion-item>
          <ion-item class="transparent-item no-background">
            <ion-icon slot="start" :icon="callOutline" />
            <ion-label>Customer Care</ion-label>
            <ion-note slot="end">+233 00 000 0000</ion-note>
          </ion-item>
        </ion-list>
      </ion-card>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <ion-button expand="block" class="red-button" @click="logout">Log Out</ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { 
  IonPage, 
  IonContent, 
  IonLabel, 
  IonImg, 
  IonCard, 
  IonList, 
  IonItem, 
  IonIcon, 
  IonNote, 
  IonButton 
} from "@ionic/vue";
import { 
  phonePortraitOutline, 
  mailOpenOutline, 
  locateOutline, 
  timeOutline, 
  carOutline, 
  calendarNumberOutline, 
  paperPlaneOutline, 
  chatbubbleOutline, 
  callOutline 
} from "ionicons/icons";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { authAxios } from '@/services/api';
import { useRoute } from 'vue-router';

// State for user and vehicle
const user = ref({});
const vehicle = ref({});
const route = useRoute();
const userId = route.params.id || localStorage.getItem("user_id");
const router = useRouter();

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
};

const getStatusStyle = (status) => {
  let backgroundColor = "gray"; // Default color

  switch (status?.toLowerCase()) {
    case "pending":
    case "banned":
      backgroundColor = "red";
      break;
    case "verified":
      backgroundColor = "green";
      break;
    case "warning":
      backgroundColor = "yellow";
      break;
  }

  return {
    backgroundColor,
    color: backgroundColor === "yellow" ? "black" : "white",
    padding: "5px",
    borderRadius: "5px",
    textAlign: "center",
    fontWeight: "bold",
  };
};



const fetchProfile = async () => {
  try {
    if (!userId) {
      router.push("/login");
      return;
    }

    console.log("Fetching profile for User ID:", userId);

    const response = await authAxios.get(`/user/profile/${userId}`);

    console.log("API Response:", response.data);

    user.value = response.data.user || {};
    vehicle.value = response.data.vehicle || {};
  } catch (error) {
    console.error("Error fetching profile:", error.response?.data || error.message);
  }
};



// Logout function
const logout = () => {
  localStorage.removeItem("authToken");
  router.push("/login");
};

// Load profile data on component mount
onMounted(fetchProfile);
</script>

<style scoped>
.white-background {
  --background: #ffffff;
}

/* Profile Header */
.profile-header {
  text-align: center;
  padding: 20px 0;
  background-color: #ffffff;
}

.profile-image-container {
  margin: 0 auto;
  height: 100px;
  width: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #e60000;
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-name {
  font-size: 1.5rem;
  font-weight: bold;
  margin-top: 10px;
  color: #e60000;
}

/* Transparent Profile Details Card */
.transparent-card {
  background: transparent;
  border: none;
  box-shadow: none;
}

.transparent-list {
  background: transparent;
}

.transparent-item {
  background: transparent;
  --ion-background-color: transparent;
  --inner-border-width: 0;
}

.no-background {
  --background: transparent !important;
  --ion-item-background: transparent !important;
}

ion-list {
  --ion-safe-area-padding: 0;
}

ion-icon {
  color: #e60000;
}

/* Action Buttons */
.action-buttons {
  margin: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.red-button {
  --border-radius: 8px;
  --background: #e60000;
  --color: white;
}
</style>
