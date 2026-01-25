import logging ## to configure logging
import os ## to handle file paths
from datetime import datetime ## to get the current date and time

LOG_FILE=f"{datetime.now().strftime('%m_%d_%Y_%H_%M_%S')}.log" ## log file name with timestamp
logs_path=os.path.join(os.getcwd(),"logs",LOG_FILE) ## logs directory path
os.makedirs(logs_path,exist_ok=True) ## create logs directory if it doesn't exist

LOG_FILE_PATH=os.path.join(logs_path,LOG_FILE) ## full log file path

logging.basicConfig(
    filename=LOG_FILE_PATH,
    format="[ %(asctime)s ] %(lineno)d %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
    
) ## configuring the logging
