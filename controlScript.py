import os
import logging
import subprocess
from pymongo import MongoClient
from dotenv import load_dotenv
import datetime

load_dotenv()

mongo_uri = os.getenv('MONGODB_URI')
shelly1_pm_plus_ip = os.getenv('SHELLY_1PM_PLUS_IP')
shelly1_plus_ip = os.getenv('SHELLY_1_PLUS_IP')
shelly_username = os.getenv('SHELLY_USERNAME')
shelly_password = os.getenv('SHELLY_PASSWORD')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s]: %(message)s',
    handlers=[
        logging.FileHandler("/var/shelly-automation/hotel-automation/application.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger()

def get_today_activation_status():
    client = MongoClient(mongo_uri)
    try:
        db = client.get_database('hotel-automation')
        collection = db['sabee_dates']
        
        today = str(datetime.date.today())
        doc = collection.find_one({'date': today})
        
        return doc
    finally:
        client.close()

def send_command_to_shelly(ip,id,action):
    if action == "start":
        command = f"curl --anyauth -u {shelly_username}:{shelly_password} http://{ip}/rpc/Script.Start?id={id}"
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
    elif action == "stop":
        command = f"curl --anyauth -u {shelly_username}:{shelly_password} http://{ip}/rpc/Script.Stop?id={id}"
        result = subprocess.run(command, shell=True, capture_output=True, text=True)

    if result.returncode != 0:
        logger.error(f"Command failed: {result.stderr}")
    else:
        logger.info(f"Command output: {result.stdout}")

def main():
    should_activate = get_today_activation_status()
    if should_activate.get("water") & should_activate.get("lights"):
        logger.info("Activating Shelly devices...")
        try:
            send_command_to_shelly(shelly1_pm_plus_ip,1,"start")
            logger.info("Water circulation activated for today.")
        except Exception as error:
            logger.error(f"Failed to activate Shelly 1PM Plus: {error}")
        # try:
        #     send_command_to_shelly(shelly1_plus_ip,1,"start")
        #     logger.info("Shelly 1 Plus activated.")
        # except Exception as error:
        #     logger.error(f"Failed to activate Shelly 1 Plus: {error}")
    else:
        try:
            send_command_to_shelly(shelly1_pm_plus_ip,1,"stop")
            logger.info("Water circulation deactivated for today.")
        except Exception as error:
            logger.error(f"Failed to deactivate Shelly 1PM Plus: {error}")
        # try:
        #     send_command_to_shelly(shelly1_plus_ip,1,"stop")
        #     logger.info("Shelly 1 Plus deactivated.")
        # except Exception as error:
        #     logger.error(f"Failed to deactivate Shelly 1 Plus: {error}")

if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        logger.error(f"Error in main execution: {error}")
