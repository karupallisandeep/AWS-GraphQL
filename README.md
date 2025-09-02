# Business Directory - AWS Amplify + Lambda + GraphQL + PostgreSQL

A complete serverless business directory application built with modern AWS services.

## Architecture

```
Frontend (Next.js) → AWS Amplify → AWS Lambda (GraphQL API) → AWS Aurora PostgreSQL
                                        ↓
                                   Prisma ORM
                                        ↓
                                   AWS Cognito (Auth)
                                        ↓
                                   AWS S3 (Images)
```

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Apollo Client
- **Backend**: AWS Lambda, GraphQL, Apollo Server
- **Database**: AWS Aurora PostgreSQL Serverless v2
- **ORM**: Prisma
- **Authentication**: AWS Cognito
- **File Storage**: AWS S3
- **Deployment**: AWS Amplify (Frontend), Serverless Framework (Backend)

## Quick Start

### Prerequisites

- Node.js 18+
- AWS CLI configured
- PostgreSQL database (local or AWS Aurora)

### Backend Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Set up database**:
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev --name init
   ```

4. **Deploy to AWS**:
   ```bash
   # Development
   npm run deploy
   
   # Production
   npm run deploy:prod
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your actual values
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. **Deploy to AWS Amplify**:
   - Connect your repository to AWS Amplify
   - Set environment variables in Amplify Console
   - Deploy automatically on push

## Environment Variables

### Backend (.env)
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/business_directory"
REGION="us-east-1"
S3_BUCKET_NAME="business-directory-images"
COGNITO_USER_POOL_ID="us-east-1_xxxxxxxxx"
COGNITO_CLIENT_ID="xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
JWT_SECRET="your-jwt-secret-key"
SES_FROM_EMAIL="noreply@yourdomain.com"
FRONTEND_URL="https://main.dhgo89t11a656.amplifyapp.com"
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://your-api-id.execute-api.us-east-1.amazonaws.com/dev/graphql
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Database Schema

The application uses the following main entities:

- **Users**: Cognito-synced user profiles
- **Businesses**: Business listings with full details
- **BusinessImages**: S3-stored business images

## API Endpoints

### GraphQL Endpoint
- **Development**: `https://your-api-id.execute-api.us-east-1.amazonaws.com/dev/graphql`
- **Production**: `https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/graphql`

### Key Queries
- `businesses`: List businesses with filtering
- `business(id)`: Get single business
- `me`: Get current user profile

### Key Mutations
- `createBusiness`: Create new business
- `updateBusiness`: Update business details
- `generateUploadUrl`: Get S3 presigned URL
- `addBusinessImage`: Add image to business

## Deployment

### Backend Deployment (Serverless Framework)

```bash
# Install Serverless CLI
npm install -g serverless

# Deploy to development
serverless deploy --stage dev

# Deploy to production
serverless deploy --stage prod
```

### Frontend Deployment (AWS Amplify)

1. **Connect Repository**:
   - Go to AWS Amplify Console
   - Connect your GitHub/GitLab repository
   - Select the `frontend` folder as the app root

2. **Build Settings**:
   ```yaml
   version: 1
   applications:
     - appRoot: frontend
       frontend:
         phases:
           preBuild:
             commands:
               - npm ci
           build:
             commands:
               - npm run build
         artifacts:
           baseDirectory: .next
           files:
             - '**/*'
         cache:
           paths:
             - node_modules/**/*
   ```

3. **Environment Variables**:
   Set in Amplify Console > App Settings > Environment Variables

## Testing

### Backend Testing
```bash
# Test GraphQL health
curl -X POST \
  https://your-api-id.execute-api.us-east-1.amazonaws.com/dev/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"query { health }"}'

# Test database connection
curl -X POST \
  https://your-api-id.execute-api.us-east-1.amazonaws.com/dev/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"query { healthDb }"}'
```

### Frontend Testing
```bash
cd frontend
npm run dev
# Visit http://localhost:3000
```

## Common Issues & Solutions

### 1. CORS Issues
- Ensure CORS settings match between `serverless.yml` and Apollo Server
- Use consistent origin and credentials settings

### 2. Bundle Size Issues
- Prisma client is externalized in esbuild configuration
- Use `serverless-esbuild` plugin for optimization

### 3. Environment Variables
- Use bracket notation: `process.env['VARIABLE_NAME']`
- Provide default values for all environment variables

### 4. Database Connection
- Use connection pooling for production
- Implement proper timeout settings

## Monitoring

- **CloudWatch Logs**: Monitor Lambda function logs
- **GraphQL Playground**: Test queries in development
- **Prisma Studio**: Database GUI for development

## Security

- JWT tokens are validated against Cognito
- Role-based access control implemented
- S3 presigned URLs for secure file uploads
- Environment variables for sensitive data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details