pipeline {
  agent any

  environment {
    IMAGE_NAME = "node-app:${BUILD_NUMBER}"  // Local image tag
    ENV_SOURCE = '/var/lib/jenkins/api/.env.dev'
    COMPOSE_HTTP_TIMEOUT = '300'  // Increase timeout for Docker Compose operations
    SONAR_SCANNER = 'SonarScanner' // Name of your SonarScanner tool in Jenkins
  }

  stages {
    stage('Checkout') {
      steps {
        git credentialsId: 'outsource-key', branch: 'main', url: 'https://github.com/KalabAmssalu/outsourcing_backend.git'
      }
    }

    stage('Prepare .env') {
      steps {
        sh 'cp $ENV_SOURCE .env'
      }
    }

    stage('Build Docker Image') {
      steps {
        script {
          docker.build(env.IMAGE_NAME)
        }
      }
    }

    stage('Prepare Database') {
      steps {
        sh '''
          # Stop any running containers
          docker-compose down -v || true
          
          # Start just the database first
          docker-compose up -d postgres_db
          
          # Wait for database to be ready
          echo "Waiting for database to be ready..."
          for i in {1..30}; do
            if docker-compose exec -T postgres_db pg_isready -U postgres; then
              echo "Database is ready!"
              break
            fi
            echo "Waiting for database... (attempt $i/30)"
            sleep 5
          done
          
          # Run database migrations
          echo "Running database migrations..."
          docker-compose run --rm node-app sh -c "\
            npx prisma migrate reset --force --skip-seed && \
            npx prisma generate --schema=./prisma/schema && \
            npx prisma migrate deploy --schema=./prisma/schema && \
            npx prisma db seed --schema=./prisma/schema
          " || {
            echo "❌ Database migration failed"
            docker-compose logs node-app
            exit 1
          }
        '''
      }
    }

    stage('Deploy with Docker Compose') {
      steps {
        sh '''
          # Start all services
          docker-compose up -d --build
          
          # Wait for services to initialize
          echo "🚀 Services started, waiting for initialization..."
          sleep 15
        '''
      }
    }
    stage('SonarQube Analysis') {
        steps {
            script {
                def scannerHome = tool env.SONAR_SCANNER
                withSonarQubeEnv() {
                    sh "${scannerHome}/bin/sonar-scanner"
                }
            }
        }
    }
  }

  post {
    success {
      echo "✅ Deployment succeeded"
    }
    failure {
      echo "❌ Deployment failed"
    }
    always {
      sh 'docker image prune -f'
    }
  }
}
