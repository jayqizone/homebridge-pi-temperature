const TempDevice = require('./lib/TempDevice');
var PlatformAccessory, Accessory, Service, Characteristic, UUIDGen;

module.exports = function(homebridge) {
  PlatformAccessory = homebridge.platformAccessory;
  Accessory = homebridge.hap.Accessory;
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  UUIDGen = homebridge.hap.uuid;

  homebridge.registerPlatform('homebridge-pi-temperature', 'TempPlatform', TempPlatform, true);
}

class TempPlatform {
  constructor(log, config, api) {
    this.log = log;
    this.config = config || {};
    this.accessories = [];
    this.devices = [];

    if (api) {
      this.api = api;
      this.api.on('didFinishLaunching', () => {
        this.init();

        setInterval(() => {
          this.devices.forEach(device => this.report(device));
        }, 300000);
      });
    }
  }

  init() {
    let name = 'Raspberry Pi';
    let uuid = UUIDGen.generate(name);

    let accessory = this.accessories.find(acc => acc.UUID === uuid);
    if (!accessory) {
      accessory = new PlatformAccessory(name, uuid, Accessory.Categories.SENSOR);
      accessory.reachable = true;

      accessory.getService(Service.AccessoryInformation)
        .setCharacteristic(Characteristic.Manufacturer, 'Default-Manufacturer')
        .setCharacteristic(Characteristic.Model, 'Temperature Sensor')
        .setCharacteristic(Characteristic.SerialNumber, 'Default-SerialNumber');

      accessory.addService(Service.TemperatureSensor, name);
      this.api.registerPlatformAccessories('homebridge-pi-temperature', 'TempPlatform', [accessory]);
      accessory.on('identify', (paired, callback) => {
        callback && callback();
      });

      this.accessories.push(accessory);
    }

    let device = new TempDevice(accessory, this);
    device.watch();
    this.devices.push(device);
  }

  configureAccessory(accessory) {
    accessory.reachable = true;
    accessory.on('identify', (paired, callback) => {
      callback && callback();
    });

    this.accessories.push(accessory);
  }

  report(device) {
    device.accessory.reachable = true;
    let character = device.accessory.getService(Service.TemperatureSensor).getCharacteristic(Characteristic.CurrentTemperature);

    character.updateValue(device.temp)
  }
}
