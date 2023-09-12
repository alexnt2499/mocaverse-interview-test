require("dotenv").config();

const profileHandle = require("./profile-handle");

async function main() {
  // Connect to BSC
  await profileHandle.connectToBSC();

  // Create profile with handle and avatar
  await profileHandle.createProfile("alex_test", "https://i.pravatar.cc/300");

  // Create more test profile with handle and avatar
  // await profileHandle.createProfile("alex_test_2", "https://i.pravatar.cc/300");

  // Create more test profile with handle and avatar
  // await profileHandle.createProfile("alex_test_3", "https://i.pravatar.cc/300");

  // Create more test profile with handle and avatar
  // await profileHandle.createProfile("alex_test_4", "https://i.pravatar.cc/300");

  // Create more test profile with handle and avatar
  // await profileHandle.createProfile("alex_test_5", "https://i.pravatar.cc/300");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
