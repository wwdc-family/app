import * as firebase from "firebase";

class Database {
  static setUserLocation(userId, lat, lng, timestamp) {
    console.log("got user location")
    let userLocationPath = "/user/" + userId + "/details";

    return firebase.database().ref(userLocationPath).set({
      lat: lat,
      lng: lng,
      timestamp: timestamp
    })
  }

  static setUserProfilePicture(userId, profilePictureUrl) {
    let userLocationPath = "/user/" + userId + "/profilePicture";

    return firebase.database().ref(userLocationPath).set(profilePictureUrl)
  }

  static hideUser(userId) {
    let userLocationPath = "/user/" + userId + "/details";

    firebase.database().ref(userLocationPath).remove()
  }

  static stopListening() {
    console.log("unsubscribing from changes")
    let usersRef = firebase.database().ref("/user/")
    usersRef.off()
  }

  static getUser(userId, callback) {
    let userLocationRef = firebase.database().ref("/user/" + userId)
    userLocationRef.once("value").then(function(snapshot) {
      let snap = snapshot.val()
      callback(snap)
    })
  }

  static listenToUsers(callback) {
    console.log("subscribing to changes")
    let usersRef = firebase.database().ref("/user/")

    // Get a list of all existing users
    usersRef.once("value").then(function(snapshot) {
      let snap = snapshot.val()
      for (var userId in snap) {
        var data = snap[userId]
        let userDetails = data.details
        callback(userId, userDetails.lat, userDetails.lng, userDetails.timestamp, data.profilePicture)
      }

      // and from now on: listen to new users
      usersRef.on('child_changed', function(data) {
        console.log("Child changed")
        let userId = data.key
        let userDetails = data.val().details
        callback(userId, userDetails.lat, userDetails.lng, userDetails.timestamp, data.profilePicture)
      });

      usersRef.on('child_removed', function(data) {
        let userId = data.key
        callback(userId, null, null, null, null)
      })
    });
  }
}

module.exports = Database;
