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
  generateRandomHoldings,
  generateRandomSolanaQuantity,
  generateRandomPreferences,
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

// In-memory store for pending transactions
const pendingTransactions = new Map();

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

const signatures = [
  "czcYGgUXg2hkMnM3EbtbRWTSMWdoCi4mMxC2m7VPsD6zFh1gjNHQkwBUs44S2Duh7EURbB6aDRYd7Z3w123FzzV",
  "X1FzBRqzBVb41W9QNdFiHzaWpG8S2ubea9p8TW2XRt5KZ5oRjJaj2wYzV1HgCUZ1rA7BP4XzeDkB7K6M123Ge7u",
  "5xRdkPq19ob5smkMGubzcTce5FqRhvLwfxc9onThbMbqaEFMwsunKnYqUT5mnPTuPEBFM9AGDRVC5ytv123Cc4rN",
  "5nJeC6gJhv2cmiNXPqV5UV7ncegrSzeqHXzhgjK2Z6hTBYjKcDcgyjYhCRccp1GKzni13rce7PGMUKaB123aSvcg",
  "JdkrgBp2cc1W2SMQzhEPoJpnZCqRkFKiagMUtUkSfKkSYZjzbEDoTz7gXYyYm7YZQdEwH4KGWCMzWb69123VKrt",
  "n8HyG5C2k3EojVm62Q7pieVY7ka6WXrxPiC8mAwZKgYuE8T4ehgJiYj9jq48j9Yziak36b4ejaHFhikF123Nuxw",
  "3gQ2fohTf63Y5FxUsiYaa2hwLVLyjCkTaK437z9aMwoYdLngeK3zUJu6hjr3RWZmwQYM3VcUrs4V7sXqBGyo1eK",
  "5tedns2ipxYWmDz1n7iHdPyQjfMmcs69B3ohyDcMhC36f1MJRQGDJwKyRYq643v1G7wyMoxjrCTfKbLGv4n3bD7d",
  "4K5LbpsXZD14Dn5TSmQx9yRY34V1FhM813ezWDajwgLoTWQfSEUey5ysUxThQz9D37bCJmckG8mE9UD5r2Z2NLKw",
  "czcYGgUXg2hkMnM3EbtbRWTSMWdoCi4mMxC2m7VPsD6zFh1gjNH123BUs44S2Duh7EURbB6aDRYd7Z3w1icFzzV",
  "X1FzBRqzBVb41W9QNdFiHzaWpG8S2ubea9p8TW2XRt5KZ5oRjJa123YzV1HgCUZ1rA7BP4XzeDkB7K6MZ5gGe7u",
  "5xRdkPq19ob5smkMGubzcTce5FqRhvLwfxc9onThbMbqaEFMwsu123YqUT5mnPTuPEBFM9AGDRVC5ytvAyPCc4rN",
  "5nJeC6gJhv2cmiNXPqV5UV7ncegrSzeqHXzhgjK2Z6hTBYjKcDc123YhCRccp1GKzni13rce7PGMUKaBCzwaSvcg",
  "JdkrgBp2cc1W2SMQzhEPoJpnZCqRkFKiagMUtUkSfKkSYZjzbED1237gXYyYm7YZQdEwH4KGWCMzWb69456VKrt",
  "5nJeC6gJhv2cmiNXPqV5UV7ncegrSzeqHXzhgjK2Z6hTBYjKcDcgyjYhCRccp1GKzni13rce7PGMUKaB456aSvcg",
  "JdkrgBp2cc1W2SMQzhEPoJpnZCqRkFKiagMUtUkSfKkSYZjzbEDoTz7gXYyYm7YZQdEwH4KGWCMzWb69456VKrt",
  "n8HyG5C2k3EojVm62Q7pieVY7ka6WXrxPiC8mAwZKgYuE8T4ehgJiYj9jq48j9Yziak36b4ejaHFhikF456Nuxw",
  "3gQ2fohTf63Y5FxUsiYaa2hwLVLyjCkTaK437z9aMwoYdLngeK3zUJu6hjr3RWZmwQYM3VcUrs4V7sXq456o1eK",
  "5tedns2ipxYWmDz1n7iHdPyQjfMmcs69B3ohyDcMhC36f1MJRQGDJwKyRYq643v1G7wyMoxjrCTfKbLG4563bD7d",
  "4K5LbpsXZD14Dn5TSmQx9yRY34V1FhM813ezWDajwgLoTWQfSEUey5ysUxThQz9D37bCJmckG8mE9UD5r2Z2NLKw",
  "czcYGgUXg2hkMnM3EbtbRWTSMWdoCi4mMxC2m7VPsD6zFh1gjNH123BUs44S2Duh7EURbB6aDRYd7Z3w1icFzzV",
  "X1FzBRqzBVb41W9QNdFiHzaWpG8S2ubea9p8TW2XRt5KZ5oRjJa123YzV1HgCUZ1rA7BP4XzeDkB7K6M523Ge7u",
  "5xRdkPq19ob5smkMGubzcTce5FqRhvLwfxc9onThbMbqaEFMwsu123YqUT5mnPTuPEBFM9AGDRVC5ytv523Cc4rN",
  "5nJeC6gJhv2cmiNXPqV5UV7ncegrSzeqHXzhgjK2Z6hTBYjKcDc123YhCRccp1GKzni13rce7PGMUKaB523aSvcg",
  "JdkrgBp2cc1W2SMQzhEPoJpnZCqRkFKiagMUtUkSfKkSYZjzbED1237gXYyYm7YZQdEwH4KGWCMzWb69523VKrt",
  "n8HyG5C2k3EojVm62Q7pieVY7ka6WXrxPiC8mAwZKgYuE8T4ehg123j9jq48j9Yziak36b4ejaHFhikF523Nuxw",
  "3gQ2fohTf63Y5FxUsiYaa2hwLVLyjCkTaK437z9aMwoYdLngeK3123u6hjr3RWZmwQYM3VcUrs4V7sXq523o1eK",
  "5tedns2ipxYWmDz1n7iHdPyQjfMmcs69B3ohyDcMhC36f1MJRQG123KyRYq643v1G7wyMoxjrCTfKbLGv4n3bD7d",
  "4K5LbpsXZD14Dn5TSmQx9yRY34V1FhM813ezWDajwgLoTWQfSEU123ysUxThQz9D37bCJmckG8mE9UD5r2Z2NLKw",
];

function randomSignature(index) {
  return signatures[index];
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePseudoRandomSSEEvent(seed) {
  const d = randomBetween(10, 100);
  const before = randomBetween(1000, 10000);

  const sse_event = {
    signature: randomSignature(seed),
    tokenDelta: d,
    fee: randomBetween(105003, 105003 * 4),
    tokenAmount: d + before,
    solAmount: randomBetween(0.013857887, 0.013857887 * 10),
    status: randomBetween(0, 1) == 1 ? "success" : "failed",
  };

  return sse_event;
}

/*

*/
app.post("/v1/swap/buy", (req, res) => {
  const {
    poolAddress,
    tokenAddress,
    currency,
    amount,
    priority,
    priorityFee,
    slippage,
    provider,
  } = req.body;

  // Validate required fields
  if (!poolAddress || !tokenAddress || !currency || !amount || !provider) {
    return res.status(400).json({
      code: 1,
      error: "Missing required fields",
    });
  }

  // Validate currency
  if (currency !== "USD" && currency !== "SOL") {
    return res.status(400).json({
      code: 2,
      error: "Invalid currency. Must be 'USD' or 'SOL'",
    });
  }

  // Validate amount
  if (typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({
      code: 3,
      error: "Invalid amount. Must be a positive number",
    });
  }

  // Validate provider
  if (provider !== "raydium" && provider !== "pumpfun") {
    return res.status(400).json({
      code: 4,
      error: "Invalid provider. Must be 'raydium' or 'pumpfun'",
    });
  }

  const i = randomBetween(0, signatures.length - 1);

  // Generate a unique transaction signature
  const transactionSignature = randomSignature(i);

  // Store the transaction details
  pendingTransactions.set(i, {
    poolAddress,
    tokenAddress,
    currency,
    amount,
    priority,
    priorityFee,
    slippage,
    provider,
    status: "pending",
  });

  res.json({
    code: 0,
    transactionSignature,
    error: "",
    seed: i,
  });
});

/**
 * @swagger
 * /v1/events/subscribe:
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

app.get("/v1/events/subscribe", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders(); // flush the headers to establish SSE connection immediately

  await new Promise((r) => setTimeout(r, 5000));
  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Function to process pending transactions
  const processPendingTransactions = () => {
    for (const [seed, transaction] of pendingTransactions.entries()) {
      if (transaction.status === "pending") {
        const eventData = generatePseudoRandomSSEEvent(seed);
        sendEvent(eventData);

        // Update transaction status
        transaction.status = eventData.status;
        if (transaction.status !== "pending") {
          pendingTransactions.delete(seed);
        }
      }
    }
  };

  processPendingTransactions();

  // Set up interval for continuous processing
  const interval = setInterval(processPendingTransactions, 5000);

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

/**
 * @swagger
 * /pools/raydium/past/72:
 *  get:
 *    summary: Get past pool data for Raydium
 *    tags:
 *      - Pools
 *    parameters:
 *      - in: query
 *        name: offset
 *        schema:
 *          type: integer
 *        description: Offset for pagination
 *        required: false
 *        default: 0
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *        description: Limit for pagination
 *        required: false
 *        default: 20
 *    responses:
 *      200:
 *        description: Array of random token data objects
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  tokenAddress:
 *                    type: string
 *                  tokenPriceSol:
 *                    type: number
 *                  symbol:
 *                    type: string
 *                  lpTokenAmount:
 *                    type: number
 *                  creator:
 *                    type: string
 *                  tokenPriceUsd:
 *                    type: number
 *                  name:
 *                    type: string
 *                  poolAddress:
 *                    type: string
 *                  lpSolAmount:
 *                    type: number
 *                  openTime:
 *                    type: integer
 *                  supply:
 *                    type: integer
 *                  uri:
 *                    type: string
 *      400:
 *        description: Bad Request
 *      500:
 *        description: Internal Server Error
 */
app.get("/v1/pools/raydium/past/72", (req, res) => {
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 20;

  if (offset < 0 || limit < 1) {
    return res
      .status(400)
      .send({ message: "Invalid offset or limit parameters" });
  }

  try {
    const randomData = [];
    for (let i = 0; i < limit; i++) {
      randomData.push(generateRandomTokenData());
    }

    res.status(200).send(randomData.slice(offset, offset + limit));
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

/**
 * @swagger
 * /v1/holdings:
 *  get:
 *    summary: Get holdings data
 *    tags:
 *      - Holdings
 *    responses:
 *      200:
 *        description: Array of holding objects
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                code:
 *                  type: integer
 *                holdings:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      tokenMintAddress:
 *                        type: string
 *                      poolAddress:
 *                        type: string
 *                      tokenName:
 *                        type: string
 *                      tokenSymbol:
 *                        type: string
 *                      tokenQuantity:
 *                        type: number
 *                      uri:
 *                        type: string
 *                      createdAt:
 *                        type: string
 */
app.get("/v1/holdings", (req, res) => {
  const holdingsData = generateRandomHoldings(); // Generate the data
  res.status(200).json(holdingsData);
});

/**
 * @swagger
 * /v1/wallet/sync:
 *  get:
 *    summary: Sync wallet data
 *    tags:
 *      - Wallet
 *    responses:
 *      200:
 *        description: Wallet sync data
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                code:
 *                  type: integer
 *                solanaQuantity:
 *                  type: number
 */
app.get("/v1/wallet/sync", (req, res) => {
  const walletData = {
    code: 0, // Success code
    solanaQuantity: generateRandomSolanaQuantity(), // Random SOL quantity
  };
  res.status(200).json(walletData);
});

/**
 * @swagger
 * /v1/preferences:
 *  get:
 *    summary: Get user preferences
 *    tags:
 *      - Preferences
 *    responses:
 *      200:
 *        description: Preferences data
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                slippage:
 *                  type: integer
 *                priorityFee:
 *                  type: string
 *                customPriorityFee:
 *                  type: number
 *                customSlippage:
 *                  type: number
 *                preferredCurrency:
 *                  type: string
 *                quickBuySol:
 *                  type: array
 *                  items:
 *                    type: integer
 *                quickBuyUsd:
 *                  type: array
 *                  items:
 *                    type: integer
 *                code:
 *                  type: integer
 */
app.get("/v1/preferences", (req, res) => {
  const preferencesData = generateRandomPreferences(); // Generate the data
  res.status(200).json(preferencesData);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.log({ err });
  res.status(500).send("Something broke!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
