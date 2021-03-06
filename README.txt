All Mill WiFi heaters should in theory be supported.
The following devices has been tested by the community and reported working:
    - AV600WIFI
    - AV800LWIFI
    - AV1000LWIFI
    - AV1200WIFI
    - NE600WIFI
    - NE1200WIFI

The module supports all normal thermostat triggers, conditions and actions, but also has a few in addition.

Supported triggers:
    - Thermostat mode has changed
    - Thermostat mode has changed to <mode>

Supported conditions:
    - Thermostat is/isn't heating
    - Thermostat mode is/isn't <mode>

Supported actions:
    - Set thermostat mode


To use the app
Open Settings and enter you Mill credentials before trying to add any Mill heaters.

After adding a heater device, enter the device settings to set the power usage of the heater.

The Mill service has three modes, Comfort, Sleep and Away.

When you change the mode, the temperature will change to that mode's temperature set point. Adjusting the temperature changes the set point for that mode.

If you select the mode "Program", the Mill service will take control and adjust the mode during the day according to the program you set up on the Mill app. The device will then change to the current thermostat mode.

Tip: If you want Homey to have complete control, make sure to turn on "Control Device Individually" in the Mill app. If not, the Mill app can override Homey.

Now also supports Energy (requires re-pairing if device is added prior to version 1.0.6). Set power consumption in the device settings to match the heater model.

Supported Languages:
    - English
    - Norwegian
    - Dutch

Privacy
This app is using Sentry.io to log exceptions and errors. By installing this app, you accept that the app may send error logs to Sentry. No personal or device information, like email, passwords, Homey identification etc., is ever sent, only logs regarding the error if that occurred. The logs includes exception messages, parts of source code, line numbers, app version etc.

Disclaimer
Use this app at your own risk. The app has been developed with the same APIs and interfaces used by the official Mill app, but there is a chance that the API calls can have unexpected consequences for which nobody but you are responsible.

Credits
Heat by Stan Diers from the Noun Project
