var config = {
    apiKey: "AIzaSyA2B3bNyDNpR0cNp1YR9v1TV7IvOS1r388",
    authDomain: "ice18-fe14e.firebaseapp.com",
    databaseURL: "https://ice18-fe14e.firebaseio.com",
    projectId: "ice18-fe14e",
    storageBucket: "ice18-fe14e.appspot.com",
    messagingSenderId: "523648123901"
  };
firebase.initializeApp(config);

var db = firebase.firestore();

db.settings({
  timestampsInSnapshots: true
});