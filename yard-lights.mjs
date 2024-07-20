function getEnvVar(name) {
  let res = Shelly.call("GetConfig", { key: `system.env.${name}` });
  if (res.code === 200) {
    return res.value;
  } else {
    print(`Failed to get environment variable ${name}: ${res.code}`);
    return null;
  }
}

let latitude = getEnvVar("LATITUDE");
let longitude = getEnvVar("LONGITUDE");
let sunsetApiUrl = `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&formatted=0&tzid=Europe/Budapest`;
let midnightTime = "00:00";

function getSunsetTime() {
  let res = Shelly.call("HTTP.GET", { url: sunsetApiUrl });
  if (res.code === 200) {
    let response = JSON.parse(res.body);
    let sunsetTime = new Date(response.results.sunset);
    return sunsetTime;
  } else {
    print("Failed to fetch sunset time: " + res.code);
    return null;
  }
}

function turnOnOutput() {
  Shelly.call("Switch.Set", { id: 0, on: true });
  print("Output turned on at sunset");
}

function turnOffOutput() {
  Shelly.call("Switch.Set", { id: 0, on: false });
  print("Output turned off at midnight");
}

let sunsetTime = getSunsetTime();
if (sunsetTime) {
  let sunsetDelay = sunsetTime.getTime() - Timer.now() * 1000;
  if (sunsetDelay > 0) {
    Timer.set(sunsetDelay, false, turnOnOutput);
  }
}

let now = Timer.now();
let midnightDelay = (Timer.parse(midnightTime, "HH:MM") - (now % 86400)) * 1000;
if (midnightDelay < 0) {
  midnightDelay += 86400 * 1000;
}
Timer.set(midnightDelay, false, turnOffOutput);
