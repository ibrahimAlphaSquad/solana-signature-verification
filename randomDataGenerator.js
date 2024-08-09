const dummyTokens = [
  { name: "Mongy", symbol: "MONGY" },
  { name: "Rocky", symbol: "ROCKY" },
  { name: "Clown", symbol: "CLOWN" },
  { name: "MAD", symbol: "MAD" },
  { name: "Wuffi", symbol: "WUF" },
  { name: "Raydium", symbol: "RAY" },
  { name: "Invisible Cat", symbol: "KIETH" },
  { name: "GAY", symbol: "GAY" },
  { name: "$BROKE again", symbol: "$BROKE" },
  { name: "Sillynubcat", symbol: "NUB" },
  { name: "Popcat", symbol: "POPCAT" },
  { name: "Hehe", symbol: "HEHE" },
  { name: "Glorp", symbol: "GLORP" },
  { name: "Solana", symbol: "SOL" },
  { name: "Samoyedcoin", symbol: "SAMO" },
  { name: "Oxygen", symbol: "OXY" },
  { name: "Mango", symbol: "MNGO" },
  { name: "Bonfida", symbol: "FIDA" },
  { name: "Serum", symbol: "SRM" },
  { name: "Star Atlas", symbol: "ATLAS" },
  { name: "CatCoin", symbol: "CATCOIN" },
  { name: "BaseCat", symbol: "BASECAT" },
  { name: "Scaley", symbol: "SCALEY" },
  { name: "aintnoway", symbol: "AINTNOWAY" },
  { name: "mate", symbol: "MATE" },
  { name: "$PIF", symbol: "$PIF" },
  { name: "CATGOD", symbol: "CATGOD" },
  { name: "bitdog", symbol: "BITDOG" },
  { name: "BTW", symbol: "BTW" },
  { name: "Grace", symbol: "GRACE" },
  { name: "DIKEC", symbol: "DIKEC" },
  { name: "HARRIS", symbol: "HARRIS" },
  { name: "Neiro", symbol: "NEIRO" },
  { name: "DID", symbol: "DID" },
  { name: "Mona", symbol: "MONA" },
  { name: "DEATHKAT", symbol: "DEATHKAT" },
  { name: "$talahon", symbol: "$TALAHON" },
  { name: "Chitan", symbol: "CHITAN" },
  { name: "IRAN", symbol: "IRAN" },
  { name: "FWOG", symbol: "FWOG" },
];

let tokenSymbols = [
  "MONGY",
  "ROCKY",
  "CLOWN",
  "MAD",
  "WUF",
  "RAY",
  "KIETH",
  "GAY",
  "$BROKE",
  "NUB",
  "POPCAT",
  "HEHE",
  "GLORP",
  "SOL",
  "SAMO",
  "OXY",
  "MNGO",
  "FIDA",
  "SRM",
  "ATLAS",
];

let tokenNames = [
  "Mongy",
  "Rocky",
  "Clown",
  "MAD",
  "Wuffi",
  "Raydium",
  "Invisible Cat",
  "GAY",
  "$BROKE again",
  "Sillynubcat",
  "Popcat",
  "Hehe",
  "Glorp",
  "Solana",
  "Samoyedcoin",
  "Oxygen",
  "Mango",
  "Bonfida",
  "Serum",
  "Star Atlas",
];

/**
 * Generate a random integer ID
 * @returns {number} - A unique identifier for the token release event
 */
function generateRandomId() {
  return Math.floor(Math.random() * 1000);
}

/**
 * Generate a random timestamp in the format "YYYY-MM-DD HH:mm:ss.SSS"
 * @returns {string} - Timestamp for when the token was created or the liquidity pool was created
 */
function generateRandomTimestamp() {
  //   const date = new Date(Date.now() - Math.floor(Math.random() * 1e9));
  //   const date = new Date(Date.now());
  //   const date = new Date();
  //   return date.toISOString().replace("T", " ").replace("Z", "");

  //   // Get the current date and time
  //   const now = Date.now();

  //   // Define a range for the past time (for example, up to one year ago)
  //   const oneYearInMilliseconds = 365 * 24 * 60 * 60 * 1000;

  //   // Generate a random number within the specified range
  //   const randomPastTime = Math.floor(Math.random() * oneYearInMilliseconds);

  //   // Calculate the random timestamp by subtracting the random past time from the current time
  //   const randomTimestamp = now - randomPastTime;

  //   return randomTimestamp;

  return Date.now();
}

/**
 * Generate a random Solana wallet address
 * @returns {string} - The wallet address of the entity
 */
function generateRandomWalletAddress() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let address = "";
  for (let i = 0; i < 44; i++) {
    address += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return address;
}

/**
 * Generate a random mint address for a token
 * @returns {string} - The mint address for a token
 */
function generateRandomMintAddress() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let address = "So1111111111111111111111111111111111111111";
  for (let i = 0; i < 43; i++) {
    address += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return address;
}

/**
 * Generate a random amount for a token mint
 * @returns {number} - The amount of the token in the pool
 */
function generateRandomTokenAmount() {
  return Math.floor(Math.random() * 1e8);
}

/**
 * Generate a random SOL amount
 * @returns {number} - The amount of SOL in the pool
 */
function generateRandomSolAmount() {
  return parseFloat((Math.random() * 100).toFixed(2));
}

/**
 * Generate random token names
 * @returns {string} - A random token name
 */
function generateRandomTokenName() {
  return dummyTokens[Math.floor(Math.random() * dummyTokens.length)].name;
}

/**
 * Generate random token symbols
 * @returns {string} - A random token symbol
 */
function generateRandomTokenSymbol() {
  return dummyTokens[Math.floor(Math.random() * dummyTokens.length)].symbol;
}

/**
 * Generate a random burnt percentage
 * @returns {number} - The percentage of tokens burnt
 */
function generateRandomBurntPercentage() {
  return parseFloat((Math.random() * 100).toFixed(2));
}

/**
 * Generate a random liquidity information value
 * @returns {string} - Information about the liquidity in the pool
 */
function generateRandomLiquidityInfo() {
  return (Math.random() * 1e9).toExponential(1);
}

// /**
//  * Generate a complete random data object for a new token release
//  * @returns {object} - Random data object for the token release
//  */
// function generateRandomTokenData() {
//   return {
//     id: generateRandomId(),
//     created_at: generateRandomTimestamp(),
//     pool_created_at: generateRandomTimestamp(),
//     fee_payer: generateRandomWalletAddress(),
//     pool_creator: generateRandomWalletAddress(),
//     liquidity_pool_address: generateRandomWalletAddress(),
//     token_mint_one: generateRandomMintAddress(),
//     token_mint_two: "So11111111111111111111111111111111111111112", // Typically SOL
//     token_mint_one_amount: generateRandomTokenAmount(),
//     sol_amount: generateRandomSolAmount(),
//     token_mint_one_name: generateRandomTokenName(),
//     token_mint_two_name: "Solana",
//     token_mint_one_symbol: generateRandomTokenSymbol(),
//     token_mint_two_symbol: "SOL",
//     pool_burnt_percentage: generateRandomBurntPercentage(),
//     liquidity_info: generateRandomLiquidityInfo(),
//     lp_provider: "Raydium",
//     uri: "https://arweave.net/o_JOBtY4n0bPm8-FL6Hq63IJ24T-QIk0-GbKy9YSPDU",
//   };
// }

/**
 * Generate a complete random data object for a new token release
 * @returns {object} - Random data object for the token release
 */
function generateRandomTokenData() {
  return {
    tokenAddress: generateRandomMintAddress(), // Previously token_mint_one
    tokenPriceSol: parseFloat((Math.random() * 1e-5).toFixed(12)), // Random SOL price
    symbol: generateRandomTokenSymbol(),
    lpTokenAmount: generateRandomTokenAmount(), // Previously token_mint_one_amount
    creator: generateRandomWalletAddress(), // Previously pool_creator
    tokenPriceUsd: parseFloat((Math.random() * 0.001).toFixed(12)), // Random USD price
    name: generateRandomTokenName(),
    poolAddress: generateRandomWalletAddress(), // Previously liquidity_pool_address
    lpSolAmount: generateRandomSolAmount(), // Previously sol_amount
    openTime: Math.floor(Date.now() / 1000), // Epoch time in seconds
    supply: 1000000000, // Fixed supply for the token
    uri: "https://bafkreiexnj5beawk2qmqcavuekrbpvemhngytjcuerol5venjtrrsx4lh4.ipfs.w3s.link", // Placeholder URI
  };
}

module.exports = { generateRandomTokenData, generateRandomId };
