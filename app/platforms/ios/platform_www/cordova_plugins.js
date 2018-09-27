cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
  {
    "id": "cordova-plugin-dialogs.notification",
    "file": "plugins/cordova-plugin-dialogs/www/notification.js",
    "pluginId": "cordova-plugin-dialogs",
    "merges": [
      "navigator.notification"
    ]
  },
  {
    "id": "cordova-plugin-network-information.network",
    "file": "plugins/cordova-plugin-network-information/www/network.js",
    "pluginId": "cordova-plugin-network-information",
    "clobbers": [
      "navigator.connection",
      "navigator.network.connection"
    ]
  },
  {
    "id": "cordova-plugin-network-information.Connection",
    "file": "plugins/cordova-plugin-network-information/www/Connection.js",
    "pluginId": "cordova-plugin-network-information",
    "clobbers": [
      "Connection"
    ]
  },
  {
    "id": "cordova-plugin-ping.ping",
    "file": "plugins/cordova-plugin-ping/www/ping.js",
    "pluginId": "cordova-plugin-ping",
    "clobbers": [
      "Ping"
    ]
  },
  {
    "id": "phonegap-plugin-barcodescanner.BarcodeScanner",
    "file": "plugins/phonegap-plugin-barcodescanner/www/barcodescanner.js",
    "pluginId": "phonegap-plugin-barcodescanner",
    "clobbers": [
      "cordova.plugins.barcodeScanner"
    ]
  },
  {
    "id": "cordova-plugin-exitapp-ios.ExitApp",
    "file": "plugins/cordova-plugin-exitapp-ios/www/ExitApp.js",
    "pluginId": "cordova-plugin-exitapp-ios",
    "clobbers": [
      "navigator.app"
    ]
  }
];
module.exports.metadata = 
// TOP OF METADATA
{
  "cordova-plugin-dialogs": "2.0.1",
  "cordova-plugin-network-information": "2.0.1",
  "cordova-plugin-ping": "0.3.1",
  "cordova-plugin-whitelist": "1.3.3",
  "phonegap-plugin-barcodescanner": "8.0.0",
  "cordova-plugin-exitapp-ios": "1.0.0"
};
// BOTTOM OF METADATA
});