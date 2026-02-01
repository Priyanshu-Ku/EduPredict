import os ## to handle file paths
import sys  ## to handle exceptions
from dataclasses import dataclass  ## to create data classes for storing configurations

from catboost import CatBoostRegressor ## CatBoost regression model
from sklearn.ensemble import ( ## Ensemble models for regression
    AdaBoostRegressor,
    GradientBoostingRegressor,
    RandomForestRegressor,
)
from sklearn.linear_model import LinearRegression ## Linear regression model
from sklearn.metrics import r2_score ## To evaluate Regression models
from sklearn.neighbors import KNeighborsRegressor ## K-Nearest Neighbors regression model
from sklearn.tree import DecisionTreeRegressor ## Decision Tree regression model
from xgboost import XGBRegressor ## XGBoost regression model

from src.exception import CustomException ## custom exception module
from src.logger import logging ## custom logger module
from src.utils import save_object, evaluate_models ## utility functions to save objects and evaluate models

@dataclass
class ModelTrainerConfig: ## Configuration class for model trainer
    trained_model_file_path: str = os.path.join("artifacts","model.pkl")
    
class ModelTrainer: ## Main class for model training process
    def __init__(self): ## Constructor to initialize model trainer configuration
        self.model_trainer_config = ModelTrainerConfig()
        
        
    def initiate_model_trainer(self,train_array,test_array): ## Method to initiate model training process
        try:
            logging.info("Split training and test input data")
            ## Splitting the training and testing arrays into input features and target variable
            X_train,y_train,X_test,y_test = ( 
                train_array[:,:-1],
                train_array[:,-1],
                test_array[:,:-1],
                test_array[:,-1]
            )
            ## Define the models to be evaluated inside a dictionary
            models = {
                "Random Forest": RandomForestRegressor(),
                "Decision Tree": DecisionTreeRegressor(),
                "Gradient Boosting": GradientBoostingRegressor(),
                "Linear Regression": LinearRegression(),
                "K-Neighbours Regressor": KNeighborsRegressor(),
                "XGB Regressor": XGBRegressor(),
                "CatBoost Regressor": CatBoostRegressor(verbose=False),
                "AdaBoost Regressor": AdaBoostRegressor(),
            }
            ## Evaluate the models and get the report using the utility function evaluate_models
            model_report: dict = evaluate_models(X_train=X_train,y_train=y_train,X_test=X_test,y_test=y_test,
                                                models=models)
            
            ## To get the best model score from the dictionary
            best_model_score = max(sorted(model_report.values()))
            
            ## To get the best model name from the dictionary
            best_model_name = list(model_report.keys())[
                list(model_report.values()).index(best_model_score)
            ]
            best_model = models[best_model_name] 
            ## Check if the best model score is less than 0.6, if yes then raise an exception
            if best_model_score < 0.6:
                raise CustomException("No best model found")
            logging.info(f"Best model found on both training and testing dataset: {best_model_name} with score {best_model_score}")
            ## Save the best model using the utility function save_object
            save_object(
                file_path = self.model_trainer_config.trained_model_file_path,
                obj = best_model
            )
            ## Make predictions on the test set using the best model
            predicted = best_model.predict(X_test)
            ## Calculate the r2 score for the predictions
            r2_square = r2_score(y_test,predicted)
            return r2_square
            
        except Exception as e:
            raise CustomException(e,sys)