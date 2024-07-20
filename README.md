# Hotel Automation

## Project to automate warm water circulation and turning on Yard lights on days when reservation exists

Smart devices using ESP32 chip with Mongoose OS and Web interface. You can upload mJS scripts and toggle them from the network through itsh REST Api.

## Components

Project uses Sehlly devices to control the resources:

- Shelly 1 PM Plus + Addon Plus + Ds18b20 thermo sensor
  - Power monitoring
  - Thermometer
  - Relay to contol outputs with code
- Shelly 1 Plus
  - Relay to control outputs with code

Ubuntu server as GitHub runner to run the JS script, colletct data and serve them to hosted Grafana.

More info later.
