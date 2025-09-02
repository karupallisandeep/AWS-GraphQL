# Deployment Guide

## Prerequisites

1. **AWS CLI** configured with appropriate permissions
2. **Node.js 18+** installed
3. **Serverless Framework** installed globally: `npm install -g serverless`
4. **PostgreSQL database** (AWS Aurora recommended)

## Step-by-Step Deployment

### 1. Backend Deployment

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your actual values

# 3. Generate Prisma client
npx prisma generate

# 4. Run database migrations (if database exists)
npx prisma migrate deploy

# 5. Deploy to AWS
npm run deploy

# For production
npm run deploy:prod
```

### 2. Database Setup (AWS Aurora PostgreSQL)

```bash
# Create Aurora PostgreSQL Serverless v2 cluster in AWS Console
# Update DATABASE_URL in .env with the connection string

# Run migrations
npx prisma migrate deploy

# Verify connection
npx prisma studio
```

### 3. AWS Services Setup

#### S3 Bucket
```bash
# Create S3 bucket for images
aws s3 mb s3://business-directory-images --region us-east-1

# Set CORS policy
aws s3api put-bucket-cors --bucket business-directory-images --cors-configuration file://s3-cors.json
```

#### Cognito User Pool
```bash
# Create Cognito User Pool in AWS Console
# Note down User Pool ID and Client ID
# Update environment variables
```

### 4. Frontend Deployment (AWS Amplify)

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.local.example .env.local
# Edit with your GraphQL endpoint and Cognito details

# 4. Test locally
npm run dev

# 5. Deploy to Amplify
# - Connect repository to AWS Amplify
# - Set build settings (use amplify.yml)
# - Set environment variables in Amplify Console
# - Deploy
```

### 5. Environment Variables Setup

#### Backend (.env)
```bash
DATABASE_URL="postgresql://username:password@aurora-cluster.cluster-xyz.us-east-1.rds.amazonaws.com:5432/business_directory"
REGION="us-east-1"
S3_BUCKET_NAME="business-directory-images"
COGNITO_USER_POOL_ID="us-east-1_xxxxxxxxx"
COGNITO_CLIENT_ID="xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
JWT_SECRET="your-secure-jwt-secret"
SES_FROM_EMAIL="noreply@yourdomain.com"
FRONTEND_URL="https://main.dhgo89t11a656.amplifyapp.com"
```

#### Frontend (Amplify Console)
```bash
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://abc123.execute-api.us-east-1.amazonaws.com/dev/graphql
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Verification Steps

### 1. Test Backend
```bash
# Health check
curl -X POST \
  https://your-api-id.execute-api.us-east-1.amazonaws.com/dev/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"query { health }"}'

# Database health check
curl -X POST \
  https://your-api-id.execute-api.us-east-1.amazonaws.com/dev/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"query { healthDb }"}'
```

### 2. Test Frontend
- Visit your Amplify URL
- Check that the page loads without errors
- Verify GraphQL connection works

### 3. Test Authentication
- Sign up for a new account
- Verify email confirmation works
- Test login/logout functionality

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check serverless.yml CORS settings
   - Verify Apollo Server CORS configuration
   - Ensure frontend URL is whitelisted

2. **Database Connection Issues**
   - Verify DATABASE_URL format
   - Check Aurora security groups
   - Ensure Lambda has VPC access (if Aurora is in VPC)

3. **Bundle Size Too Large**
   - Prisma client should be externalized
   - Check esbuild configuration in serverless.yml

4. **Environment Variables Not Working**
   - Use bracket notation: `process.env['VARIABLE_NAME']`
   - Verify variables are set in AWS Lambda console

### Monitoring

1. **CloudWatch Logs**
   - Monitor Lambda function logs
   - Set up log groups for different environments

2. **GraphQL Playground**
   - Enable introspection in development
   - Disable in production

3. **Database Monitoring**
   - Monitor Aurora performance metrics
   - Set up alerts for connection failures

## Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] S3 bucket created and configured
- [ ] Cognito User Pool configured
- [ ] Lambda functions deployed
- [ ] Frontend deployed to Amplify
- [ ] CORS properly configured
- [ ] SSL certificates in place
- [ ] Monitoring and alerts set up
- [ ] Backup strategy implemented
- [ ] Security review completed

## Rollback Plan

### Backend Rollback
```bash
# Rollback to previous version
serverless rollback --timestamp TIMESTAMP

# Or redeploy previous version
git checkout PREVIOUS_COMMIT
npm run deploy
```

### Frontend Rollback
- Use Amplify Console to rollback to previous deployment
- Or redeploy from previous commit

### Database Rollback
```bash
# Rollback migrations (be careful!)
npx prisma migrate reset
npx prisma migrate deploy
```