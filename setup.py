from setuptools import find_packages, setup ## importing find_packages and setup from setuptools
from typing import List ## importing List from typing module 

HYPEN_E_DOT='-e .' ## constant to represent editable installation(setup.py)

def get_requirements(file_path:str)-> List[str]: ## function to read requirements from a file
    '''
    this function will return the list of requirements
    '''
    requirements=[] ## initializing an empty list to store requirements
    with open(file_path) as file_obj: ## opening the file in read mode
        requirements=file_obj.readlines() ## reading all lines from the file and storing them in the list
        requirements=[req.replace("\n","") for req in requirements] ## removing newline characters from each requirement
        if HYPEN_E_DOT in requirements: 
            requirements.remove(HYPEN_E_DOT) ## removing editable installation entry if present from the list
    
    return requirements

## calling setup function to define the package metadata and dependencies
setup(
    name="ml_project",
    version="0.1.0",
    author="Priyanshu-ku",
    author_email="priyanshu.kumar7500@gmail.com",
    packages=find_packages(), ## automatically find packages in the project directory
    ## install_requires=['pandas','numpy','scikit-learn','seaborn','matplotlib'] ## list of dependencies required for the project
    install_requires=get_requirements('requirements.txt') ## reading dependencies from requirements.txt file
)