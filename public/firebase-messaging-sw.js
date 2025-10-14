// This file should be in the public folder

// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "vexel-cinema",
  appId: "1:936879818073:web:0cb4d11556a047cc1b7848",
  storageBucket: "vexel-cinema.appspot.com",
  apiKey: "AIzaSyDBgesKMmtY5qmzV83LswRIcgGkZ5eGuPM",
  authDomain: "vexel-cinema.firebaseapp.com",
  messagingSenderId: "936879818073"
};


firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
