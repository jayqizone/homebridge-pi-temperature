const Exec = require('child_process').exec;
const Interval = 60;

module.exports = class TempDevice {
  constructor(accessory, handler) {
    this.accessory = accessory;
    this.handler = handler;
    this.interval = (handler.config.interval || Interval) * 1000;

    this.temp;
  }

  watch() {
    getMilliTemp(milliTemp => {
      this.update(Math.round(milliTemp / 1000));

      setTimeout(this.watch.bind(this), this.interval);
    });
  }

  update(temp) {
    if (temp !== this.temp) {
      this.temp = temp;

      this.handler.report(this);
    }
  }
}

function getMilliTemp(callback) {
  Exec('cat /sys/class/thermal/thermal_zone0/temp', (error, stdout, stderr) => {
    !error && callback && callback(stdout);
  });
}
