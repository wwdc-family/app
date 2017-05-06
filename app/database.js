import Firestack from "react-native-firestack";
const firestack = new Firestack();

class Database {
  static setUserLocation(userId, lat, lng, timestamp) {
    console.log("got user location");
    let userLocationPath = "/user/" + userId + "/location";

    return firestack.database.ref(userLocationPath).set({
      lat: lat,
      lng: lng,
      timestamp: timestamp
    });
  }

  static setUserTwitterName(userId, twitterUsername) {
    let userLocationPath = "/user/" + userId;

    // We have to set it as a hash, as otherwise it sets the string as an array
    return firestack.database.ref(userLocationPath).set({
      twitterUsername: twitterUsername
    });
  }

  static hideUser(userId) {
    let userLocationPath = "/user/" + userId + "/location";

    firestack.database.ref(userLocationPath).remove();
  }

  static stopListening() {
    console.log("unsubscribing from changes");
    let usersRef = firestack.database.ref("/user/");
    usersRef.off("value");
  }

  static getUser(userId, callback) {
    let userLocationRef = firestack.database.ref("/user/" + userId);
    userLocationRef.once("value").then(function(snapshot) {
      let snap = snapshot.val();
      callback(snap);
    });
  }

  static listenToUsers(callback) {
    console.log("subscribing to changes");
    let usersRef = firestack.database.ref("/user/");

    // Get a list of all existing users
    usersRef.once("value").then(function(snapshot) {
      let snap = snapshot.val();
      for (var userId in snap) {
        var data = snap[userId];
        let userLocation = data.location;
        if (userLocation) {
          callback(
            userId,
            userLocation.lat,
            userLocation.lng,
            userLocation.timestamp,
            data.twitterUsername
          );
        }
      }

      // and from now on: listen to new users
      usersRef.on("child_changed", function(data) {
        console.log("Child changed");
        let userId = data.key;
        let userLocation = data.val().location;
        if (userLocation) {
          callback(
            userId,
            userLocation.lat,
            userLocation.lng,
            userLocation.timestamp,
            data.val().twitterUsername
          );
        } else {
          // This happens when the user stopped sharing their location
          callback(userId, null, null, null, null);
        }
      });
    });
  }
}

module.exports = Database;
