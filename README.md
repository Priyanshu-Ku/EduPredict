## End to End Machine Learning Project

This repository contains an end-to-end machine learning project that demonstrates the entire workflow of a machine learning project, from data collection and preprocessing to model training and deployment. The project is designed to provide a comprehensive overview of the machine learning process and can be used as a reference for beginners and experienced practitioners alike.

### Project Structure

The project is organized into the following directories:

- `data/`: Contains the raw and processed datasets used in the project.
- `notebooks/`: Contains Jupyter notebooks that document the exploratory data analysis, feature engineering, and model training processes.
- `src/`: Contains the source code for data preprocessing, model training, and evaluation.
- `models/`: Contains the trained machine learning models and their associated files.
- `github/`: Contains GitHub workflow files for CI/CD.
- `templates/`: Contains HTML templates for model deployment.

### 🚀 Installation

#### Prerequisites

##### Python 3.8 or higher

pip package manager
Administrator/Root privileges (for packet capture)

#### Step 1: Clone the Repository

```bash
git clone https://github.com/Priyanshu-Ku/mlproject.git
```

#### Step 2: Create Virtual Environment

##### Windows (PowerShell):

```bash
python -m venv venv
.\venv\Scripts\Activate.ps1
```

##### Linux/Mac:

```bash
python3 -m venv venv
source venv/bin/activate
```

#### Step 3: Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

#### Step 4: Run the Project

##### Run the main script

```bash
python src/app.py
```

##### OR

# Student Performance Prediction – Docker Deployment

This repository provides a Dockerized version of the **Student Performance Prediction** machine learning application.  
No local Python setup is required — Docker handles everything.

---

## Prerequisites

Before running the container, ensure you have:

- **Docker** installed
  - Windows / macOS: Docker Desktop
  - Linux: Docker Engine

Verify installation:

```bash
docker --version
```

#### Docker Image

The application is available as a prebuilt Docker image on Docker Hub.

```bash
docker pull priyanshukr7500/studentperformance-app:latest
```

#### Pull the Docker Image

Download the image from Docker Hub:

```bash
docker pull priyanshukr7500/studentperformance-app:latest
```

Confirm the image is available locally:

```bash
docker images
```

#### Run the Container

Start the application using:

```bash
docker run -p 5000:5000 priyanshukr7500/studentperformance-app:latest
```

-p 5000:5000 maps the container port to your local machine

The app will be accessible at:

```bash
http://localhost:5000
http://localhost:5000/predictdata
```

#### Run in Detached Mode (Background)

To run the container in the background:

```bash
docker run -d -p 5000:5000 --name studentperformance-app \
priyanshukr7500/studentperformance-app:latest
```

#### Stop the Running Container

List running containers:

```bash
docker ps
```

Stop the container:

```bash
docker stop studentperformance-app
```

#### Remove the Container (Optional)

```bash
docker rm studentperformance-app
```

#### Notes

The Docker image already includes all dependencies and the trained model.

No environment variables or configuration files are required.

Rebuilding the image is not necessary unless modifying the source code.

### Troubleshooting

**Port already in use?**
Use a different port:

```bash
docker run -p 8000:5000 priyanshukr7500/studentperformance-app:latest
```

Then access:

```bash
http://localhost:8000
```

**Docker not starting?**
Ensure Docker Desktop is running (Windows/macOS) or Docker Engine is active (Linux).

### Conclusion

This Dockerized version of the Student Performance Prediction app allows you to run the application without any local setup. Simply pull the image and run the container to access the app in your browser.

## Deployment on AWS EC2

1. Docker Build checked
2. Github Workflow
3. Iam User In AWS

## Docker Setup In EC2 commands to be Executed

#optinal

sudo apt-get update -y

sudo apt-get upgrade

#required

curl -fsSL https://get.docker.com -o get-docker.sh

sudo sh get-docker.sh

sudo usermod -aG docker ubuntu

newgrp docker

## Configure EC2 as self-hosted runner:

## Setup github secrets:

AWS_ACCESS_KEY_ID=

AWS_SECRET_ACCESS_KEY=

AWS_REGION = us-east-1

AWS_ECR_LOGIN_URI = demo>> 566373416292.dkr.ecr.ap-south-1.amazonaws.com

ECR_REPOSITORY_NAME = simple-app

## Run from terminal:(Azure Deployment)

docker build -t testdockerkrish.azurecr.io/mltest:latest .

docker login testdockerkrish.azurecr.io

docker push testdockerkrish.azurecr.io/mltest:latest
