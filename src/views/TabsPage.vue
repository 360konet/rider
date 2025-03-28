<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button v-if="userId" :to="`/tabs/tab1/${userId}`">
          <ion-icon aria-hidden="true" :icon="navigateOutline" />
          <ion-label>Ride</ion-label>
        </ion-tab-button>

        <ion-tab-button v-if="userId" :to="`/tabs/tab2/${userId}`">
          <ion-icon aria-hidden="true" :icon="clipboardOutline" />
          <ion-label>Ride History</ion-label>
        </ion-tab-button>

        <ion-tab-button v-if="userId" :to="`/tabs/tab1/${userId}`">
          <ion-icon aria-hidden="true" :icon="personOutline" />
          <ion-label>Profile</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { navigateOutline, personOutline, clipboardOutline } from 'ionicons/icons';
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();

// Ensure userId is correctly retrieved
const userId = computed(() => {
  let storedUserId = localStorage.getItem("userId");
  console.log("Route Params:", route.params, "Stored User ID:", storedUserId);
  
  return route.params.userId || storedUserId;
});

// Store userId in localStorage if not already stored
if (!localStorage.getItem("userId") && route.params.userId) {
  localStorage.setItem("userId", String(route.params.userId));
}

</script>

<style scoped>
ion-tab-bar {
  --background: white;
  --border-top: 1px solid #ddd; /* Light border */
  box-shadow: 0px -2px 5px rgba(0, 0, 0, 0.1); /* Optional: Soft shadow */
}

ion-tab-button {
  --color: #333;
  --color-selected: #e60000;
  font-weight: 500;
}
</style>
