const nacl = require("tweetnacl");
const bs58 = require("bs58");
const generateToken = require("./generateToken");

const message =
  "To avoid digital dognappers, sign below to authenticate with CryptoCorgis.";

const verifySignature = async (publicKeyString, signatureString) => {
  try {
    const publicKey = bs58.decode(publicKeyString);
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = bs58.decode(signatureString);

    console.log({ publicKey, messageBytes, signatureBytes });

    const verifyPublicKey = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKey
    );

    if (verifyPublicKey) {
      console.log("Signature is valid");
      const token = generateToken({ publicKey: publicKeyString });
      return { isValid: true, token, message: "Signature is valid" };
    } else {
      console.log("Signature is invalid");
      return { isValid: false, message: "Signature is invalid" };
    }
  } catch (error) {
    console.error("Error in verifySignature:", error);
    throw new Error("Failed to verify signature");
  }
};

module.exports = { verifySignature };
