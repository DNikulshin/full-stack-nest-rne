# User Management API - Bruno Collection

This folder contains a Bruno collection for testing the User Management API.

## Prerequisites

1. Install [Bruno](https://www.usebruno.com/) API client
2. Ensure the backend server is running on `http://localhost:3000`

## How to Use

1. Open Bruno
2. Click on "Open Collection"
3. Navigate to this folder and select it
4. The collection will be loaded with all API endpoints

## Collection Structure

The collection is organized into folders by API category:

- **auth**: Authentication endpoints (login, refresh, logout)
- **users**: User management endpoints (register, password reset, profile)
- **mail**: Email sending endpoints

## Environment Variables

The collection uses the following environment variables:

- `access_token`: JWT access token (set automatically after login)
- `refresh_token`: Refresh token (set manually or through scripts)

## Usage Flow

1. **Register** a new user or **Login** with existing credentials
2. Use the access token for authenticated requests
3. Test other endpoints as needed

## Notes

- All requests are pre-configured with example data
- Authentication tokens are automatically handled where applicable
- Modify the request bodies as needed for your testing

## API Documentation

For detailed API documentation, visit: http://localhost:3000/api