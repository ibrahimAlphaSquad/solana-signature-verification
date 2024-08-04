// const generateVerificationNumber = () => {
//   return Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit verification number
// };

// const generateVerificationNumber = (length = 6) => {
//   const min = Math.pow(10, length - 1);
//   const max = Math.pow(10, length) - 1;
//   return Math.floor(min + Math.random() * (max - min + 1));
// };

const generateVerificationNumber = (length = 6) => {
  let number = "";
  for (let i = 0; i < length; i++) {
    number += Math.floor(Math.random() * 10).toString();
  }
  return parseInt(number, 10); // Convert the string to an integer
};

module.exports = generateVerificationNumber;
