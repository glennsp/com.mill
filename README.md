# Mill heaters

Athom Homey support for for [Mill WiFi](https://www.millheat.com/mill-wifi/) heaters.

### Supported devices

All Mill WiFi heaters should in theory be supported.
The following devices has been tested by the community and reported working:
* AV600WIFI
* AV800LWIFI
* AV1000LWIFI
* AV1200WIFI
* NE600WIFI
* NE1200WIFI

### Flow cards
The module supports all normal thermostat triggers, conditions and actions, but also has a few in addition.

Supported triggers:
* Thermostat mode has changed
* Thermostat mode has changed to <mode>

Supported conditions:
* Thermostat is/isn't heating
* Thermostat mode is/isn't <mode>

Supported actions:
* Set thermostat mode

### Setup

Open Settings and enter you Mill credentials before trying to add any Mill heaters.

### Device Settings
The default power consumption is set to 1200W, please adjust this to match you model in the device advanced settings.

### Usage

The Mill service has three modes, _Comfort_, _Sleep_ and _Away_. (There's also a _Holiday_ mode exposed in the API, but not supported in the Mill UI yet).

When you change the mode, the temperature will change to that mode's temperature set point. Adjusting the temperature changes the set point for that mode.

If you select the mode _Program_, the Mill service will take control and adjust the mode during the day according to the program you set up on the Mill app. The device will then change to the current thermostat mode.

### Supported Languages

* English
* Norwegian
* Dutch

### Privacy

This app is using [sentry.io](http://sentry.io) to log exceptions and errors. By installing this app, you accept that the app may send error logs to Sentry. No personal or device information, like email, passwords, Homey identification etc., is ever sent, only logs regarding the error if that occurred. The logs includes exception messages, parts of source code, line numbers, app version etc.

### Disclaimer

Use this app at your own risk. The app has been developed with the same APIs and interfaces used by the official Mill app, but there is a chance that the API calls can have unexpected consequences for which nobody but you are responsible.

### Change Log:

##### v1.0.7
* Added more languages
* Improved logging
* Validating Mill API requests

##### v1.0.6
* Added support for Energy (may require re-pairing if device is added prior to version 1.0.6)
* Fixed issues with flows with multiple devices
* Added Norwegian and Dutch
* Added single click on/off

##### v1.0.5
* Support for new app store

##### v1.0.4
* Changed Mill endpoint
* Fixed problems where heaters couldn't be reinstalled after being deleted
* Fixed problems with flow cards

##### v1.0.3
* Fixed "Set mode" problems with flow cards

##### v1.0.0
* Added logging interface

##### v0.0.2
* Added Sentry logging

##### v0.0.1
* First version

### Credits
[Heat](https://thenounproject.com/search/?q=heat&i=860995) by Stan Diers from the Noun Project
