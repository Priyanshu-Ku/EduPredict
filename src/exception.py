import sys ## to get the exception details

def error_message_detail(error,error_detail:sys): ## Function to get the error details
    _,_,exc_tb = error_detail.exc_info() ## getting the exception details
    file_name = exc_tb.tb_frame.f_code.co_filename ## getting the file name where the exception occurred
    line_number = exc_tb.tb_lineno ## getting the line number where the exception occurred
    error_message ="Error occurred in python script name [{0}] line number [{1}] error message [{2}]".format(
        file_name,line_number,str(error)
    ) ## formatting the error message
    
    return error_message

class CustomException(Exception): ## Custom Exception class that inherits from the base Exception class
    def __init__(self,error_message,error_detail:sys): ## constructor to initialize the exception class
        super().__init__(error_message)
        self.error_message = error_message_detail(error_message,error_detail=error_detail) ## getting the error message details
        
    def __str__(self): ## string representation of the exception
        return self.error_message
    
