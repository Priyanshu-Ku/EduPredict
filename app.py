from flask import Flask,request,render_template ## importing necessary modules from Flask 
import numpy as np ## to handle numerical operations
import pandas as pd ## to convert data into dataframe
import sys ## to handle exceptions

from sklearn.preprocessing import StandardScaler ## to standardize the data
from src.pipeline.predict_pipeline import CustomData, PredictPipeline ## importing custom classes for prediction pipeline

from src.exception import CustomException ## importing custom exception class
from src.logger import logging ## importing logging module for logging errors

application = Flask(__name__) ## creating a Flask application instance
app = application ## alias for the application instance

## Route for home page
@app.route('/') 
def index():
    return render_template('index.html') ## rendering the index.html template

## Route for prediction page
@app.route('/predictdata',methods=['GET','POST']) ## defining route and allowed methods
def predict_datapoint():
    try: 
        if request.method == 'GET': ## if the request method is GET
            return render_template('home.html') ## render the home.html template
        
        else: ## if the request method is POST
            ## creating an instance of CustomData class with form data and converting it to a dataframe
            data = CustomData(
                ## Getting form data and assigning to respective fields from home.html to CustomData class
                gender=request.form.get('gender'), 
                race_ethnicity=request.form.get('ethnicity'),
                parental_level_of_education=request.form.get('parental_level_of_education'),
                lunch=request.form.get('lunch'),
                test_preparation_course=request.form.get('test_preparation_course'),
                reading_score=float(request.form.get('reading_score')), ## converting reading score to float
                writing_score=float(request.form.get('writing_score')) ## converting writing score to float
                
            )
            pred_df = data.get_data_as_data_frame() ## converting the data to a dataframe
            print(pred_df)
            
            predict_pipeline = PredictPipeline() ## creating an instance of PredictPipeline class
            results = predict_pipeline.predict(pred_df) ## getting predictions by passing the dataframe to predict method
            return render_template('home.html',results=results[0]) ## rendering home.html with prediction results 
        
    except Exception as e:
        logging.error(e)
        raise CustomException(e, sys)
    
## Running the Flask application on host 127.0.0.1:5000 in debug mode
if __name__ == "__main__":
    app.run(host="0.0.0.0",port=5000,debug=True)