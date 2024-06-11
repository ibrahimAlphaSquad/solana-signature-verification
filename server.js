const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { verifySignature } = require("./verifySignature");
const verifyToken = require("./verifyToken");

const app = express();

// Enable CORS for all origins
app.use(
  cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST"], // Allow specific methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow specific headers
  })
);

app.use(bodyParser.json());

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Solana Signature Verification API",
      version: "1.0.0",
      description: "API to verify Solana message signatures",
      contact: {
        name: "Zeenat Khan",
      },
      servers: [
        {
          url: "http://localhost:3000",
        },
      ],
    },
  },
  apis: ["./server.js"], // files containing annotations for the OpenAPI Specification
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * components:
 *   schemas:
 *     VerificationRequest:
 *       type: object
 *       required:
 *         - publicKey
 *         - message
 *         - signature
 *       properties:
 *         publicKey:
 *           type: string
 *           description: Solana public key
 *         message:
 *           type: string
 *           description: Message that was signed
 *         signature:
 *           type: string
 *           description: Signature of the message
 *       example:
 *         publicKey: 'yourPublicKeyHere'
 *         message: 'yourMessageHere'
 *         signature: 'yourSignatureHere'
 *
 * /verify-signature:
 *   post:
 *     summary: Verify Solana message signature
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerificationRequest'
 *     responses:
 *       200:
 *         description: The signature is valid or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isValid:
 *                   type: boolean
 *                   description: Result of the verification
 */

// Welcome path
app.get("/", (req, res) => {
  res.send("Welcome to the Solana Signature Verification API");
});

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  console.log("Auth Header:", authHeader); // Log the Authorization header
  console.log("Token:", token); // Log the token extracted from the header

  if (token == null) {
    console.log("No token provided");
    return res.sendStatus(401);
  }

  try {
    const user = verifyToken(token);
    console.log("Token verified successfully:", user); // Log the verified user information
    req.user = user;
    next();
  } catch (err) {
    console.log("Token verification failed:", err.message); // Log the error message
    res.sendStatus(403);
  }
};

// Protected route example (can be any other route you want to protect)
app.post("/protected-route", authenticateToken, (req, res) => {
  res.send("This is a protected route.");
});

// Verify signature route and generate token if valid
app.post("/verify-signature", async (req, res, next) => {
  const { publicKey, signature } = req.body;

  console.log("Request received:", { publicKey, signature });

  if (!publicKey || !signature) {
    return res
      .status(400)
      .send({ message: "publicKey and signature are required" });
  }

  try {
    const result = await verifySignature(publicKey, signature);
    if (result.isValid) {
      console.log("Generated Token:", result.token); // Log the generated token
    }
    res.send(result);
  } catch (err) {
    console.error("Error in /verify-signature:", err.message);
    res.status(400).send({ error: err.message, status: "failed" });
  }
});

// New endpoint to handle new key pair
app.post("/new-key-pair", authenticateToken, (req, res) => {
  const { publicKey, privateKey } = req.body;

  if (!publicKey || !privateKey) {
    return res
      .status(400)
      .send({ message: "publicKey and privateKey are required" });
  }

  // Process the new key pair here
  console.log("New key pair received:", { publicKey, privateKey });

  // You can add more logic to store or use the key pair as needed

  res.send({ message: "New key pair processed successfully" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
