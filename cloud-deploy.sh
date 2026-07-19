#!/bin/bash

################################################################################
# 🚀 ONE-CLICK DEPLOYMENT TO CLOUD
# AWS, Azure, DigitalOcean, GCP support with automatic CI/CD setup
################################################################################

set -e

show_menu() {
  clear
  echo ""
  echo "╔═══════════════════════════════════════════════════╗"
  echo "║  🚀 CLOUD DEPLOYMENT WIZARD                       ║"
  echo "║     One-click deployment to all major clouds      ║"
  echo "╚═══════════════════════════════════════════════════╝"
  echo ""
  echo "Select your cloud provider:"
  echo "  1) AWS (Recommended for enterprises)"
  echo "  2) DigitalOcean (Fastest to deploy)"
  echo "  3) Azure (Best for enterprises)"
  echo "  4) Google Cloud (Best for scale)"
  echo "  5) Heroku (Easiest for beginners)"
  echo "  6) Self-hosted (VPS, dedicated server)"
  echo "  0) Exit"
  echo ""
  read -p "Enter choice (0-6): " choice

  case $choice in
    1) deploy_aws ;;
    2) deploy_digitalocean ;;
    3) deploy_azure ;;
    4) deploy_gcp ;;
    5) deploy_heroku ;;
    6) deploy_selfhosted ;;
    0) exit 0 ;;
    *) echo "Invalid choice"; sleep 2; show_menu ;;
  esac
}

deploy_aws() {
  echo ""
  echo "☁️  AWS DEPLOYMENT"
  echo ""
  echo "Prerequisites:"
  echo "  • AWS Account (https://aws.amazon.com)"
  echo "  • AWS CLI installed (https://aws.amazon.com/cli/)"
  echo "  • Configured credentials (aws configure)"
  echo ""
  read -p "Continue? (y/n): " confirm
  [ "$confirm" != "y" ] && show_menu && return

  echo ""
  echo "🔧 AWS Deployment Options:"
  echo "  1) ECS (Elastic Container Service)"
  echo "  2) EC2 with Docker"
  echo "  3) Lightsail (Simple & affordable)"
  echo "  4) EKS (Kubernetes - advanced)"
  read -p "Select (1-4): " aws_choice

  case $aws_choice in
    1)
      echo ""
      echo "📝 Creating AWS ECS deployment..."
      cat > aws-ecs-deploy.sh << 'EOF'
#!/bin/bash
# AWS ECS Deployment Script

CLUSTER_NAME="gobernador-cluster"
SERVICE_NAME="gobernador-service"
REGION="us-east-1"

echo "Creating ECS cluster..."
aws ecs create-cluster --cluster-name $CLUSTER_NAME --region $REGION

echo "Registering task definition..."
aws ecs register-task-definition \
  --family gobernador-task \
  --container-definitions file://ecs-task-definition.json \
  --region $REGION

echo "✅ ECS deployment ready!"
echo "Next: Create service with AWS Console or:"
echo "aws ecs create-service --cluster $CLUSTER_NAME --service-name $SERVICE_NAME --task-definition gobernador-task:1 --desired-count 1 --region $REGION"
EOF
      chmod +x aws-ecs-deploy.sh
      echo "✅ AWS ECS script created: aws-ecs-deploy.sh"
      echo "Run: ./aws-ecs-deploy.sh"
      ;;
    2)
      echo ""
      echo "📝 Creating AWS EC2 deployment..."
      cat > aws-ec2-deploy.sh << 'EOF'
#!/bin/bash
# AWS EC2 Deployment Script

INSTANCE_ID=$(aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.medium \
  --key-name gobernador-key \
  --security-groups web-server \
  --user-data file://userdata.sh \
  --query 'Instances[0].InstanceId' \
  --output text)

echo "✅ EC2 instance created: $INSTANCE_ID"
echo "Waiting for instance to start..."
aws ec2 wait instance-running --instance-ids $INSTANCE_ID

IP=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID \
  --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)

echo "Instance IP: $IP"
echo "SSH: ssh -i gobernador-key.pem ubuntu@$IP"
EOF
      chmod +x aws-ec2-deploy.sh
      echo "✅ AWS EC2 script created: aws-ec2-deploy.sh"
      ;;
  esac

  sleep 3
  show_menu
}

deploy_digitalocean() {
  echo ""
  echo "🌊 DIGITALOCEAN DEPLOYMENT"
  echo ""
  echo "Prerequisites:"
  echo "  • DigitalOcean Account (https://digitalocean.com)"
  echo "  • doctl CLI installed"
  echo "  • Configured token (doctl auth init)"
  echo ""
  read -p "Continue? (y/n): " confirm
  [ "$confirm" != "y" ] && show_menu && return

  echo ""
  echo "📝 Creating DigitalOcean App Platform deployment..."

  cat > app-spec.yaml << 'EOF'
name: gobernador-ia
services:
  - name: backend
    github:
      repo: your-org/gobernador
      branch: main
      deploy_on_push: true
    dockerfile_path: backend/Dockerfile
    http_port: 8080
    envs:
      - key: DATABASE_URL
        scope: RUN_AND_BUILD_TIME
        value: ${DB.DATABASE_URL}
  
  - name: frontend
    github:
      repo: your-org/gobernador
      branch: main
      deploy_on_push: true
    dockerfile_path: frontend/Dockerfile
    http_port: 8080

databases:
  - name: db
    engine: PG
    version: "15"
EOF

  echo "✅ App Platform spec created: app-spec.yaml"
  echo ""
  echo "Deploy with:"
  echo "  doctl apps create --spec app-spec.yaml"

  sleep 3
  show_menu
}

deploy_azure() {
  echo ""
  echo "☁️  AZURE DEPLOYMENT"
  echo ""
  echo "Prerequisites:"
  echo "  • Azure Account (https://azure.microsoft.com)"
  echo "  • Azure CLI installed"
  echo "  • Logged in (az login)"
  echo ""
  read -p "Continue? (y/n): " confirm
  [ "$confirm" != "y" ] && show_menu && return

  echo ""
  echo "📝 Creating Azure Container Instances deployment..."

  cat > azure-deploy.sh << 'EOF'
#!/bin/bash

RESOURCE_GROUP="gobernador-rg"
LOCATION="eastus"
REGISTRY_NAME="gobernadorregistry"

echo "Creating resource group..."
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION

echo "Creating container registry..."
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $REGISTRY_NAME \
  --sku Basic

echo "Building and pushing images..."
az acr build \
  --registry $REGISTRY_NAME \
  --image gobernador/backend:latest \
  ./backend

echo "Deploying to Container Instances..."
az container create \
  --resource-group $RESOURCE_GROUP \
  --name gobernador-backend \
  --image "$REGISTRY_NAME.azurecr.io/gobernador/backend:latest" \
  --cpu 1 --memory 1 \
  --ports 8080

echo "✅ Azure deployment complete!"
EOF

  chmod +x azure-deploy.sh
  echo "✅ Azure deployment script created: azure-deploy.sh"
  echo "Run: ./azure-deploy.sh"

  sleep 3
  show_menu
}

deploy_gcp() {
  echo ""
  echo "🔵 GOOGLE CLOUD DEPLOYMENT"
  echo ""
  echo "Prerequisites:"
  echo "  • Google Cloud Account (https://console.cloud.google.com)"
  echo "  • gcloud CLI installed"
  echo "  • Authenticated (gcloud auth login)"
  echo ""
  read -p "Continue? (y/n): " confirm
  [ "$confirm" != "y" ] && show_menu && return

  echo ""
  echo "📝 Creating Google Cloud Run deployment..."

  cat > gcp-deploy.sh << 'EOF'
#!/bin/bash

PROJECT_ID=$(gcloud config get-value project)
REGION="us-central1"

echo "Building backend..."
gcloud builds submit ./backend \
  --tag gcr.io/$PROJECT_ID/gobernador-backend

echo "Deploying backend to Cloud Run..."
gcloud run deploy gobernador-backend \
  --image gcr.io/$PROJECT_ID/gobernador-backend \
  --platform managed \
  --region $REGION \
  --memory 512Mi \
  --allow-unauthenticated

echo "✅ GCP deployment complete!"
EOF

  chmod +x gcp-deploy.sh
  echo "✅ GCP deployment script created: gcp-deploy.sh"
  echo "Run: ./gcp-deploy.sh"

  sleep 3
  show_menu
}

deploy_heroku() {
  echo ""
  echo "🟣 HEROKU DEPLOYMENT"
  echo ""
  echo "Prerequisites:"
  echo "  • Heroku Account (https://heroku.com)"
  echo "  • Heroku CLI installed"
  echo "  • Logged in (heroku login)"
  echo ""
  read -p "Continue? (y/n): " confirm
  [ "$confirm" != "y" ] && show_menu && return

  echo ""
  echo "📝 Creating Heroku deployment..."

  cat > Procfile << 'EOF'
web: ./target/release/gobernador-ia
EOF

  cat > Procfile.postgres << 'EOF'
web: cd backend && cargo run --release
EOF

  cat > heroku-deploy.sh << 'EOF'
#!/bin/bash

APP_NAME="gobernador-ia"

echo "Creating Heroku app..."
heroku create $APP_NAME

echo "Adding PostgreSQL addon..."
heroku addons:create heroku-postgresql:hobby-dev -a $APP_NAME

echo "Deploying..."
git push heroku main

echo "✅ Heroku deployment complete!"
echo "App: https://$APP_NAME.herokuapp.com"
EOF

  chmod +x heroku-deploy.sh
  echo "✅ Heroku deployment script created: heroku-deploy.sh"
  echo "Run: ./heroku-deploy.sh"

  sleep 3
  show_menu
}

deploy_selfhosted() {
  echo ""
  echo "🖥️  SELF-HOSTED DEPLOYMENT"
  echo ""
  echo "Prerequisites:"
  echo "  • Linux VPS or dedicated server"
  echo "  • SSH access"
  echo "  • Docker & Docker Compose installed"
  echo ""
  read -p "Enter server IP/domain: " SERVER_HOST
  read -p "Enter SSH username: " SSH_USER

  echo ""
  echo "📝 Creating self-hosted deployment script..."

  cat > deploy-selfhosted.sh << EOF
#!/bin/bash

SERVER="$SSH_USER@$SERVER_HOST"

echo "Connecting to $SERVER..."

ssh \$SERVER << 'DEPLOY'
cd /opt/gobernador
git pull origin main
docker compose -f docker-compose-mcp.yml down
docker compose -f docker-compose-mcp.yml pull
docker compose -f docker-compose-mcp.yml up -d

echo "✅ Self-hosted deployment complete!"
DEPLOY
EOF

  chmod +x deploy-selfhosted.sh
  echo "✅ Self-hosted deployment script created: deploy-selfhosted.sh"
  echo "Run: ./deploy-selfhosted.sh"

  sleep 3
  show_menu
}

show_menu
