import React, { Component } from "react";

import Firestack from "react-native-firestack";
const firestack = new Firestack();

const CachedImage = require("react-native-cached-image");

const Database = require("./database.js");
const styles = require("./styles.js");
const ReactNative = require("react-native");

import {
  View,
  Text,
  Image,
  Linking,
  Modal,
  Button,
  ListView,
  TouchableHighlight
} from "react-native";

const {
  AppState
} = ReactNative;

const onPressBack = () => {
  let nav = ref.props.navigator;
  nav.pop();
};

class ListViewComponent extends Component {

  constructor(props) {
    super(props);

    var dataSource = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
    });

    this.state = {
      markers: [],
      loaded: false,
      dataSource: dataSource,
    };
  }

  // viewDidLoad
  componentDidMount() {

    AppState.addEventListener("change", this._handleAppStateChange);
    this._handleAppStateChange(AppState.currentState);

    firestack.analytics.logEventWithName("pageView", {
      screen: "ListViewComponent"
    });
    firestack.analytics.logEventWithName("openListView");
  }

  // viewDidUnload
  componentWillUnmount() {
    AppState.removeEventListener("change", this._handleAppStateChange);
    Database.stopListening();
  }

  _handleAppStateChange = appState => {
    if (appState == "active") {
      // viewDidAppear
      console.log("Start listening to other users");
      Database.listenToUsers(this.onOtherUserUpdatedLocation);
    } else if (appState == "inactive" || appState == "background") {
      // viewDidDisappear
      console.log("Stop listening to other users");
      Database.stopListening();
    }
  };

  // This is called with lat & lng being nil if a marker gets removed
  onOtherUserUpdatedLocation = (
    userId,
    lat,
    lng,
    timestamp,
    twitterUsername,
    shouldSetState
    ) => {
    // if (userId == this.props.userId) {
    //   return; // We don't want to show ourselve, as it might cover other people
    // }

    let foundExisting = -1;
    let coordinatesProvided = !(lat == null && lng == null);
    let coordinate = null;
    let description = timeDifference(new Date(), timestamp);
    let userDistance = 0;

    if (coordinatesProvided) {
      coordinate = { latitude: parseFloat(lat), longitude: parseFloat(lng) };
      userDistance = this._calculateDistance(coordinate);
    }

    for (let i = 0; i < this.state.markers.length; i++) {
      if (this.state.markers[i]["key"] == userId) {
        if (coordinatesProvided) {
          this.state.markers[i]["coordinate"] = coordinate;
          this.state.markers[i]["distance"] = userDistance;
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
      if (shouldSetState) {
        // So that react re-renders
        this._sortMarkers();
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(this.state.markers),
          loaded: true
        });
      }
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
        distance:userDistance,
        key: userId,
        title: twitterUsername,
        description: description,
        profilePicture: profilePictureUrl,
        url: "https://twitter.com/" + twitterUsername,
        type: "user"
      });
    }
    console.log(
      "updating markers here with state boolean: " + shouldSetState.toString()
      );

    if (shouldSetState) {
      this._sortMarkers();
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(this.state.markers),
        loaded: true
      });
    }
  };


  _calculateDistance(coordinate) {
    let calculatedDistance = distance(this.props.latitude,this.props.longitude,coordinate.latitude,coordinate.longitude,"M",1);
    return calculatedDistance;
  }

  _formatDistance(distance) {

    // If there's no lastPosition, don't display any distance
    if (this.props.latitude == 0) {
      return "";
    }

    if (distance == 0) {
      return "It's you!";
    }

    if (distance < 1) {
      distance = Math.round(distance*5280);
      return distance + " feet away";
    }

    if (distance > 10) {
      distance = Math.round(distance);
    }

    return distance + " mi away";
  }

  _openURL = url => {
    console.log("Open Twitter profile: " + url);
    // This will open up the Twitter profile
    Linking.openURL(url);
  };

  _sortMarkers() {
    let sortedMarkers = this.state.markers.sort((a,b) => {
      if (a.distance < b.distance) {
        return -1;
      }

      if (a.distance > b.distance) {
        return 1;
      }
        // a must be equal to b
        return 0;
      });

    this.setState({markers:sortedMarkers});
  }

  _pressRow(user) {
    this._openURL(user.url);
  }

  render() {
    return (
      <View>
        <View style={styles.navigationView} >
          <View style={styles.navigationBar}>
            <Button
              onPress={onPressBack}
              title="Back"
              color="white"/>
            <Text style={styles.navigationTitle}>
            WWDC family
            </Text>
            <View style={{width: 60}} />
          </View>
        </View>
        <ListView
          dataSource={this.state.dataSource}
          renderRow={this.renderUser.bind(this)}
          renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.cellSeparator} />}
          style={styles.listView}/>
      </View>
      );
  }

  renderUser(user) {
    return (
      <TouchableHighlight onPress={() => this._pressRow(user)}>
        <View style={styles.cellContainer}>
          <Image
            source={{uri: user.profilePicture}}
            style={styles.cellThumbnail}
          />
          <View style={styles.rightContainer}>
            <View style={styles.rightUpperContainer}>
              <Text style={styles.cellTitle}>{user.title}</Text>
              <Text style={styles.cellDate}>{user.description}</Text>
            </View>
            <View style={styles.rightLowerContainer}>
            <Text style={styles.cellDistance}>{this._formatDistance(user.distance)}</Text>
            </View>
          </View>
        </View>
      </TouchableHighlight> 
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

// Taken from http://www.geodatasource.com/developers/javascript

function distance(lat1, lon1, lat2, lon2, unit, decimal) {
  var radlat1 = Math.PI * lat1/180
  var radlat2 = Math.PI * lat2/180
  var theta = lon1-lon2
  var radtheta = Math.PI * theta/180
  var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  dist = Math.acos(dist);
  dist = dist * 180/Math.PI;
  dist = dist * 60 * 1.1515;
  if (unit=="K") { dist = dist * 1.609344; }
  if (unit=="N") { dist = dist * 0.8684; }

  dist = Math.round(dist * Math.pow(10, decimal))/Math.pow(10, decimal)

  return dist;
}

module.exports = ListViewComponent;
