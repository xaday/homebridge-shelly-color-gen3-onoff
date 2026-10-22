'use strict';

const PLUGIN_NAME = 'homebridge-shelly-color-gen3-onoff';
const PLATFORM_NAME = 'ShellyColorGen3OnOff';

module.exports = (api) => {
  api.registerPlatform(PLATFORM_NAME, ShellyColorGen3OnOff);
};

class ShellyColorGen3OnOff {
  constructor(log, config, api) {
    this.log = log;
    this.config = config;
    this.api = api;
    this.cachedAccessories = [];
    this.ip = config.ip;
    this.deviceId = config.deviceId;
    this.name = config.name || 'Shelly Color Gen3';
    this.Service = api.hap.Service;
    this.Characteristic = api.hap.Characteristic;
    api.on('didFinishLaunching', () => this.start());
  }

  configureAccessory(accessory) {
    this.cachedAccessories.push(accessory);
  }

  start() {
    if (!this.ip || !this.deviceId) {
      this.log.error('Configure both ip and deviceId.');
      return;
    }
    const uuid = this.api.hap.uuid.generate(this.deviceId.toLowerCase());
    let accessory = this.cachedAccessories.find(a => a.UUID === uuid);
    const obsolete = this.cachedAccessories.filter(a => a.UUID !== uuid);
    if (obsolete.length) {
      this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, obsolete);
    }
    if (!accessory) {
      accessory = new this.api.platformAccessory(this.name, uuid);
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    }
    accessory.displayName = this.name;
    accessory.getService(this.Service.AccessoryInformation)
      .setCharacteristic(this.Characteristic.Manufacturer, 'Shelly')
      .setCharacteristic(this.Characteristic.Model, 'Color Bulb Gen3')
      .setCharacteristic(this.Characteristic.SerialNumber, this.deviceId);
    const light = accessory.getService(this.Service.Lightbulb) || accessory.addService(this.Service.Lightbulb, this.name);
    light.getCharacteristic(this.Characteristic.On)
      .onGet(async () => Boolean((await this.rpc('RGBCCT.GetStatus', { id: 0 })).output))
      .onSet(async value => {
        await this.rpc('RGBCCT.Set', { id: 0, on: Boolean(value) });
      });
    this.log.info('Shelly on/off registered: %s (%s)', this.deviceId, this.ip);
  }

  async rpc(method, params) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(`http://${this.ip}/rpc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 1, method, params }),
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (data.error) throw new Error(`Shelly RPC: ${JSON.stringify(data.error)}`);
      return data.result;
    } catch (error) {
      this.log.error('%s failed: %s', method, error.message);
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}
