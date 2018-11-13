# Mill heaters

Athom Homey support for for [Mill WiFi](https://www.millheat.com/mill-wifi/) heaters.

### Supported devices

All Mill WiFi heaters should in theory be supported, but only AV1200WIFI and AV1000LWIFI have been tested.

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

### Supported Languages:

* English

### Privacy

This app is using [sentry.io](http://sentry.io) to log exceptions and errors. By installing this app, you accept that the app may send error logs to Sentry. No personal or device information, like email, passwords, Homey identification etc., is ever sent, only logs regarding the error if that occurred. The logs includes exception messages, parts of source code, line numbers, app version etc.

### Disclaimer

Use this app at your own risk. The app has been developed with the same APIs and interfaces used by the official Mill app, but there is a chance that the API calls can have unexpected consequences for which nobody but you are responsible.

### Change Log:

#### v0.0.2
* Added Sentry logging
*
#### v0.0.1
* First version

### Credits
[Heat](https://thenounproject.com/search/?q=heat&i=860995) by Stan Diers from the Noun Project
