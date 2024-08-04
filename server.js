const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { verifySignature } = require("./verifySignature");
const verifyToken = require("./verifyToken");
const generateVerificationNumber = require("./verifyNumber");
const {
  generateRandomTokenData,
  generateRandomId,
} = require("./randomDataGenerator");

const app = express();

// Enable CORS for all origins
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
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
        name: "Beast",
        email: "mibrahim.alphasquad@gmail.com",
      },
      servers: [
        {
          url: "http://localhost:3000",
        },
      ],
    },
  },
  apis: ["./server.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /:
 *  get:
 *    description: Welcome to the Solana Signature Verification API
 *    responses:
 *      200:
 *        description: Success
 */
app.get("/", (req, res) => {
  res.send("Welcome to the Solana Signature Verification API");
});

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.sendStatus(401);
  }

  try {
    const user = verifyToken(token);
    req.user = user;
    next();
  } catch (err) {
    res.sendStatus(403);
  }
};

/**
 * @swagger
 * /verify-signature:
 *  post:
 *    summary: Verify a Solana signature and generate a token if valid
 *    tags:
 *      - Signature Verification
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - publicKey
 *              - signature
 *            properties:
 *              publicKey:
 *                type: string
 *              signature:
 *                type: string
 *    responses:
 *      200:
 *        description: Verification result
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                isValid:
 *                  type: boolean
 *                token:
 *                  type: string
 *      400:
 *        description: Bad Request
 *      401:
 *        description: Unauthorized
 *      403:
 *        description: Forbidden
 */
app.post("/verify-signature", async (req, res, next) => {
  const { publicKey, signature } = req.body;

  if (!publicKey || !signature) {
    return res
      .status(400)
      .send({ message: "publicKey and signature are required" });
  }

  try {
    const result = await verifySignature(publicKey, signature);
    res.send(result);
  } catch (err) {
    res.status(400).send({ error: err.message, status: "failed" });
  }
});

/**
 * @swagger
 * /new-key-pair:
 *  post:
 *    summary: Process a new key pair
 *    tags:
 *      - Key Management
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - publicKey
 *              - privateKey
 *            properties:
 *              publicKey:
 *                type: string
 *              privateKey:
 *                type: string
 *    responses:
 *      200:
 *        description: Success
 *      400:
 *        description: Bad Request
 *      401:
 *        description: Unauthorized
 *      403:
 *        description: Forbidden
 */
app.post("/new-key-pair", authenticateToken, (req, res) => {
  const { publicKey, privateKey } = req.body;

  if (!publicKey || !privateKey) {
    return res
      .status(400)
      .send({ message: "publicKey and privateKey are required" });
  }

  res.send({ message: "New key pair processed successfully" });
});

/**
 * @swagger
 * /get_verify_number:
 *  get:
 *    summary: Generate and return a verification number
 *    tags:
 *      - Verification Number
 *    responses:
 *      200:
 *        description: Unique nonce
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                verify_numb:
 *                  type: string
 */
app.get("/get_verify_number", (req, res) => {
  const verificationNumber = generateVerificationNumber(20);
  return res
    .status(200)
    .send({ message: "Unique nonce", verify_numb: verificationNumber });
});

/**
 * @swagger
 * /v1/pools/subscribe:
 *  get:
 *    summary: Subscribe to event stream
 *    tags:
 *      - Event Stream
 *    responses:
 *      200:
 *        description: Event stream started
 *      500:
 *        description: Internal Server Error
 */
app.get("/v1/pools/subscribe", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders(); // flush the headers to establish SSE connection immediately

  const sendEvent = (data) => {
    res.write(`id: ${generateRandomId()}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Generate a random timeout between 1000ms (1 second) and 10000ms (10 seconds)
  const randomTimeout = Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000;

  const interval = setInterval(() => {
    sendEvent(generateRandomTokenData());
  }, randomTimeout);

  // Handle client connection loss
  req.on("close", () => {
    clearInterval(interval);
    res.end(); // ensure the response is properly closed
  });

  // Handle potential errors in streaming
  req.on("error", (err) => {
    console.error("SSE connection error:", err);
    clearInterval(interval);
    res.end();
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).send("Something broke!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
