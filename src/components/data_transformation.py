import os ## to handle file paths
import sys ## to handle exceptions

from dataclasses import dataclass ## to create data classes for storing configurations
import numpy as np ## to handle numerical operations
import pandas as pd ## to handle dataframes
from sklearn.compose import ColumnTransformer ## to apply different transformations to different columns
from sklearn.impute import SimpleImputer ## to handle missing values
from sklearn.pipeline import Pipeline ## to create machine learning pipelines for data transformation
from sklearn.preprocessing import OneHotEncoder, StandardScaler ## to encode categorical variables and scale numerical variables

from src.exception import CustomException ## custom exception module
from src.logger import logging  ## custom logger module

from src.utils import save_object ## utility function to save objects using serialization

@dataclass
class DataTransformationConfig: ## Configuration class for data transformation
    preprocessor_obj_file_path: str = os.path.join('artifacts','preprocessor.pkl')

class DataTransformation: ## Main class for data transformation process
    def __init__(self): ## Constructor to initialize data transformation configuration
        self.data_transformation_config = DataTransformationConfig() 
    
    def get_data_transformer_object(self): ## Method to get the data transformer object
        '''
        This function is responsible for data transformation
        
        '''
        try: 
            ## Define which columns are numerical and which are categorical
            numerical_columns = ["writing_score","reading_score"]
            categorical_columns = [
                "gender",
                "race_ethnicity",
                "parental_level_of_education",
                "lunch",
                "test_preparation_course"
            ]
            ## Create a pipeline for numerical columns
            num_pipeline = Pipeline(
                steps=[
                    ("imputer", SimpleImputer(strategy="median")), ## Handle missing values by replacing them with the median
                    ("scaler", StandardScaler()) ## Scale the numerical features
                ]
            )
            ## Create a pipeline for categorical columns
            cat_pipeline = Pipeline(
                
                steps=[
                    ("imputer",SimpleImputer(strategy="most_frequent")), ## Handle missing values by replacing them with the most frequent value
                    ("one_hot_encoder",OneHotEncoder()), ## Convert categorical variables into a format that can be provided to ML algorithms
                    ("scaler",StandardScaler(with_mean=False)) ## Scale the categorical features
                ]
                
            )
            
            logging.info(f"Categorical columns: {categorical_columns}")
            logging.info(f"Numerical columns: {numerical_columns}")
            
            ## Combine both pipelines into a single ColumnTransformer for applying the transformations
            preprocessor = ColumnTransformer(
                [
                    ("num_pipeline",num_pipeline,numerical_columns), ## Apply numerical pipeline to numerical columns -> (name, transformer, columns)
                    ("cat_pipeline",cat_pipeline,categorical_columns) ## Apply categorical pipeline to categorical columns -> (name, transformer, columns)
                    
                ]
                
                
            )
            
            return preprocessor ## Return the preprocessor object
        
        except Exception as e:
            raise CustomException(e,sys)
        
    def initiate_data_transformation(self,train_path,test_path): ## Method to initiate data transformation process
        
        try:
            ## Read the training and testing data from the provided file paths
            train_df = pd.read_csv(train_path)
            test_df = pd.read_csv(test_path)
            
            logging.info("Read train and test data completed")
            
            logging.info("Obtaining preprocessor object")
            
            preprocessor_obj = self.get_data_transformer_object() ## Get the preprocessor object
            
            target_column_name="math_score" ## Define the target column name
            numerical_columns = ["writing_score","reading_score"] ## Define numerical columns
            
            ## Separate input features and target feature from training and testing data
            input_feature_train_df = train_df.drop(columns=[target_column_name],axis=1) 
            target_feature_train_df = train_df[target_column_name]
            
            input_feature_test_df = test_df.drop(columns=[target_column_name],axis=1)
            target_feature_test_df = test_df[target_column_name]
            
            logging.info(f"Applying preprocessing object on training dataframe and testing dataframe.")
            
            ## Apply the preprocessor object to transform the input features 
            input_feature_train_arr = preprocessor_obj.fit_transform(input_feature_train_df)
            input_feature_test_arr = preprocessor_obj.transform(input_feature_test_df)
            
            ## Combine the transformed input features with the target feature to create the final training and testing arrays
            train_arr = np.c_[input_feature_train_arr, np.array(target_feature_train_df)] 
            test_arr = np.c_[input_feature_test_arr, np.array(target_feature_test_df)]
            
            logging.info("Saved preprocessing object.")
            
            ## Save the preprocessor object to a file for future use
            save_object(
                
                file_path=self.data_transformation_config.preprocessor_obj_file_path,
                obj = preprocessor_obj
                
            )
            ## Return the training array, testing array, and the file path of the preprocessor object
            return (
                train_arr,
                test_arr,
                self.data_transformation_config.preprocessor_obj_file_path
            )
        except Exception as e:
            raise CustomException(e,sys)