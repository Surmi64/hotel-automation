let tempCheckInterval = 30 * 1000;
let temperatureThresholdLow = 35;
let temperatureThresholdHigh = 40;

function getOutputStatus(callback) {
  Shelly.call("Switch.GetStatus", { id: 0 }, function (res) {
    if (res && res.output !== undefined) {
      callback(res.output);
    } else {
      print("Failed to get switch status.");
      callback(null);
    }
  });
}

function checkTemperature() {
  Shelly.call("Temperature.GetStatus", { id: 100 }, function (res) {
    if (res.tC) {
      let temperature = res.tC;
      print("Current temperature: ", temperature);

      getOutputStatus(function (outputStatus) {
        if (outputStatus === null) {
          print("Unable to get output status.");
          return; // Exit if unable to get output status
        }

        print("Output status: ", outputStatus);

        if (temperature < temperatureThresholdLow && !outputStatus) {
          Shelly.call("Switch.Set", { id: 0, on: true });
          print("Temperature below 35°C and output is off, turning on the output.");
        } else if (temperature > temperatureThresholdHigh && outputStatus) {
          Shelly.call("Switch.Set", { id: 0, on: false });
          print("Temperature above 40°C and output is on, turning off the output.");
        } else {
          print("Temperature within range or no change needed.");
        }
      });
    } else {
      print("Failed to get temperature status.");
    }
  });
}

checkTemperature();
Timer.set(tempCheckInterval, true, checkTemperature);