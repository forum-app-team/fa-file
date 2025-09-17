# Forum File Service

A Node.js file service for the Forum Application that provides S3 presigned uploads and direct upload functionality with authentication, validation, and rate limiting.


## Src folder Structure

```
src/
├── controllers/        # Request handlers
│   └── files.controller.js
├── middleware/         # Express middleware
│   ├── auth.js        # Authentication middleware
│   ├── errorHandler.js # Global error handler
│   ├── rateLimit.js   # Rate limiting
│   ├── requestId.js   # Request ID generation
│   └── validate.js    # Request validation
├── routes/            # API routes
│   └── files.routes.js
├── services/          # Business logic
│   └── s3.service.js  # S3 operations
├── tests/             # Test files
│   └── presign.test.js
├── utils/             # Utilities
│   ├── errors.js      # Error classes
│   └── logger.js      # Logging configuration
├── validators/        # Request schemas
│   └── files.schema.js
├── app.js            # Express app setup
├── config.js         # Configuration
└── server.js         # Server entry point
```

## Environment Setup

### 1. Copy Environment Configuration

```bash
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` file with your settings:

```bash
# File Service environment
NODE_ENV=development
PORT=8080
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Authentication (mock)
JWT_PUBLIC_KEY=MOCK

# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
S3_BUCKET=your-bucket-name
S3_PUBLIC_BASE_URL=https://your-bucket-name.s3.us-east-1.amazonaws.com
S3_SSE=AES256

# Presign configuration
PRESIGN_EXPIRES_SECONDS=600

# Rate limiting
RATE_LIMIT_PER_MINUTE=60

# Testing/development
MOCK_S3=false
```

### 3. AWS S3 Setup Instructions (REFERENCE ONLY)

#### Step 1: Create AWS Account (If You Don't Have One)
1. **Sign up for AWS**:
   - Go to [AWS Console](https://aws.amazon.com/console/)
   - Click "Create an AWS Account"
   - Follow the registration process (requires credit card for verification)
   - Choose the "Basic Support - Free" plan

2. **Sign in to AWS Console**:
   - Go to [AWS Management Console](https://console.aws.amazon.com/)
   - Sign in with your root account credentials

#### Step 2: Create S3 Bucket
1. **Navigate to S3**:
   - In the AWS Console, search for "S3" in the search bar
   - Click on "S3" from the results

2. **Create New Bucket**:
   - Click the "Create bucket" button
   - **Bucket name**: Enter a unique name (e.g., `your-app-files-bucket`)
     - Must be globally unique across all AWS accounts
     - Use lowercase letters, numbers, and hyphens only
   - **AWS Region**: Choose your preferred region (e.g., `us-east-1`)
   - **Object Ownership**: Select "ACLs enabled" and "Bucket owner preferred"

3. **Configure Bucket Settings**:
   - **Block Public Access settings**:
     - Uncheck "Block all public access" if you want files to be publicly accessible
     - For development, you can allow public access; for production, configure more restrictive settings
   - **Bucket Versioning**: Enable if you want version control (optional)
   - **Default encryption**: Enable with "Amazon S3 managed keys (SSE-S3)"
   - Click "Create bucket"

#### Step 3: Set Up IAM User and Permissions (Recommended for Production)

> **Note**: For development/learning purposes, you can use your root account credentials, but this is NOT recommended for production. Always create IAM users with limited permissions for production applications.

1. **Navigate to IAM**:
   - In the AWS Console, search for "IAM" in the search bar
   - Click on "IAM" from the results

2. **Create IAM User**:
   - Click "Users" in the left sidebar
   - Click "Create user"
   - **User name**: Enter a name (e.g., `file-service-user`)
   - **Access type**: Check "Programmatic access"
   - Click "Next: Permissions"

3. **Set Permissions**:
   - Click "Attach existing policies directly"
   - For **development/learning**: Search for and select "AmazonS3FullAccess"
   - For **production**: Create a custom policy (see JSON below)
   - Click "Next: Tags" → "Next: Review" → "Create user"

4. **Save Credentials**:
   - **IMPORTANT**: Copy and save the "Access key ID" and "Secret access key"
   - You won't be able to see the secret key again
   - Add these to your `.env` file

#### Step 4: Create Custom IAM Policy (Production Recommended)
For production environments, create a more restrictive policy:

1. **Create Policy**:
   - In IAM, click "Policies" → "Create policy"
   - Click the "JSON" tab and paste this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:GetObjectMetadata"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name"
    }
  ]
}
```

2. **Replace `your-bucket-name`** with your actual bucket name
3. **Review and Create**: Name the policy (e.g., `FileServiceS3Policy`) and create it
4. **Attach to User**: Go back to your IAM user and attach this policy instead of the full access policy

#### Step 5: Configure S3 Bucket CORS
1. **Navigate to Your Bucket**:
   - In the S3 console, click on your bucket name
   - Go to the "Permissions" tab

2. **Set CORS Configuration**:
   - Scroll down to "Cross-origin resource sharing (CORS)"
   - Click "Edit"
   - Paste the following CORS configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "http://localhost:5173"],
    "ExposeHeaders": ["ETag"]
  }
]
```

3. **Update for Production**: Replace the localhost origins with your production domain(s)
4. Click "Save changes"

#### Step 6: Set Bucket Policy (Optional - For Public File Access)
If you want uploaded files to be publicly accessible:

1. **Navigate to Bucket Policy**:
   - In your bucket's "Permissions" tab
   - Scroll to "Bucket policy"
   - Click "Edit"

2. **Add Public Read Policy**:
   - Paste the following policy (replace `your-bucket-name` with your actual bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

3. Click "Save changes"

> **Security Note**: This policy makes all files in your bucket publicly readable. For production applications, consider using presigned URLs instead of public bucket policies for better security control.

## Development Commands

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```

### Start Production Server
```bash
npm start
```

### Run Tests
```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch
```

## API Endpoints

### Health Check
```bash
curl -X GET http://localhost:8080/health
```

### Generate Presigned Upload URL
```bash
curl -X POST http://localhost:8080/files/presign \
  -H "Authorization: Bearer demo-123" \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "avatar.png",
    "contentType": "image/png",
    "sizeBytes": 1024,
    "category": "profile"
  }'
```

### Direct File Upload
```bash
curl -X POST http://localhost:8080/files/upload \
  -H "Authorization: Bearer demo-123" \
  -F "file=@path/to/file.pdf" \
  -F "category=postAttachment"
```

### Retrieve File Metadata and Download URL
```bash
curl -X GET "http://localhost:8080/files/retrieve/u/123/profile/2025/09/uuid.png" \
  -H "Authorization: Bearer demo-123"
```

## File Categories and Validation

### Profile Images
- **Max Size**: 5MB
- **Allowed Types**: `image/png`, `image/jpeg`
- **Usage**: User profile pictures

### Post Attachments
- **Max Size**: 20MB
- **Allowed Types**: `image/png`, `image/jpeg`, `application/pdf`, `application/zip`, `application/x-zip-compressed`
- **Usage**: File attachments in forum posts

## Authentication

The service uses Bearer token authentication with demo tokens for development:
- Format: `Bearer demo-{userId}`
- Example: `Bearer demo-123`

For production, replace the auth middleware with your JWT verification logic.

## Rate Limiting

- **Default**: 60 requests per minute per user
- **Configurable**: Set `RATE_LIMIT_PER_MINUTE` in environment variables
- **Scope**: Per authenticated user ID

## Testing with Postman

For API testing, use the Postman collection available in the [fa-api-collection](https://github.com/forum-app-team/fa-api-collection) repository.


## Error Responses

All errors follow a consistent format:
```json
{
  "traceId": "uuid",
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": "Additional details (optional)"
  }
}
```

### Common Error Codes
- `UNAUTHORIZED` (401): Missing or invalid authentication
- `FORBIDDEN` (403): Access denied
- `BAD_REQUEST` (400): Invalid request format
- `UNPROCESSABLE_ENTITY` (422): Validation failed
- `PAYLOAD_TOO_LARGE` (413): File too large
- `UNSUPPORTED_MEDIA_TYPE` (415): Invalid file type
- `TOO_MANY_REQUESTS` (429): Rate limit exceeded
