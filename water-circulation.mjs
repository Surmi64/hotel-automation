let tempCheckInterval = 30 * 1000;
let temperatureThresholdLow = 35;
let temperatureThresholdHigh = 40;

function checkTemperature() {
  Shelly.call("Temperature.GetStatus", { id: 0 }, function (res) {
    if (res && res.tmp && res.tmp.tC) {
      let temperature = res.tmp.tC;
      print("Current temperature: ", temperature);

      if (temperature < temperatureThresholdLow) {
        Shelly.call("Switch.Set", { id: 0, on: true });
        print("Temperature below 35°C, turning on the output.");
      } else if (temperature > temperatureThresholdHigh) {
        Shelly.call("Switch.Set", { id: 0, on: false });
        print("Temperature above 40°C, turning off the output.");
      }
    } else {
      print("Failed to get temperature status.");
    }
  });
}

checkTemperature();
Timer.set(tempCheckInterval, true, checkTemperature);
