# Testing the Create Business Operation

This guide walks you through testing the complete create operation flow from frontend to backend.

## Prerequisites

1. **Backend deployed** and running
2. **Database** set up with Prisma migrations
3. **AWS Cognito** User Pool configured
4. **Frontend** running locally or deployed

## Step-by-Step Testing

### 1. Start the Application

#### Backend (if running locally):
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your actual values

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start serverless offline (for local testing)
npm run dev
```

#### Frontend:
```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your actual values

# Start development server
npm run dev
```

### 2. Test the Complete Flow

Visit: `http://localhost:3000/test`

This page provides a complete testing interface with:
- ✅ System health checks
- 🔐 Authentication flow
- 📝 Create business form
- 🐛 Debug information

### 3. Authentication Test

1. **Sign Up**:
   - Click "Don't have an account? Sign Up"
   - Fill in: First Name, Last Name, Email, Password
   - Click "Sign Up"
   - Check your email for confirmation code

2. **Confirm Email**:
   - Enter the 6-digit code from your email
   - Click "Confirm Email"

3. **Sign In**:
   - Enter your email and password
   - Click "Sign In"
   - You should see "Authenticated" status with JWT token

### 4. Create Business Test

Once authenticated:

1. **Fill the form**:
   ```
   Business Name: "Test Restaurant" (required)
   Description: "A great place to eat"
   Category: "Restaurant"
   Address: "123 Main St"
   City: "New York"
   State: "NY"
   ZIP Code: "10001"
   Phone: "(555) 123-4567"
   Email: "info@testrestaurant.com"
   Website: "https://testrestaurant.com"
   ```

2. **Submit**:
   - Click "Create Business"
   - Watch for success message
   - Check browser console for detailed logs

3. **Verify**:
   - Go to main page (`http://localhost:3000`)
   - Your business should appear in the list

## What Happens Behind the Scenes

### 1. Frontend Flow
```
User fills form → Apollo Client mutation → JWT token added → GraphQL request sent
```

### 2. Backend Flow
```
Lambda receives request → Extract JWT token → Validate user → Create business in DB → Return response
```

### 3. Database Flow
```
Prisma ORM → PostgreSQL INSERT → Return created business with relations
```

## Expected API Request/Response

### Request (GraphQL Mutation):
```graphql
mutation CreateBusiness($input: CreateBusinessInput!) {
  createBusiness(input: $input) {
    id
    name
    description
    category
    address
    city
    state
    zipCode
    phone
    email
    website
    isActive
    isClaimed
    createdAt
    updatedAt
    owner {
      id
      firstName
      lastName
      email
    }
    images {
      id
      url
      key
      alt
      isPrimary
    }
  }
}
```

### Variables:
```json
{
  "input": {
    "name": "Test Restaurant",
    "description": "A great place to eat",
    "category": "Restaurant",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "phone": "(555) 123-4567",
    "email": "info@testrestaurant.com",
    "website": "https://testrestaurant.com"
  }
}
```

### Response:
```json
{
  "data": {
    "createBusiness": {
      "id": "clp123abc456def789",
      "name": "Test Restaurant",
      "description": "A great place to eat",
      "category": "Restaurant",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "phone": "(555) 123-4567",
      "email": "info@testrestaurant.com",
      "website": "https://testrestaurant.com",
      "isActive": true,
      "isClaimed": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "owner": {
        "id": "clp456def789ghi012",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      },
      "images": []
    }
  }
}
```

## Testing with cURL (Alternative)

If you want to test the API directly:

```bash
# 1. Get JWT token from browser console after signing in
# In browser console: 
# const session = await fetchAuthSession(); console.log(session.tokens?.idToken?.toString())

# 2. Test the mutation
curl -X POST \
  https://your-api-id.execute-api.us-east-1.amazonaws.com/dev/graphql \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN_HERE' \
  -d '{
    "query": "mutation CreateBusiness($input: CreateBusinessInput!) { createBusiness(input: $input) { id name description category createdAt owner { firstName lastName email } } }",
    "variables": {
      "input": {
        "name": "Test Business",
        "description": "A test business",
        "category": "Services"
      }
    }
  }'
```

## Common Issues & Solutions

### 1. Authentication Required Error
```json
{
  "errors": [
    {
      "message": "Authentication required",
      "path": ["createBusiness"]
    }
  ]
}
```
**Solution**: Make sure you're signed in and JWT token is being sent

### 2. CORS Error
```
Access to fetch at 'https://...' from origin 'http://localhost:3000' has been blocked by CORS policy
```
**Solution**: Check CORS configuration in `serverless.yml`

### 3. Database Connection Error
```json
{
  "errors": [
    {
      "message": "Database connection failed"
    }
  ]
}
```
**Solution**: Verify `DATABASE_URL` in environment variables

### 4. Validation Error
```json
{
  "errors": [
    {
      "message": "Business name is required"
    }
  ]
}
```
**Solution**: Ensure required fields are filled

## Success Indicators

✅ **Health checks pass** (API and Database)  
✅ **User can sign up and confirm email**  
✅ **User can sign in and get JWT token**  
✅ **Create business form submits successfully**  
✅ **Business appears in the businesses list**  
✅ **Database record is created**  
✅ **No console errors**  

## Debug Tips

1. **Check browser console** for detailed error messages
2. **Check CloudWatch logs** for Lambda function errors
3. **Use Prisma Studio** to verify database records: `npx prisma studio`
4. **Test GraphQL queries** in GraphQL Playground (if enabled)
5. **Verify environment variables** are set correctly

This simple create operation demonstrates the complete architecture working together: Authentication → Authorization → Database Operations → Response!