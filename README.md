# Solana Signature Verification API

This project provides an API to verify Solana message signatures and manage key pairs with JWT authentication. The API is built using Express.js and includes Swagger documentation for easy reference.

## Features

- Verify Solana message signatures
- Generate JWT tokens upon successful signature verification
- Accept and process new public/private key pairs with JWT authentication
- Swagger documentation for API endpoints

## Getting Started

### Prerequisites

Ensure you have the following installed on your local development machine:

- Node.js
- npm (Node Package Manager)

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/solana-signature-verification.git
    cd solana-signature-verification
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Start the server:

    ```bash
    npm start
    ```

#
## API Endpoints

### GET /

Welcome route to verify the API is running.

### POST /verify-signature

Verify Solana message signature and generate JWT token.

- **Request Body:**

    ```json
    {
      "publicKey": "yourPublicKeyHere",
      "signature": "yourSignatureHere"
    }
    ```

- **Response:**

    ```json
    {
      "isValid": true,
      "token": "yourJWTtokenHere",
      "message": "Signature is valid"
    }
    ```

### POST /new-key-pair

Accept new public/private key pair with JWT authentication.

- **Request Headers:**

    ```http
    Authorization: Bearer yourJWTtokenHere
    ```

- **Request Body:**

    ```json
    {
      "publicKey": "newPublicKeyHere",
      "privateKey": "newPrivateKeyHere"
    }
    ```

- **Response:**

    ```json
    {
      "message": "New key pair processed successfully"
    }
    ```