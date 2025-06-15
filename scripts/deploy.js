const { ethers } = require("hardhat");

async function main() {
  console.log("Starting Healthcare Management System deployment...");
  
  // Get the contract factory
  const HealthcareManagement = await ethers.getContractFactory("HealthcareManagement");
  
  // Deploy the contract
  console.log("Deploying HealthcareManagement contract...");
  const healthcareManagement = await HealthcareManagement.deploy();
  
  // Wait for deployment to complete
  await healthcareManagement.waitForDeployment();
  
  // Get the deployed contract address
  const contractAddress = healthcareManagement.target;
  
  console.log("✅ HealthcareManagement deployed to:", contractAddress);
  
  // Get the deployer address
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deployed by:", deployer.address);
  
  // Get the deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Deployer balance:", ethers.formatEther(balance), "CORE");
  
  // Verify deployment by checking if contract exists
  const code = await ethers.provider.getCode(contractAddress);
  if (code !== '0x') {
    console.log("✅ Contract deployment verified - contract code exists at address");
  } else {
    console.log("❌ Contract deployment failed - no code at address");
  }
  
  console.log("\n🎉 Deployment completed successfully!");
  console.log("📋 Contract Address:", contractAddress);
  console.log("🔗 Network:", (await ethers.provider.getNetwork()).name);
  
  // Save deployment info to a file (optional)
  const fs = require('fs');
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployer: deployer.address,
    network: (await ethers.provider.getNetwork()).name,
    deploymentTime: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber()
  };
  
  fs.writeFileSync(
    'deployment-info.json', 
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("📄 Deployment info saved to deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });