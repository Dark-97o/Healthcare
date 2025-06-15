const hre = require("hardhat");

async function main() {
  console.log("Deploying HealthcareSystem contract...");
  
  const HealthcareSystem = await hre.ethers.getContractFactory("HealthcareSystem");
  const contract = await HealthcareSystem.deploy();
  
  await contract.deployed();
  
  console.log("HealthcareSystem contract deployed to:", contract.address);
  console.log("Contract owner:", await contract.owner());
  
  // Optional: Verify deployment by checking if the contract is deployed
  const code = await hre.ethers.provider.getCode(contract.address);
  if (code === "0x") {
    console.error("Contract deployment failed - no code at address");
  } else {
    console.log("Contract deployment successful!");
    console.log("Transaction hash:", contract.deployTransaction.hash);
  }
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});