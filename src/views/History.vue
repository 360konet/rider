<template>
  <ion-page>
    <!-- Header -->
    <ion-header>
      <ion-toolbar class="header-toolbar">
        <ion-title>Ride History</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="history-content">
      <!-- Search & Filter Section -->
      <div class="search-container">
        <ion-img src="/img/reportimg.png" class="search-image" />
        <ion-input placeholder="From" fill="outline" class="search-input"></ion-input>
        <ion-input placeholder="To" fill="outline" class="search-input"></ion-input>
        <ion-button expand="block" class="search-button">Filter</ion-button>
      </div>

      <!-- Ride History List -->
      <ion-list class="history-list transparent-list">
        <ion-item class="history-item transparent-item" color="white">
          <ion-label>
            <h3>Kumasi to Accra</h3>
            <p>20th Jan 2025 - 10:30 AM</p>
          </ion-label>
          <ion-button class="more-button">More</ion-button>
        </ion-item>
        <ion-item class="history-item transparent-item" color="white">
          <ion-label>
            <h3>Osu to Nungua</h3>
            <p>15th Jan 2025 - 5:45 PM</p>
          </ion-label>
          <ion-button class="more-button">More</ion-button>
        </ion-item>
        <ion-item class="history-item transparent-item" color="white">
          <ion-label>
            <h3>Tema to Sakumono</h3>
            <p>12th Jan 2025 - 3:20 PM</p>
          </ion-label>
          <ion-button class="more-button">More</ion-button>
        </ion-item>
        <ion-item class="history-item transparent-item" color="white">
          <ion-label>
            <h3>Burma Camp to East Legon</h3>
            <p>8th Jan 2025 - 8:10 AM</p>
          </ion-label>
          <ion-button class="more-button">More</ion-button>
        </ion-item>
        <ion-item class="history-item transparent-item" color="white">
          <ion-label>
            <h3>Tamale to Kumasi</h3>
            <p>5th Jan 2025 - 6:30 PM</p>
          </ion-label>
          <ion-button class="more-button">More</ion-button>
        </ion-item>
      </ion-list>
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
} from "@ionic/vue";
</script>

<style scoped>
/* Header Styling */
.header-toolbar {
  --background: #e60000;
  color: white;
  text-align: center;
}

/* General Styling */
.history-content {
  background: white;
  padding: 15px;
}

/* Search Section Styling */
.search-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: transparent;
  border-radius: 12px;
  margin-bottom: 15px;
}

.search-image {
  height: 70px;
  width: 70px;
  border-radius: 50%;
}

.search-input {
  width: 100%;
  max-width: 300px;
  border-radius: 8px;
  border: 1px solid #e60000;
  padding: 10px;
  background: transparent;
  color: #e60000;
}

.search-button {
  --background: #e60000;
  --color: white;
  border-radius: 8px;
  width: 100%;
  max-width: 300px;
}

/* History List Styling */
.history-list {
  margin-top: 10px;
  border-radius: 10px;
  background: transparent;
}

.history-item {
  background: white !important;
  border: 1px solid #e60000;
  border-radius: 10px;
  margin-bottom: 10px;
  padding: 12px;}


.history-item h3 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #e60000;
}

.history-item p {
  margin: 5px 0 0;
  font-size: 14px;
  color: #e60000;
}

.more-button {
  --background: #e60000;
  --color: white;
  border-radius: 8px;
  font-size: 14px;
}
</style>
