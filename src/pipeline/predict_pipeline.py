import sys ## to handle exceptions
import pandas as pd  ## to handle dataframes
from src.exception import CustomException ## custom exception module
from src.utils import load_object ## utility function to load serialized objects

class PredictPipeline: ## class for prediction pipeline
    def __init__(self): ## Skip initialization
        pass
    
    def predict(self,features): ## method to make predictions on input features
        try:
            model_path ='artifacts/model.pkl' ## path to the trained model
            preprocessor_path = 'artifacts/preprocessor.pkl' ## path to the preprocessor
            model = load_object(file_path=model_path) ## loading the trained model
            preprocessor = load_object(file_path=preprocessor_path) ## loading the preprocessor
            data_scaled = preprocessor.transform(features) ## transforming the input features using the preprocessor
            preds = model.predict(data_scaled) ## making predictions using the trained model
            
            return preds ## returning the predictions
        
        except Exception as e:
            raise CustomException(e,sys) 
    
class CustomData: ## class to handle custom input data
    def __init__(self,
        gender: str,
        race_ethnicity: str,
        parental_level_of_education: str,
        lunch: str,
        test_preparation_course: str,
        reading_score: int,
        writing_score: int):
        ## initializing the input data attributes 
        self.gender = gender
        self.race_ethnicity = race_ethnicity
        self.parental_level_of_education = parental_level_of_education
        self.lunch = lunch
        self.test_preparation_course = test_preparation_course
        self.reading_score = reading_score
        self.writing_score = writing_score
    
    def get_data_as_data_frame(self): ## method to convert input data to a pandas dataframe
        try:
            ## creating a dictionary with input data and converting it to a dataframe
            custom_data_input_dict = {
                "gender": [self.gender],
                "race_ethnicity": [self.race_ethnicity],
                "parental_level_of_education": [self.parental_level_of_education],
                "lunch": [self.lunch],
                "test_preparation_course": [self.test_preparation_course],
                "reading_score": [self.reading_score],
                "writing_score": [self.writing_score]
            }
            
            return pd.DataFrame(custom_data_input_dict) ## returning the dataframe
        
        except Exception as e:
            raise CustomException(e, sys)