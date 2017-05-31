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
  bottomBar: {
    left: 0,
    bottom: 0,
    right: 0,
    position: "absolute",
    backgroundColor: "#4E6896",
    padding: 10
  },
  onlineUsers: {
    color: "white",
    textAlign: "center",
    opacity: 0.95
  },
  gpsSender: {
    backgroundColor: "transparent",
    fontSize: 20,
    width: 40,
    height: 40,
    textAlign: "center",
    position: "absolute",
    right: 0,
    bottom: -7,
    transform: [
      {
        rotateY: "-180deg"
      }
    ]
  },
  mapMarker: {
    height: constants.mapMarkerSize,
    width: constants.mapMarkerSize,
    borderRadius: constants.mapMarkerSize / 2.0,
    borderColor: "white",
    borderWidth: 2,
    backgroundColor: "white"
  },
  nonPersonMarker: {
    height: constants.mapMarkerSize,
    width: constants.mapMarkerSize,
    borderRadius: constants.mapMarkerSize / 5.0,
    borderColor: "#DDD",
    borderWidth: 2,
    backgroundColor: "white"
  },
  statusBarBackground: {
    backgroundColor: "#4E6896",
    height: 20,
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0
  },
  notSharingLocationWarning: {
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
  },
  listView: {
    paddingTop: 0,
    backgroundColor: '#F5FCFF',
  },
  cellSeparator: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E5E5',
  },
  cellContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },
  rightContainer: {
    flex: 1,
  },
  rightUpperContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    height:25,
    marginTop: 8,
  },
  rightLowerContainer: {
    flex: 1,
    flexDirection: 'row',
    height:25,
    marginBottom: 8,
  },
  cellTitle: {
    fontSize: 16,
    textAlign: 'left',
    color: "#292929",
    marginTop: 4,
  },
  cellDate: {
    fontSize: 12,
    color: "#939393",
    textAlign: 'right',
    marginRight: 8,
    alignSelf: 'flex-end', 
    marginBottom: 4,
  },
  cellDistance: {
    fontSize: 12,
    color: "#4E6896",
    marginTop: 4,
    textAlign: 'left',
  },
  cellThumbnail: {
    width: 50,
    borderRadius: 25,
    height: 50,
    margin: 8
  },
  navigationView: {
    paddingTop:0,
    height:64,
    backgroundColor:"#4E6896",
  },
  navigationBar: {
    marginTop:20,
    height:44,
    flexDirection:'row',
    justifyContent: 'space-between',
  },
  navigationBackButton: {
    textAlign:"left",
    alignSelf:"center",
    color:"white",
  },
  navigationTitle: {
    fontSize: 17,
    textAlign:"center",
    alignSelf:"center",
    color:"white",
  }
});

module.exports = styles;
module.exports.constants = constants;
