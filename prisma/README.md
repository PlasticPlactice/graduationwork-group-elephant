# Admin Account Setup

This directory contains a seed script to create a test admin account for development and testing purposes.

## Usage

### Quick Start

1. Install dependencies (if not already done):
```bash
npm install
```

2. Run the seed script:
```bash
npm run db:seed
```

This will create a test admin account with the following credentials:

- **Email:** `admin@test.com`
- **Password:** `Admin123!`

### Using the Admin Account

1. Navigate to the admin login page: `/admin`
2. Login with the credentials above
3. You can now test the password change functionality at `/admin/password`

### Password Requirements

The password meets the application's complexity requirements:
- Minimum 8 characters
- At least one letter (A-Z or a-z)
- At least one number (0-9)
- At least one special character

### Note

- The script checks if an admin account with the email already exists before creating a new one
- If the account exists, the script will skip creation and notify you
- For production, use proper environment variables and secure password generation
