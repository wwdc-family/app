import React, { Component } from "react";
import MapView from "react-native-maps";

import { DeviceEventEmitter } from "react-native";
import { RNLocation as Location } from "NativeModules";

import Firestack from "react-native-firestack";
const firestack = new Firestack();

const Database = require("./database.js");
const styles = require("./styles.js");
const ReactNative = require("react-native");

const gpsTrackingActiveKey = "@wwdcfamily:gpsTrackingActive";
const showPartiesKey = "@wwdcfamily:showParties";

import {
  View,
  Text,
  Image,
  ActionSheetIOS,
  Linking,
  Modal,
  WebView,
  AsyncStorage
} from "react-native";

const {
  AppState
} = ReactNative;

class MapViewComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      markers: this.defaultMarkers(),
      lastPosition: null,
      gpsTrackingActive: false,
      showParties: false,
      aboutThisAppModalVisible: false,
      region: {
        latitude: 37.537431,
        longitude: -122.216034,
        latitudeDelta: 1.3,
        longitudeDelta: 0.71
      }
    };

    let ref = this;
    // Don't start tracking the location if the user previously disabled it on the last use
    AsyncStorage.getItem(showPartiesKey)
      .then(showParties => {
        if (showParties == "true" || showParties == null) {
          ref.toggleParties();
        }
      })
      .done();
  }

  // viewDidLoad
  componentDidMount() {
    AppState.addEventListener("change", this._handleAppStateChange);
    this._handleAppStateChange("active");

    let ref = this;
    // Don't start tracking the location if the user previously disabled it on the last use
    AsyncStorage.getItem(gpsTrackingActiveKey)
      .then(gpsTrackingActive => {
        if (gpsTrackingActive == "true" || gpsTrackingActive == null) {
          ref.startTrackingLocation();
        }
      })
      .done();

    firestack.analytics.logEventWithName("pageView", {
      screen: "MapViewComponent"
    });
    firestack.analytics.logEventWithName("openMapView");
  }

  // viewDidUnload
  componentWillUnmount() {
    this.stopTrackingLocation();
    Database.stopListening();
  }

  _handleAppStateChange = appState => {
    if (appState == "active") {
      // viewDidAppear
      Database.listenToUsers(this.onOtherUserUpdatedLocation);
    } else if (appState == "inactive" || appState == "background") {
      // viewDidDisappear
      Database.stopListening();
    }
  };

  defaultMarkers() {
    return [
      {
        coordinate: { "latitude": 37.774899, "longitude": -122.425725 },
        key: "fastlane HQ",
        title: "fastlane HQ",
        description: "Where the magic happens 🚀",
        markerImageSource: require("./assets/fastlane.png"),
        url: "https://fastlane.tools",
        type: "poi"
      }
    ]
  }

  // This is called with lat & lng being nil if a marker gets removed
  onOtherUserUpdatedLocation = (
    userId,
    lat,
    lng,
    timestamp,
    twitterUsername
  ) => {
    // if (userId == this.props.userId) {
    //   return; // We don't want to show ourselve, as it might cover other people
    // }

    let foundExisting = -1;
    let coordinatesProvided = !(lat == null && lng == null);
    let coordinate = null;
    let description = timeDifference(new Date(), timestamp) +
      " (Tap to open profile)";

    if (coordinatesProvided) {
      coordinate = { latitude: parseFloat(lat), longitude: parseFloat(lng) };
    }

    for (let i = 0; i < this.state.markers.length; i++) {
      if (this.state.markers[i]["key"] == userId) {
        if (coordinatesProvided) {
          this.state.markers[i]["coordinate"] = coordinate;
          this.state.markers[i]["description"] = description;
        }
        foundExisting = i;
      }
    }

    if (foundExisting > 0 && !coordinatesProvided) {
      // we have to remove this marker from our list
      // as the user disabled their location sharing
      console.log("Removing the marker here");
      this.state.markers.splice(foundExisting, 1);
    }

    // This has to be done **after** we potentially remove
    // the marker, as there is no timestamp for removed markers
    let numberOfHours = 24;
    if (new Date() - timestamp > numberOfHours * 1000 * 60 * 60) {
      this.setState({ markers: this.state.markers }); // So that react re-renders
      return; // Hide all profiles where the last update was over 1 hour ago
    }

    if (coordinatesProvided && foundExisting == -1) {
      let profilePictureUrl = "https://twitter.com/" +
        twitterUsername +
        "/profile_image?size=bigger";
      if (profilePictureUrl) {
        profilePictureUrl = profilePictureUrl.replace(" ", ""); // with no space, we at least get a nice profile picture
      }
      this.state.markers.push({
        coordinate: coordinate,
        key: userId,
        title: twitterUsername,
        description: description,
        profilePicture: profilePictureUrl,
        url: "https://twitter.com/" + twitterUsername,
        type: "user"
      });
    }
    console.log("updating markers here");

    // So that react re-renders
    this.setState({ markers: this.state.markers });
  };

  // Location tracking

  startTrackingLocation = () => {
    firestack.analytics.logEventWithName("startTracking");
    console.log("starting location listening");
    this.setState({ gpsTrackingActive: true });

    Location.requestAlwaysAuthorization();
    Location.setAllowsBackgroundLocationUpdates(true);
    Location.startUpdatingLocation();
    Location.setDistanceFilter(15.0);
    Location.startMonitoringSignificantLocationChanges();

    DeviceEventEmitter.addListener("locationUpdated", position => {
      this.setState({ lastPosition: position });
      this.setState({ gpsTrackingActive: true });

      let userId = this.props.userId;

      Database.setUserLocation(
        userId,
        position.coords.latitude + "",
        position.coords.longitude + "",
        position.timestamp + ""
      );
    });
  };

  stopTrackingLocation = () => {
    console.log("Stop tracking location");
    firestack.analytics.logEventWithName("stopTracking");
    this.setState({ gpsTrackingActive: false });

    Location.stopMonitoringSignificantLocationChanges();
    Location.stopUpdatingLocation();

    let userId = this.props.userId;
    Database.hideUser(userId);
  };

  toggleLocationTracking = () => {
    if (this.state.gpsTrackingActive) {
      this.stopTrackingLocation();
      AsyncStorage.setItem(gpsTrackingActiveKey, "false");
    } else {
      this.startTrackingLocation();
      AsyncStorage.setItem(gpsTrackingActiveKey, "true");
    }
  };

  didTapMoreButton = () => {
    let buttons = [
      this.state.gpsTrackingActive
        ? "Stop sharing location"
        : "Start sharing location",
      this.state.showParties ? "Hide parties" : "Show parties",
      "Go to my location",
      "About this app",
      "Logout",
      "Cancel"
    ];

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: buttons,
        cancelButtonIndex: buttons.length - 1
      },
      buttonIndex => {
        this.setState({ clicked: buttons[buttonIndex] });
        switch (buttonIndex) {
          case 0:
            this.toggleLocationTracking();
            break;
          case 1:
            this.toggleParties();
            break;
          case 2:
            this.moveToUsersLocation();
            break;
          case 3:
            this.showAboutThisApp();
            break;
          case 4:
            this.stopTrackingLocation();
            Database.stopListening();
            this.logout();
            this.props.navigator.pop();
            break;
          case 5:
            // Cancel, nothing to do here
            break;
        }
      }
    );
  };

  toggleParties() {
    if (this.state.showParties) {
      this.removeParties();
      AsyncStorage.setItem(showPartiesKey, "false");
    } else {
      this.loadParties();
      AsyncStorage.setItem(showPartiesKey, "true");
    }
    this.setState({ showParties: !this.state.showParties });
  }

  removeParties() {
    updatedMarkers = [];
    for (let i = 0; i < this.state.markers.length; i++) {
      let currentMarker = this.state.markers[i];
      if (currentMarker.type != "party") {
        updatedMarkers.push(currentMarker);
      }
    }
    this.setState({ markers: updatedMarkers });
  }

  loadParties() {
    let url = "https://caltrain.okrain.com/parties";
    fetch(url)
      .then(response => response.json())
      .then(responseData => {
        try {
          parties = responseData["parties"];
          console.log(parties);
          for (let i = 0; i < parties.length; i++) {
            let current = parties[i];
            // hide events that already happened
            if (new Date(current["endDate"]) > new Date()) {
              this.state.markers.push({
                coordinate: {
                  latitude: parseFloat(current["latitude"]),
                  longitude: parseFloat(current["longitude"])
                },
                key: current["objectId"],
                title: current["title"],
                description: current["address1"],
                profilePicture: current["icon"],
                url: current["url"],
                type: "party"
              });
            }
          }
          this.setState({ markers: this.state.markers }); // So that react re-renders
        } catch (exception) {
          console.log(exception);
        }
      })
      .done();
  }

  showAboutThisApp = () => {
    firestack.analytics.logEventWithName("openAboutScreen");
    this.setState({ aboutThisAppModalVisible: true });
  };

  moveToUsersLocation = () => {
    let region = this.state.region;
    let newRegion = {
      latitude: this.state.lastPosition.coords.latitude,
      longitude: this.state.lastPosition.coords.longitude,
      latitudeDelta: region["latitudeDelta"],
      longitudeDelta: region["longitudeDelta"]
    };
    this.map.animateToRegion(newRegion);
  };

  async logout() {
    firestack.auth
      .signOut()
      .then(res => console.log("You have been signed out"))
      .catch(err => console.error("Uh oh... something weird happened"));
  }

  openURL = url => {
    console.log("Open Twitter profile: " + url);
    // This will open up the Twitter profile
    Linking.openURL(url);
  };

  onRegionChange(region) {
    this.setState({ region });
  }

  render() {
    return (
      <View style={styles.container}>
        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.aboutThisAppModalVisible}
        >
          <WebView
            style={{
              height: "100%",
              width: "100%",
              backgroundColor: "#444"
            }}
            ref={ref => {
              this.webview = ref;
            }}
            source={require("./about.html")}
            scalesPageToFit={false}
            onNavigationStateChange={event => {
              if (
                event.url.includes("http") && !event.url.includes("localhost")
              ) {
                this.webview.stopLoading();
                Linking.openURL(event.url);
              }

              if (event.url == "close://") {
                this.webview.stopLoading();
                this.setState({ aboutThisAppModalVisible: false });
              }
            }}
          />
        </Modal>
        <MapView
          ref={ref => {
            this.map = ref;
          }} // so we can reference it via this.map
          initialRegion={this.state.region}
          onRegionChange={region => this.onRegionChange(region)}
          showsMyLocationButton={false} // setting this to true doesn't work
          showsUserLocation={this.state.gpsTrackingActive}
          style={styles.map}
        >
          {this.state.markers.map(marker => (
            <MapView.Marker
              coordinate={marker.coordinate}
              title={marker.title}
              description={marker.description}
              onCalloutPress={() => this.openURL(marker.url)}
              key={marker.key}
            >
              {marker.profilePicture &&
                <Image source={{ uri: marker.profilePicture }} style={styles.mapMarker} />
              }
              {marker.markerImageSource &&
                <Image source={ marker.markerImageSource } style={styles.mapMarker} />
              }
            </MapView.Marker>
          ))}
        </MapView>
        <Text style={styles.gpsSender} onPress={this.didTapMoreButton}>
          {this.state.gpsTrackingActive ? "📡" : "👻"}
        </Text>
        {!this.state.gpsTrackingActive &&
          <Text style={styles.notSharingLocationWarning}>
            You're currently not sharing your location
          </Text>}
        <View style={styles.statusBarBackground} />
      </View>
    );
  }
}

// Taken from https://stackoverflow.com/questions/6108819/javascript-timestamp-to-relative-time-eg-2-seconds-ago-one-week-ago-etc-best

function timeDifference(current, previous) {
  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - previous;

  if (elapsed < msPerMinute) {
    return "Just now"; // less than a minute
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + " minutes ago";
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + " hours ago";
  }
}

module.exports = MapViewComponent;
