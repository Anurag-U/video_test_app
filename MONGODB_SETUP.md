# MongoDB Setup Guide

## Option 1: Local MongoDB Installation (Windows)

### Step 1: Download MongoDB Community Server
1. Go to https://www.mongodb.com/try/download/community
2. Select Windows platform
3. Download the MSI installer

### Step 2: Install MongoDB
1. Run the downloaded MSI file
2. Choose "Complete" installation
3. Install MongoDB as a Service (recommended)
4. Install MongoDB Compass (GUI tool) - optional but helpful

### Step 3: Start MongoDB Service
```powershell
# Check if MongoDB service is running
Get-Service -Name MongoDB

# Start MongoDB service if not running
Start-Service -Name MongoDB
```

### Step 4: Verify Installation
```powershell
# Connect to MongoDB shell
mongosh
```

## Option 2: MongoDB Atlas (Cloud - Recommended for Development)

### Step 1: Create Account
1. Go to https://www.mongodb.com/atlas
2. Sign up for a free account
3. Create a new cluster (free tier available)

### Step 2: Setup Database Access
1. Go to Database Access
2. Add a new database user
3. Set username and password
4. Give "Read and write to any database" permissions

### Step 3: Setup Network Access
1. Go to Network Access
2. Add IP Address
3. Add "0.0.0.0/0" for development (allow access from anywhere)
4. For production, use specific IP addresses

### Step 4: Get Connection String
1. Go to Clusters
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password

### Step 5: Update Backend Configuration
Update your `.env` file in the backend directory:
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/videoapp?retryWrites=true&w=majority
```

## Option 3: Docker MongoDB (Alternative)

If you have Docker installed:

```bash
# Run MongoDB in Docker container
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Stop the container
docker stop mongodb

# Start the container
docker start mongodb
```

## Testing the Connection

After setting up MongoDB, restart your backend server:

```bash
cd backend
npm run dev
```

You should see:
```
Connected to MongoDB
Server running on port 3001
```

## Troubleshooting

### Common Issues:

1. **Connection Refused Error**
   - Make sure MongoDB service is running
   - Check if port 27017 is available
   - Verify connection string format

2. **Authentication Failed**
   - Check username and password in connection string
   - Verify database user permissions

3. **Network Timeout**
   - Check network access settings in Atlas
   - Verify firewall settings

### Verify Database Connection
You can test the connection by trying to register a user in your application or by checking the MongoDB logs.
