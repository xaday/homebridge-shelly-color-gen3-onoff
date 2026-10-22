# Homebridge Shelly Color Gen3 On/Off

Simple Homebridge plugin for **Shelly Color Bulb Gen3**, using local Shelly RPC. Exposes only **on/off** as a HomeKit lightbulb. Does not require MQTT or cloud services.

## Configuration

Add this object to the `platforms` array of Homebridge's `config.json`:

```json
{
  "platform": "ShellyColorGen3OnOff",
  "name": "Shelly Color Gen3",
  "ip": "192.168.1.100",
  "deviceId": "shellycolorblbg3-XXXXXXXXXXXX"
}
```

Replace the IP and device ID with your own. To use a Homebridge Child Bridge, enable it for this platform in the Homebridge UI.

## Local installation

In the directory containing `package.json`:

```sh
sudo hb-service link
sudo hb-service restart
```

Alternatively install with the npm environment used by your Homebridge installation. Publishing to GitHub alone does **not** make the plugin searchable in Homebridge; npm publication is separate.

## Compatibility

Developed for Shelly Color Bulb Gen3. Uses `RGBCCT.GetStatus` and `RGBCCT.Set` without a `transition_duration` argument (some firmware versions reject zero). Tested by the original user on their device; other firmware versions and models are not guaranteed.
