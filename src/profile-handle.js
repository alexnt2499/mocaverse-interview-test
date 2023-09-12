const { ethers, BigNumber } = require("ethers");
const profileNFTAbi = require("../abi/ProfileNFT.json");
const pinFileToIPFS = require("./ipfs");

// config
const privateKey = process.env.PRIVATE_KEY;
const bscRpcUrl = process.env.BSC_RPC_URL;
const ccProfileContractAddress = process.env.CC_PROFILE_CONTRACT_ADDRESS;
const profile_nft_operator = process.env.PROFILE_NFT_OPERATOR;
const opensea_url = process.env.OPENSEA_URL;

// global variables
let provider;
let wallet;
let ccProfileContract;
let ccProfileContractWithSigner;

async function connectToBSC() {
  provider = new ethers.providers.JsonRpcProvider(bscRpcUrl);
  wallet = new ethers.Wallet(privateKey, provider);
  // Check the balance of your BSC wallet
  const balance = await provider.getBalance(wallet.address);

  console.log("Chain: BSC testnet");
  console.log(`BSC Wallet Address: ${wallet.address}`);
  console.log(`BSC Wallet Balance: ${ethers.utils.formatEther(balance)} BNB`);
  // Connect cc profile
  ccProfileContract = new ethers.Contract(
    ccProfileContractAddress,
    profileNFTAbi,
    provider
  );
  ccProfileContractWithSigner = ccProfileContract.connect(wallet);
}

async function getProfileIdByHandle(handle) {
  /* Call the getProfileIdByHandle function to get the profile id */
  const profileID = await ccProfileContractWithSigner.getProfileIdByHandle(
    handle
  );

  const profileIDNumber = BigNumber.from(profileID).toNumber();
  return profileIDNumber;
}

async function validateInput(handle, avatar) {
  const regexHandle = /^[a-z0-9_]+$/;

  if (!avatar || !handle) {
    console.log("Error: Avatar and handle name is required");
    return false;
  }
  if (handle.length < 6 || handle.length > 11) {
    console.log("Error: Handle name must be between 6 and 11 characters");
    return false;
  }
  if (!regexHandle.test(handle)) {
    console.log(
      "Error: Handle name must be lowercase letters, numbers and underscores"
    );
    return false;
  }
  if ((await getProfileIdByHandle(handle)) !== 0) {
    console.log("Error: Profile handle is exist");
    return false;
  }
  return true;
}

async function createProfile(handle, avatar) {
  console.log("Profile handle checking...");

  const isValidate = await validateInput(handle, avatar);

  if (!isValidate) return;

  console.log("Profile checked, Creating profile...");

  /* Create metadata */
  const metadata = {
    handle,
  };

  /* Upload metadata to IPFS */
  const ipfsHash = await pinFileToIPFS(metadata);

  // Get the estimated gas limit
  const estimatedGasLimit = await ccProfileContract.estimateGas.createProfile(
    /* CreateProfileParams */
    {
      to: wallet.address,
      handle: handle,
      avatar: avatar,
      metadata: ipfsHash,
      operator: profile_nft_operator,
    },
    /* preData */
    0x0,
    /* postData */
    0x0
  );

  // Get the nonce and gas price
  const nonce = await provider.getTransactionCount(wallet.address);
  const gasPrice = await provider.getGasPrice();

  /* Call the createProfile function to create the profile */
  const tx = await ccProfileContractWithSigner.createProfile(
    /* CreateProfileParams */
    {
      to: wallet.address,
      handle: handle,
      avatar: avatar,
      metadata: ipfsHash,
      operator: profile_nft_operator,
    },
    /* preData */
    0x0,
    /* postData */
    0x0,
    {
      gasLimit: estimatedGasLimit,
      nonce,
      gasPrice,
    }
  );

  /* Wait for the transaction to be mined */
  await tx.wait();

  const profileID = await getProfileIdByHandle(handle);

  console.log(`Create profile successful`);
  console.log(`==========================`);
  console.log(`Profile ID: ${profileID}`);
  console.log(`Profile handle: ${handle}`);
  console.log(
    `You can see your profile on Opensea: ${opensea_url}/${ccProfileContractAddress}/${profileID}`
  );
}

module.exports = {
  connectToBSC,
  createProfile,
};
