// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HealthcareSystem {
    struct Patient {
        string name;
        uint256 age;
        string medicalRecordHash; // IPFS hash for medical records
        bool isActive;
        uint256 createdAt;
        uint256 updatedAt;
    }

    struct Doctor {
        string name;
        string specialization;
        string licenseNumber;
        bool isVerified;
        bool isActive;
        uint256 createdAt;
    }

    struct Appointment {
        address patient;
        address doctor;
        uint256 scheduledTime;
        uint256 duration; // in minutes
        string notes;
        bool isCompleted;
        bool isCancelled;
        uint256 createdAt;
    }

    struct MedicalRecord {
        address doctor;
        string diagnosis;
        string treatment;
        string medicationHash; // IPFS hash for prescription details
        uint256 timestamp;
    }

    mapping(address => Patient) public patients;
    mapping(address => Doctor) public doctors;
    mapping(uint256 => Appointment) public appointments;
    mapping(address => uint256[]) private patientAppointments;
    mapping(address => uint256[]) private doctorAppointments;
    mapping(address => MedicalRecord[]) private medicalRecords;
    mapping(address => mapping(address => bool)) private patientDoctorAccess;

    uint256 private appointmentCounter;
    address public owner;
    address[] private activeDoctors;
    address[] private activePatients;

    event PatientRegistered(address indexed patient, string name);
    event DoctorRegistered(address indexed doctor, string name, string specialization);
    event DoctorVerified(address indexed doctor);
    event AppointmentScheduled(uint256 indexed appointmentId, address indexed patient, address indexed doctor);
    event AppointmentCompleted(uint256 indexed appointmentId);
    event AppointmentCancelled(uint256 indexed appointmentId);
    event MedicalRecordAdded(address indexed patient, address indexed doctor);
    event AccessGranted(address indexed patient, address indexed doctor);
    event AccessRevoked(address indexed patient, address indexed doctor);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyPatient() {
        require(patients[msg.sender].isActive, "Only registered patients");
        _;
    }

    modifier onlyDoctor() {
        require(doctors[msg.sender].isActive && doctors[msg.sender].isVerified, "Only verified doctors");
        _;
    }

    modifier onlyPatientOrDoctor() {
        require(patients[msg.sender].isActive || (doctors[msg.sender].isActive && doctors[msg.sender].isVerified), "Access denied");
        _;
    }

    constructor() {
        owner = msg.sender;
        appointmentCounter = 1;
    }

    function registerPatient(string calldata name, uint256 age, string calldata medicalRecordHash) external {
        require(bytes(name).length > 0, "Name required");
        require(age > 0 && age < 150, "Invalid age");
        require(!patients[msg.sender].isActive, "Patient already registered");

        patients[msg.sender] = Patient({
            name: name,
            age: age,
            medicalRecordHash: medicalRecordHash,
            isActive: true,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        activePatients.push(msg.sender);
        emit PatientRegistered(msg.sender, name);
    }

    function registerDoctor(string calldata name, string calldata specialization, string calldata licenseNumber) external {
        require(bytes(name).length > 0, "Name required");
        require(bytes(specialization).length > 0, "Specialization required");
        require(bytes(licenseNumber).length > 0, "License number required");
        require(!doctors[msg.sender].isActive, "Doctor already registered");

        doctors[msg.sender] = Doctor({
            name: name,
            specialization: specialization,
            licenseNumber: licenseNumber,
            isVerified: false,
            isActive: true,
            createdAt: block.timestamp
        });

        activeDoctors.push(msg.sender);
        emit DoctorRegistered(msg.sender, name, specialization);
    }

    function verifyDoctor(address doctorAddress) external onlyOwner {
        require(doctors[doctorAddress].isActive, "Doctor not found");
        require(!doctors[doctorAddress].isVerified, "Doctor already verified");

        doctors[doctorAddress].isVerified = true;
        emit DoctorVerified(doctorAddress);
    }

    function scheduleAppointment(address doctorAddress, uint256 scheduledTime, uint256 duration) external onlyPatient {
        require(doctors[doctorAddress].isActive && doctors[doctorAddress].isVerified, "Doctor not available");
        require(scheduledTime > block.timestamp, "Invalid appointment time");
        require(duration > 0, "Invalid duration");

        uint256 appointmentId = appointmentCounter++;

        appointments[appointmentId] = Appointment({
            patient: msg.sender,
            doctor: doctorAddress,
            scheduledTime: scheduledTime,
            duration: duration,
            notes: "",
            isCompleted: false,
            isCancelled: false,
            createdAt: block.timestamp
        });

        patientAppointments[msg.sender].push(appointmentId);
        doctorAppointments[doctorAddress].push(appointmentId);

        emit AppointmentScheduled(appointmentId, msg.sender, doctorAddress);
    }

    function completeAppointment(uint256 appointmentId, string calldata notes) external onlyDoctor {
        require(appointments[appointmentId].doctor == msg.sender, "Not your appointment");
        require(!appointments[appointmentId].isCompleted, "Already completed");
        require(!appointments[appointmentId].isCancelled, "Appointment cancelled");

        appointments[appointmentId].isCompleted = true;
        appointments[appointmentId].notes = notes;

        emit AppointmentCompleted(appointmentId);
    }

    function cancelAppointment(uint256 appointmentId) external onlyPatientOrDoctor {
        Appointment storage apt = appointments[appointmentId];
        require(apt.patient == msg.sender || apt.doctor == msg.sender, "Not authorized");
        require(!apt.isCompleted, "Cannot cancel completed appointment");
        require(!apt.isCancelled, "Already cancelled");

        apt.isCancelled = true;
        emit AppointmentCancelled(appointmentId);
    }

    function addMedicalRecord(address patientAddress, string calldata diagnosis, string calldata treatment, string calldata medicationHash) external onlyDoctor {
        require(patients[patientAddress].isActive, "Patient not found");
        require(patientDoctorAccess[patientAddress][msg.sender], "Access not granted by patient");

        MedicalRecord memory record = MedicalRecord({
            doctor: msg.sender,
            diagnosis: diagnosis,
            treatment: treatment,
            medicationHash: medicationHash,
            timestamp: block.timestamp
        });

        medicalRecords[patientAddress].push(record);
        emit MedicalRecordAdded(patientAddress, msg.sender);
    }

    function grantDoctorAccess(address doctorAddress) external onlyPatient {
        require(doctors[doctorAddress].isActive && doctors[doctorAddress].isVerified, "Doctor not available");
        require(!patientDoctorAccess[msg.sender][doctorAddress], "Access already granted");

        patientDoctorAccess[msg.sender][doctorAddress] = true;
        emit AccessGranted(msg.sender, doctorAddress);
    }

    function revokeDoctorAccess(address doctorAddress) external onlyPatient {
        require(patientDoctorAccess[msg.sender][doctorAddress], "Access not granted");

        patientDoctorAccess[msg.sender][doctorAddress] = false;
        emit AccessRevoked(msg.sender, doctorAddress);
    }

    function getPatientAppointments() external view onlyPatient returns (uint256[] memory) {
        return patientAppointments[msg.sender];
    }

    function getDoctorAppointments() external view onlyDoctor returns (uint256[] memory) {
        return doctorAppointments[msg.sender];
    }

    function getMedicalRecords(address patientAddress) external view returns (MedicalRecord[] memory) {
        require(
            msg.sender == patientAddress || 
            (doctors[msg.sender].isVerified && patientDoctorAccess[patientAddress][msg.sender]),
            "Access denied"
        );
        return medicalRecords[patientAddress];
    }

    function hasAccess(address patientAddress, address doctorAddress) external view returns (bool) {
        return patientDoctorAccess[patientAddress][doctorAddress];
    }

    function getActiveDoctors() external view returns (address[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < activeDoctors.length; i++) {
            if (doctors[activeDoctors[i]].isActive && doctors[activeDoctors[i]].isVerified) {
                count++;
            }
        }

        address[] memory result = new address[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < activeDoctors.length; i++) {
            if (doctors[activeDoctors[i]].isActive && doctors[activeDoctors[i]].isVerified) {
                result[index++] = activeDoctors[i];
            }
        }
        return result;
    }

    function updatePatientRecord(string calldata medicalRecordHash) external onlyPatient {
        patients[msg.sender].medicalRecordHash = medicalRecordHash;
        patients[msg.sender].updatedAt = block.timestamp;
    }
}