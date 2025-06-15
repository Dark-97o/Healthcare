// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HealthcareRecords {
    struct Patient {
        string name;
        uint256 age;
        string bloodType;
        address patientAddress;
        bool isRegistered;
        uint256 recordCount;
        mapping(uint256 => MedicalRecord) records;
        mapping(address => bool) authorizedDoctors;
    }

    struct MedicalRecord {
        uint256 recordId;
        address doctor;
        string diagnosis;
        string treatment;
        string medications;
        uint256 timestamp;
        bool isActive;
    }

    struct Doctor {
        string name;
        string specialization;
        string licenseNumber;
        address doctorAddress;
        bool isVerified;
        uint256 patientCount;
    }

    uint256 public patientCount;
    uint256 public doctorCount;
    uint256 public totalRecords;

    mapping(address => Patient) private patients;
    mapping(address => Doctor) private doctors;
    mapping(address => bool) public registeredPatients;
    mapping(address => bool) public registeredDoctors;

    address public admin;

    event PatientRegistered(address indexed patient, string name);
    event DoctorRegistered(address indexed doctor, string name, string specialization);
    event DoctorAuthorized(address indexed patient, address indexed doctor);
    event RecordAdded(address indexed patient, uint256 recordId, address indexed doctor);
    event DoctorVerified(address indexed doctor);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }

    modifier onlyRegisteredPatient() {
        require(registeredPatients[msg.sender], "Patient not registered");
        _;
    }

    modifier onlyRegisteredDoctor() {
        require(registeredDoctors[msg.sender], "Doctor not registered");
        _;
    }

    modifier onlyVerifiedDoctor() {
        require(doctors[msg.sender].isVerified, "Doctor not verified");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function registerPatient(
        string calldata _name,
        uint256 _age,
        string calldata _bloodType
    ) external {
        require(!registeredPatients[msg.sender], "Patient already registered");
        require(_age > 0, "Age must be greater than 0");

        Patient storage p = patients[msg.sender];
        p.name = _name;
        p.age = _age;
        p.bloodType = _bloodType;
        p.patientAddress = msg.sender;
        p.isRegistered = true;
        p.recordCount = 0;

        registeredPatients[msg.sender] = true;
        patientCount++;

        emit PatientRegistered(msg.sender, _name);
    }

    function registerDoctor(
        string calldata _name,
        string calldata _specialization,
        string calldata _licenseNumber
    ) external {
        require(!registeredDoctors[msg.sender], "Doctor already registered");

        Doctor storage d = doctors[msg.sender];
        d.name = _name;
        d.specialization = _specialization;
        d.licenseNumber = _licenseNumber;
        d.doctorAddress = msg.sender;
        d.isVerified = false;
        d.patientCount = 0;

        registeredDoctors[msg.sender] = true;
        doctorCount++;

        emit DoctorRegistered(msg.sender, _name, _specialization);
    }

    function verifyDoctor(address _doctorAddress) 
        external 
        onlyAdmin 
    {
        require(registeredDoctors[_doctorAddress], "Doctor not registered");
        doctors[_doctorAddress].isVerified = true;
        emit DoctorVerified(_doctorAddress);
    }

    function authorizeDoctor(address _doctorAddress) 
        external 
        onlyRegisteredPatient 
    {
        require(registeredDoctors[_doctorAddress], "Doctor not registered");
        require(doctors[_doctorAddress].isVerified, "Doctor not verified");
        
        patients[msg.sender].authorizedDoctors[_doctorAddress] = true;
        emit DoctorAuthorized(msg.sender, _doctorAddress);
    }

    function addMedicalRecord(
        address _patientAddress,
        string calldata _diagnosis,
        string calldata _treatment,
        string calldata _medications
    ) external onlyRegisteredDoctor onlyVerifiedDoctor {
        require(registeredPatients[_patientAddress], "Patient not registered");
        require(patients[_patientAddress].authorizedDoctors[msg.sender], "Doctor not authorized");

        Patient storage p = patients[_patientAddress];
        p.recordCount++;
        totalRecords++;

        MedicalRecord storage record = p.records[p.recordCount];
        record.recordId = p.recordCount;
        record.doctor = msg.sender;
        record.diagnosis = _diagnosis;
        record.treatment = _treatment;
        record.medications = _medications;
        record.timestamp = block.timestamp;
        record.isActive = true;

        doctors[msg.sender].patientCount++;

        emit RecordAdded(_patientAddress, p.recordCount, msg.sender);
    }

    function getPatientInfo(address _patientAddress) 
        external 
        view 
        returns (
            string memory name,
            uint256 age,
            string memory bloodType,
            uint256 recordCount,
            bool isRegistered
        ) 
    {
        require(_patientAddress == msg.sender || registeredDoctors[msg.sender], "Access denied");
        require(registeredPatients[_patientAddress], "Patient not registered");
        
        if (registeredDoctors[msg.sender]) {
            require(patients[_patientAddress].authorizedDoctors[msg.sender], "Doctor not authorized");
        }

        Patient storage p = patients[_patientAddress];
        return (p.name, p.age, p.bloodType, p.recordCount, p.isRegistered);
    }

    function getMedicalRecord(address _patientAddress, uint256 _recordId) 
        external 
        view 
        returns (
            address doctor,
            string memory diagnosis,
            string memory treatment,
            string memory medications,
            uint256 timestamp,
            bool isActive
        ) 
    {
        require(_patientAddress == msg.sender || registeredDoctors[msg.sender], "Access denied");
        require(registeredPatients[_patientAddress], "Patient not registered");
        
        if (registeredDoctors[msg.sender]) {
            require(patients[_patientAddress].authorizedDoctors[msg.sender], "Doctor not authorized");
        }

        Patient storage p = patients[_patientAddress];
        require(_recordId > 0 && _recordId <= p.recordCount, "Invalid record ID");

        MedicalRecord storage record = p.records[_recordId];
        return (
            record.doctor,
            record.diagnosis,
            record.treatment,
            record.medications,
            record.timestamp,
            record.isActive
        );
    }

    function getDoctorInfo(address _doctorAddress) 
        external 
        view 
        returns (
            string memory name,
            string memory specialization,
            bool isVerified,
            uint256 patientCount
        ) 
    {
        require(registeredDoctors[_doctorAddress], "Doctor not registered");
        Doctor storage d = doctors[_doctorAddress];
        return (d.name, d.specialization, d.isVerified, d.patientCount);
    }

    function revokeDoctor(address _doctorAddress) 
        external 
        onlyRegisteredPatient 
    {
        patients[msg.sender].authorizedDoctors[_doctorAddress] = false;
    }

    function isAuthorized(address _patientAddress, address _doctorAddress) 
        external 
        view 
        returns (bool) 
    {
        return patients[_patientAddress].authorizedDoctors[_doctorAddress];
    }

    function getStats() 
        external 
        view 
        returns (uint256, uint256, uint256) 
    {
        return (patientCount, doctorCount, totalRecords);
    }
}