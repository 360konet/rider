<template>
    <ion-page>
      <ion-header translucent>
        <ion-toolbar class="transparent-toolbar">
          <ion-title color="primary">
            Chat with Driver
          </ion-title>
        </ion-toolbar>
      </ion-header>
  
      <ion-content :fullscreen="true">
        <div class="chat-container">
          <!-- Chat messages -->
          <div class="messages" ref="messagesContainer">
            <div v-for="(message, index) in messages" :key="index" :class="{'sent': message.sent, 'received': !message.sent}">
              <p>{{ message.text }}</p>
            </div>
          </div>
  
          <!-- Message input -->
          <div class="message-input">
            <ion-input v-model="newMessage" placeholder="Type a message..." />
            <ion-button @click="sendMessage" color="primary">Send</ion-button>
          </div>
        </div>
      </ion-content>
    </ion-page>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonButton } from '@ionic/vue';
  
  const messages = ref([
    { text: 'Hello! How can I help you?', sent: false },  // Received message
    { text: 'I need help with my ride.', sent: true },    // Sent message
  ]);
  
  const newMessage = ref('');
  const route = useRoute();
  const driverId = ref(route.params.driverId);  // Get the driver ID from the URL
  
  const sendMessage = () => {
    if (newMessage.value.trim()) {
      messages.value.push({ text: newMessage.value, sent: true });
      newMessage.value = '';
  
      // Scroll to the bottom after a message is sent
      const messagesContainer = document.querySelector('.messages');
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };
  
  onMounted(() => {
    // Scroll to the bottom when the page is loaded
    const messagesContainer = document.querySelector('.messages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  });
  </script>
  
  <style scoped>
  .transparent-toolbar {
    --background: transparent;
    --box-shadow: none;
    color: white;
  }
  
  .chat-container {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
  }
  
  .messages .sent {
    text-align: right;
    color: blue;
  }
  
  .messages .received {
    text-align: left;
    color: gray;
  }
  
  .message-input {
    display: flex;
    padding: 10px;
    border-top: 1px solid #ccc;
    background: white;
  }
  
  .message-input ion-input {
    flex: 1;
    margin-right: 10px;
  }
  
  .message-input ion-button {
    width: 80px;
  }
  </style>
  