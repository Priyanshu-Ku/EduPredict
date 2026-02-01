import os ## to handle file paths
import sys ## to handle exceptions

import numpy as np ## to handle numerical operations
import pandas as pd  ## to handle dataframes
import dill  ## to serialize and deserialize Python objects like Pickle

from sklearn.metrics import r2_score ## To evaluate Regression models

from sklearn.model_selection import GridSearchCV ## To perform hyperparameter tuning

from src.exception import CustomException ## custom exception module

def save_object(file_path,obj): ## function to save an object to a file using dill serialization
    try: 
        dir_path = os.path.dirname(file_path) ## get the directory path from the file path
        
        os.makedirs(dir_path,exist_ok=True) ## create the directory if it doesn't exist
        
        with open(file_path,"wb") as file_obj: ## open the file in write-binary mode
            dill.dump(obj,file_obj) ## serialize and save the object to the file
    
    except Exception as e:
        raise CustomException(e,sys)
    
def evaluate_models(X_train,y_train,X_test,y_test,models,param): ## function to evaluate multiple machine learning models
    try:
        report = {} ## dictionary to store model names and their corresponding R2 scores
        
        for i in range(len(models)): ## iterate over the models
            model = list(models.values())[i] ## get the model instance
            para = param[list(models.keys())[i]]
            
            gs = GridSearchCV(model,para,cv=3) ## create a GridSearchCV object for hyperparameter tuning
            gs.fit(X_train,y_train) ## fit the GridSearchCV to find the best parameters
            
            model.set_params(**gs.best_params_) ## set the model parameters to the best found parameters
            model.fit(X_train,y_train) ## train the model
            
            y_train_pred = model.predict(X_train) ## make predictions on training data
            y_test_pred = model.predict(X_test) ## make predictions on testing data
            
            train_model_score = r2_score(y_train,y_train_pred) ## calculate R2 score for training data
            test_model_score = r2_score(y_test,y_test_pred) ## calculate R2 score for testing data
            
            report[list(models.keys())[i]] = test_model_score ## store the test R2 score in the report dictionary
            
        return report ## return the report dictionary
            
    except Exception as e:
        raise CustomException(e,sys)