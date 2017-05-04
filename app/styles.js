const React = require("react-native");
const { StyleSheet } = React;
const constants = {
  navBarHeight: 10,
  gpsPadding: 20,
  mapMarkerSize: 40
};

const styles = StyleSheet.create({
  loginHeaderImage: {
    width: "100%",
    top: 0,
    height: "30%"
  },
  loginHeaderTitle: {
    color: "white",
    opacity: 0.93,
    fontSize: 50,
    textAlign: "center",
    marginTop: 80
  },
  email: {
    textAlign: "center",
    height: 44,
    borderStyle: "solid",
    borderColor: "gray",
    borderWidth: 1,
    margin: 30,
    marginBottom: 0
  },
  password: {
    textAlign: "center",
    height: 44,
    borderStyle: "solid",
    borderColor: "gray",
    borderWidth: 1,
    margin: 30,
    marginBottom: 15
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  dismissKeyboardView: {
    backgroundColor: "transparent",
    position: "absolute",
    width: "100%",
    height: "100%"
  },
  map: {
    height: "100%",
    width: "100%"
  },
  gpsSender: {
    right: constants.gpsPadding,
    bottom: constants.gpsPadding,
    backgroundColor: "transparent",
    position: "absolute",
    fontSize: 40,
    transform: [{
      rotateY: '-180deg'
    }]
  },
  mapMarker: {
    height: constants.mapMarkerSize,
    width: constants.mapMarkerSize,
    borderRadius: constants.mapMarkerSize / 2.0,
    borderColor: "white",
    borderWidth: 2
  },
  statusBarBackground: {
    backgroundColor: "#4E6896",
    height: 20,
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0
  },
  "notSharingLocationWarning": {
    position: "absolute",
    left: 0,
    right: 0,
    top: 10 + constants.navBarHeight,
    paddingTop: 10,
    paddingBottom: 10,
    textAlign: "center",
    fontSize: 16,
    backgroundColor: "#4E6896",
    color: "white"
  }
});

module.exports = styles;
module.exports.constants = constants;
