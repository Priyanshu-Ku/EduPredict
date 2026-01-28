import os ## to handle file paths
import sys ## to handle exceptions
from src.exception import CustomException ## custom exception module
from src.logger import logging ## custom logger module
import pandas as pd ## to handle dataframes

from sklearn.model_selection import train_test_split ## to split data into train and test
from dataclasses import dataclass ## to create data classes for storing configurations

from src.components.data_transformation import DataTransformation
from src.components.data_transformation import DataTransformationConfig

@dataclass ## Data class to store data ingestion configurations (Decorator to simplify class creation)
class DataIngestionConfig: ## Configuration class for data ingestion paths
    train_data_path: str = os.path.join('artifacts','train.csv') ## Path to save training data
    test_data_path: str = os.path.join('artifacts','test.csv') ## Path to save testing data
    raw_data_path: str = os.path.join('artifacts','data.csv') ## Path to save raw data

class DataIngestion: ## Main class for data ingestion process
    def __init__(self):  ## Constructor to initialize data ingestion configuration
        self.ingestion_config = DataIngestionConfig() 
    
    def initiate_data_ingestion(self): ## Method to initiate data ingestion process
        logging.info("Entered the data ingestion method or component") ## Log entry point of data ingestion
        try: ## Try block to handle exceptions
            df = pd.read_csv('notebook/data/stud.csv') ## Read dataset from CSV file
            ## Only this line will change to read different datasets. Other lines will remain the same.
            logging.info("Read the dataset as dataframe")
            
            os.makedirs(os.path.dirname(self.ingestion_config.train_data_path),exist_ok=True) ## Create directory for saving data if it doesn't exist
            
            df.to_csv(self.ingestion_config.raw_data_path,index=False,header=True) ## Save raw data to specified path
            logging.info("Train test split initiated")
            
            train_set,test_set = train_test_split(df,test_size=0.2,random_state=42) ## Split data into training and testing sets
            
            train_set.to_csv(self.ingestion_config.train_data_path,index=False,header=True) ## Save training data to specified path
            
            test_set.to_csv(self.ingestion_config.test_data_path,index=False,header=True) ## Save testing data to specified path
            logging.info("Ingestion of the data is completed")
            
            ## Return the paths of the training and testing data (Useful for further processing)
            return(
                self.ingestion_config.train_data_path,
                self.ingestion_config.test_data_path
                
            )
        except Exception as e: ## Exception handling block
            raise CustomException(e,sys)
    
if __name__ == "__main__": ## Main execution block
    obj = DataIngestion() ## Create an instance of DataIngestion class 
    train_data, test_data = obj.initiate_data_ingestion() ## Call the data ingestion method
    
    data_transformation = DataTransformation()
    data_transformation.initiate_data_transformation(train_data,test_data)