require("dotenv").config();
const { MongoClient } = require("mongodb");
const winston = require("winston");

const mongoUri = process.env.MONGODB_URI;
const shelly1PmPlusIp = process.env.SHELLY_1PM_PLUS_IP;
const shelly1PlusIp = process.env.SHELLY_1_PLUS_IP;

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: "application.log" }),
    new winston.transports.Console(),
  ],
});

async function getTodayActivationStatus() {
  const client = new MongoClient(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection("activation_dates");

    const today = new Date().toISOString().split("T")[0];
    const doc = await collection.findOne({ date: today });

    return doc ? doc.activate : false;
  } finally {
    await client.close();
  }
}

async function sendCommandToShelly(ip, command) {
  const url = `http://${ip}/rpc/${command}`;
  const response = await fetch(url, { method: "POST" });
  const data = await response.json();
  return data;
}

async function main() {
  const shouldActivate = await getTodayActivationStatus();

  if (shouldActivate) {
    logger.info("Activating Shelly devices...");

    try {
      await sendCommandToShelly(shelly1PmPlusIp, "Script.Start?id=0");
      logger.info("Shelly 1PM Plus activated.");
    } catch (error) {
      logger.error(`Failed to activate Shelly 1PM Plus: ${error}`);
    }

    try {
      await sendCommandToShelly(shelly1PlusIp, "Script.Start?id=0");
      logger.info("Shelly 1 Plus activated.");
    } catch (error) {
      logger.error(`Failed to activate Shelly 1 Plus: ${error}`);
    }
  } else {
    logger.info("No activation needed for today.");
  }
}

main().catch((error) => {
  logger.error(`Error in main execution: ${error}`);
});
