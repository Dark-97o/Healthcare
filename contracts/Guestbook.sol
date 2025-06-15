// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HealthcareManagement {
    struct Patient {
        string ipfsHash; // Encrypted health records stored on IPFS
        bool isActive;
        uint256 createdAt;
        uint256 updatedAt;
        bool isEmergencyContact;
    }

    struct Doctor {
        string ipfsHash; // Doctor credentials and info on IPFS
        bool isVerified;
        bool isActive;
        uint256 createdAt;
        string specialization;
    }

    struct Appointment {
        address patient;
        address doctor;
        uint256 scheduledTime;
        uint256 createdAt;
        bool isCompleted;
        bool isCancelled;
        string notes; // Optional notes
    }

    struct MedicalRecord {
        address doctor;
        uint256 timestamp;
        string ipfsHash; // Encrypted medical record on IPFS
        string recordType; // "consultation", "test", "prescription", etc.
    }

    // Mappings
    mapping(address => Patient) public patients;
    mapping(address => Doctor) public doctors;
    mapping(uint256 => Appointment) public appointments;
    mapping(address => uint256[]) public patientAppointments;
    mapping(address => uint256[]) public doctorAppointments;
    mapping(address => MedicalRecord[]) public patientRecords;
    mapping(address => mapping(address => bool)) public patientDoctorAccess;

    // State variables
    address public owner;
    uint256 private appointmentCounter;
    address[] public registeredDoctors;
    address[] public registeredPatients;

    // Events
    event PatientRegistered(address indexed patient, string ipfsHash);
    event DoctorRegistered(address indexed doctor, string ipfsHash, string specialization);
    event DoctorVerified(address indexed doctor);
    event AppointmentScheduled(uint256 indexed appointmentId, address indexed patient, address indexed doctor, uint256 scheduledTime);
    event AppointmentCompleted(uint256 indexed appointmentId);
    event AppointmentCancelled(uint256 indexed appointmentId);
    event MedicalRecordAdded(address indexed patient, address indexed doctor, string recordType);
    event AccessGranted(address indexed patient, address indexed doctor);
    event AccessRevoked(address indexed patient, address indexed doctor);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyPatient() {
        require(patients[msg.sender].isActive, "Not a registered patient");
        _;
    }

    modifier onlyDoctor() {
        require(doctors[msg.sender].isActive, "Not a registered doctor");
        _;
    }

    modifier onlyVerifiedDoctor() {
        require(doctors[msg.sender].isActive && doctors[msg.sender].isVerified, "Not a verified doctor");
        _;
    }

    constructor() {
        owner = msg.sender;
        appointmentCounter = 1;
    }

    // Ownership functions
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        owner = newOwner;
    }

    // Patient functions
    function registerAsPatient(string calldata ipfsHash, bool isEmergencyContact) external {
        require(bytes(ipfsHash).length > 0, "IPFS hash required");
        require(!patients[msg.sender].isActive, "Already registered as patient");

        patients[msg.sender] = Patient({
            ipfsHash: ipfsHash,
            isActive: true,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            isEmergencyContact: isEmergencyContact
        });

        registeredPatients.push(msg.sender);
        emit PatientRegistered(msg.sender, ipfsHash);
    }

    function updatePatientProfile(string calldata ipfsHash, bool isEmergencyContact) external onlyPatient {
        require(bytes(ipfsHash).length > 0, "IPFS hash required");
        
        patients[msg.sender].ipfsHash = ipfsHash;
        patients[msg.sender].updatedAt = block.timestamp;
        patients[msg.sender].isEmergencyContact = isEmergencyContact;
    }

    // Doctor functions
    function registerAsDoctor(string calldata ipfsHash, string calldata specialization) external {
        require(bytes(ipfsHash).length > 0, "IPFS hash required");
        require(bytes(specialization).length > 0, "Specialization required");
        require(!doctors[msg.sender].isActive, "Already registered as doctor");

        doctors[msg.sender] = Doctor({
            ipfsHash: ipfsHash,
            isVerified: false,
            isActive: true,
            createdAt: block.timestamp,
            specialization: specialization
        });

        registeredDoctors.push(msg.sender);
        emit DoctorRegistered(msg.sender, ipfsHash, specialization);
    }

    function verifyDoctor(address doctor) external onlyOwner {
        require(doctors[doctor].isActive, "Doctor not registered");
        require(!doctors[doctor].isVerified, "Already verified");
        
        doctors[doctor].isVerified = true;
        emit DoctorVerified(doctor);
    }

    // Appointment functions
    function scheduleAppointment(address doctor, uint256 scheduledTime, string calldata notes) external onlyPatient {
        require(doctors[doctor].isActive && doctors[doctor].isVerified, "Doctor not available");
        require(scheduledTime > block.timestamp, "Cannot schedule in the past");
        require(patientDoctorAccess[msg.sender][doctor], "No access granted to this doctor");

        uint256 appointmentId = appointmentCounter++;
        
        appointments[appointmentId] = Appointment({
            patient: msg.sender,
            doctor: doctor,
            scheduledTime: scheduledTime,
            createdAt: block.timestamp,
            isCompleted: false,
            isCancelled: false,
            notes: notes
        });

        patientAppointments[msg.sender].push(appointmentId);
        doctorAppointments[doctor].push(appointmentId);

        emit AppointmentScheduled(appointmentId, msg.sender, doctor, scheduledTime);
    }

    function completeAppointment(uint256 appointmentId) external onlyVerifiedDoctor {
        require(appointments[appointmentId].doctor == msg.sender, "Not your appointment");
        require(!appointments[appointmentId].isCompleted, "Already completed");
        require(!appointments[appointmentId].isCancelled, "Appointment cancelled");

        appointments[appointmentId].isCompleted = true;
        emit AppointmentCompleted(appointmentId);
    }

    function cancelAppointment(uint256 appointmentId) external {
        Appointment storage apt = appointments[appointmentId];
        require(apt.patient == msg.sender || apt.doctor == msg.sender, "Not authorized");
        require(!apt.isCompleted, "Cannot cancel completed appointment");
        require(!apt.isCancelled, "Already cancelled");

        apt.isCancelled = true;
        emit AppointmentCancelled(appointmentId);
    }

    // Medical Records functions
    function addMedicalRecord(address patient, string calldata ipfsHash, string calldata recordType) external onlyVerifiedDoctor {
        require(patients[patient].isActive, "Patient not registered");
        require(patientDoctorAccess[patient][msg.sender], "No access to patient records");
        require(bytes(ipfsHash).length > 0, "IPFS hash required");
        require(bytes(recordType).length > 0, "Record type required");

        patientRecords[patient].push(MedicalRecord({
            doctor: msg.sender,
            timestamp: block.timestamp,
            ipfsHash: ipfsHash,
            recordType: recordType
        }));

        emit MedicalRecordAdded(patient, msg.sender, recordType);
    }

    // Access Control functions
    function grantDoctorAccess(address doctor) external onlyPatient {
        require(doctors[doctor].isActive && doctors[doctor].isVerified, "Doctor not available");
        require(!patientDoctorAccess[msg.sender][doctor], "Access already granted");

        patientDoctorAccess[msg.sender][doctor] = true;
        emit AccessGranted(msg.sender, doctor);
    }

    function revokeDoctorAccess(address doctor) external onlyPatient {
        require(patientDoctorAccess[msg.sender][doctor], "Access not granted");

        patientDoctorAccess[msg.sender][doctor] = false;
        emit AccessRevoked(msg.sender, doctor);
    }

    // View functions
    function getPatientAppointments(address patient) external view returns (uint256[] memory) {
        return patientAppointments[patient];
    }

    function getDoctorAppointments(address doctor) external view returns (uint256[] memory) {
        return doctorAppointments[doctor];
    }

    function getPatientRecordCount(address patient) external view returns (uint256) {
        return patientRecords[patient].length;
    }

    function getPatientRecord(address patient, uint256 index) external view returns (address doctor, uint256 timestamp, string memory ipfsHash, string memory recordType) {
        require(index < patientRecords[patient].length, "Invalid record index");
        require(
            msg.sender == patient || 
            (doctors[msg.sender].isVerified && patientDoctorAccess[patient][msg.sender]),
            "No access to records"
        );

        MedicalRecord storage record = patientRecords[patient][index];
        return (record.doctor, record.timestamp, record.ipfsHash, record.recordType);
    }

    function getVerifiedDoctors() external view returns (address[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < registeredDoctors.length; i++) {
            if (doctors[registeredDoctors[i]].isVerified) {
                count++;
            }
        }

        address[] memory result = new address[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < registeredDoctors.length; i++) {
            if (doctors[registeredDoctors[i]].isVerified) {
                result[index++] = registeredDoctors[i];
            }
        }

        return result;
    }

    function hasAccess(address patient, address doctor) external view returns (bool) {
        return patientDoctorAccess[patient][doctor];
    }

    function isPatientRegistered(address user) external view returns (bool) {
        return patients[user].isActive;
    }

    function isDoctorVerified(address user) external view returns (bool) {
        return doctors[user].isActive && doctors[user].isVerified;
    }
}