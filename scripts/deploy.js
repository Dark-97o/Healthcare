// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

// Configuration constants
const DEFAULT_SAMPLE_DATA = false;
const DEFAULT_VERIFICATION_DELAY = 0; // seconds

module.exports = buildModule("HealthcareModule", (m) => {
  // Parameters for deployment configuration
  const addSampleData = m.getParameter("addSampleData", DEFAULT_SAMPLE_DATA);
  const verificationDelay = m.getParameter("verificationDelay", DEFAULT_VERIFICATION_DELAY);

  // Deploy the HealthcareRecords contract
  // The contract constructor sets msg.sender as admin automatically
  const healthcareRecords = m.contract("HealthcareRecords", []);

  // Add deployment metadata
  const deploymentInfo = {
    contractName: "HealthcareRecords",
    version: "1.0.0",
    deployedAt: new Date().toISOString(),
    features: [
      "Patient Registration",
      "Doctor Verification", 
      "Medical Records Management",
      "Access Control System"
    ]
  };

  return { 
    healthcareRecords,
    deploymentInfo,
    // Configuration used
    config: {
      addSampleData,
      verificationDelay
    }
  };
});