const { ethers } = require("hardhat");

async function main() {
  console.log("🏥 Starting Healthcare Contract Deployment...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📋 Deploying contracts with account:", deployer.address);
  
  // Check balance
  const balance = await deployer.getBalance();
  console.log("💰 Account balance:", ethers.utils.formatEther(balance), "ETH");
  
  // Get the contract factory
  const HealthcareRecords = await ethers.getContractFactory("HealthcareRecords");
  
  console.log("🚀 Deploying HealthcareRecords contract...");
  
  // Deploy the contract
  const healthcareContract = await HealthcareRecords.deploy();
  
  // Wait for deployment
  await healthcareContract.deployed();
  
  console.log("✅ HealthcareRecords deployed to:", healthcareContract.address);
  console.log("🔗 Transaction hash:", healthcareContract.deployTransaction.hash);
  
  // Get deployment details
  const deploymentReceipt = await healthcareContract.deployTransaction.wait();
  console.log("⛽ Gas used:", deploymentReceipt.gasUsed.toString());
  console.log("🏗️  Block number:", deploymentReceipt.blockNumber);
  
  // Verify admin is set correctly
  const admin = await healthcareContract.admin();
  console.log("👨‍💼 Contract admin:", admin);
  console.log("✓ Admin verification:", admin === deployer.address ? "CORRECT" : "ERROR");
  
  // Get initial stats
  const stats = await healthcareContract.getStats();
  console.log("📊 Initial Stats:");
  console.log("   - Patient Count:", stats[0].toString());
  console.log("   - Doctor Count:", stats[1].toString());
  console.log("   - Total Records:", stats[2].toString());
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress: healthcareContract.address,
    deployer: deployer.address,
    admin: admin,
    network: hre.network.name,
    deploymentBlock: deploymentReceipt.blockNumber,
    gasUsed: deploymentReceipt.gasUsed.toString(),
    transactionHash: healthcareContract.deployTransaction.hash,
    timestamp: new Date().toISOString()
  };
  
  // Write deployment info to file
  const fs = require('fs');
  const path = require('path');
  
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const deploymentFile = path.join(deploymentsDir, `healthcare-${hre.network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("💾 Deployment info saved to:", deploymentFile);
  
  // Optional: Register sample data for testing
  if (hre.network.name === "localhost" || hre.network.name === "hardhat") {
    console.log("\n🧪 Adding sample data for testing...");
    await addSampleData(healthcareContract, deployer);
  }
  
  console.log("\n🎉 Deployment completed successfully!");
  console.log("📝 Next steps:");
  console.log("   1. Verify the contract on block explorer (if on testnet/mainnet)");
  console.log("   2. Update your frontend with the new contract address");
  console.log("   3. Test contract functions");
  
  return healthcareContract;
}

async function addSampleData(contract, deployer) {
  try {
    console.log("   Adding sample doctor...");
    
    // Get additional test accounts
    const [, doctor1, patient1] = await ethers.getSigners();
    
    // Register a sample doctor
    await contract.connect(doctor1).registerDoctor(
      "Dr. John Smith",
      "Cardiology",
      "LICENSE123456"
    );
    
    // Verify the doctor (admin function)
    await contract.connect(deployer).verifyDoctor(doctor1.address);
    
    // Register a sample patient
    await contract.connect(patient1).registerPatient(
      "Alice Johnson",
      30,
      "O+"
    );
    
    // Authorize doctor for patient
    await contract.connect(patient1).authorizeDoctor(doctor1.address);
    
    // Add a medical record
    await contract.connect(doctor1).addMedicalRecord(
      patient1.address,
      "Regular checkup - Heart rate normal",
      "Continue current medication",
      "Aspirin 81mg daily"
    );
    
    console.log("   ✅ Sample data added:");
    console.log("      - Doctor:", doctor1.address);
    console.log("      - Patient:", patient1.address);
    console.log("      - Medical record created");
    
    // Display updated stats
    const newStats = await contract.getStats();
    console.log("   📊 Updated Stats:");
    console.log("      - Patient Count:", newStats[0].toString());
    console.log("      - Doctor Count:", newStats[1].toString());
    console.log("      - Total Records:", newStats[2].toString());
    
  } catch (error) {
    console.log("   ⚠️  Error adding sample data:", error.message);
  }
}

// Error handling
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });