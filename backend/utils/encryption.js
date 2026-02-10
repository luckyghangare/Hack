const CryptoJS = require('crypto-js');

const encryptVote = (candidateId) => {
  const encryptionKey = process.env.ENCRYPTION_KEY;
  const encrypted = CryptoJS.AES.encrypt(candidateId.toString(), encryptionKey).toString();
  return encrypted;
};

const decryptVote = (encryptedVote) => {
  const encryptionKey = process.env.ENCRYPTION_KEY;
  const bytes = CryptoJS.AES.decrypt(encryptedVote, encryptionKey);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return decrypted;
};

module.exports = { encryptVote, decryptVote };
