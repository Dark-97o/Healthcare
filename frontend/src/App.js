import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';

const CONTRACT_ADDRESS = '0x01D7678257D96280F6c882484ee8037bb79E6af7';

const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "patient",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "doctor",
        "type": "address"
      }
    ],
    "name": "AccessGranted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "patient",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "doctor",
        "type": "address"
      }
    ],
    "name": "AccessRevoked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "appointmentId",
        "type": "uint256"
      }
    ],
    "name": "AppointmentCancelled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "appointmentId",
        "type": "uint256"
      }
    ],
    "name": "AppointmentCompleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "appointmentId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "patient",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "doctor",
        "type": "address"
      }
    ],
    "name": "AppointmentScheduled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "doctor",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "specialization",
        "type": "string"
      }
    ],
    "name": "DoctorRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "doctor",
        "type": "address"
      }
    ],
    "name": "DoctorVerified",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "patient",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "doctor",
        "type": "address"
      }
    ],
    "name": "MedicalRecordAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "patient",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      }
    ],
    "name": "PatientRegistered",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "patientAddress",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "diagnosis",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "treatment",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "medicationHash",
        "type": "string"
      }
    ],
    "name": "addMedicalRecord",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "appointments",
    "outputs": [
      {
        "internalType": "address",
        "name": "patient",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "doctor",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "scheduledTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "duration",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "notes",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "isCompleted",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "isCancelled",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "createdAt",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "appointmentId",
        "type": "uint256"
      }
    ],
    "name": "cancelAppointment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "appointmentId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "notes",
        "type": "string"
      }
    ],
    "name": "completeAppointment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "doctors",
    "outputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "specialization",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "licenseNumber",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "isVerified",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "createdAt",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getActiveDoctors",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getDoctorAppointments",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "patientAddress",
        "type": "address"
      }
    ],
    "name": "getMedicalRecords",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "doctor",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "diagnosis",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "treatment",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "medicationHash",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct HealthcareSystem.MedicalRecord[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPatientAppointments",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "doctorAddress",
        "type": "address"
      }
    ],
    "name": "grantDoctorAccess",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "patientAddress",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "doctorAddress",
        "type": "address"
      }
    ],
    "name": "hasAccess",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "patients",
    "outputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "age",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "medicalRecordHash",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "createdAt",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "updatedAt",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "specialization",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "licenseNumber",
        "type": "string"
      }
    ],
    "name": "registerDoctor",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "age",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "medicalRecordHash",
        "type": "string"
      }
    ],
    "name": "registerPatient",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "doctorAddress",
        "type": "address"
      }
    ],
    "name": "revokeDoctorAccess",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "doctorAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "scheduledTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "duration",
        "type": "uint256"
      }
    ],
    "name": "scheduleAppointment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "medicalRecordHash",
        "type": "string"
      }
    ],
    "name": "updatePatientRecord",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "doctorAddress",
        "type": "address"
      }
    ],
    "name": "verifyDoctor",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

function App() {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [userType, setUserType] = useState('patient');
  const [activeTab, setActiveTab] = useState('register');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Form states
  const [patientForm, setPatientForm] = useState({ name: '', age: '', medicalRecordHash: '' });
  const [doctorForm, setDoctorForm] = useState({ name: '', specialization: '', licenseNumber: '' });
  const [appointmentForm, setAppointmentForm] = useState({ doctorAddress: '', scheduledTime: '', duration: '' });
  const [medicalRecordForm, setMedicalRecordForm] = useState({ patientAddress: '', diagnosis: '', treatment: '', medicationHash: '' });
  
  // Data states
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [activeDoctors, setActiveDoctors] = useState([]);

  useEffect(() => {
    connectWallet();
  }, []);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        
        const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        setContract(contractInstance);
        
        setMessage('Wallet connected successfully!');
      } catch (error) {
        setMessage('Error connecting wallet: ' + error.message);
      }
    } else {
      setMessage('Please install MetaMask!');
    }
  };

  const registerPatient = async () => {
    if (!contract) return;
    setLoading(true);
    try {
      const tx = await contract.registerPatient(
        patientForm.name,
        parseInt(patientForm.age),
        patientForm.medicalRecordHash
      );
      await tx.wait();
      setMessage('Patient registered successfully!');
      setPatientForm({ name: '', age: '', medicalRecordHash: '' });
    } catch (error) {
      setMessage('Error registering patient: ' + error.message);
    }
    setLoading(false);
  };

  const registerDoctor = async () => {
    if (!contract) return;
    setLoading(true);
    try {
      const tx = await contract.registerDoctor(
        doctorForm.name,
        doctorForm.specialization,
        doctorForm.licenseNumber
      );
      await tx.wait();
      setMessage('Doctor registered successfully!');
      setDoctorForm({ name: '', specialization: '', licenseNumber: '' });
    } catch (error) {
      setMessage('Error registering doctor: ' + error.message);
    }
    setLoading(false);
  };

  const scheduleAppointment = async () => {
    if (!contract) return;
    setLoading(true);
    try {
      const scheduledTime = Math.floor(new Date(appointmentForm.scheduledTime).getTime() / 1000);
      const tx = await contract.scheduleAppointment(
        appointmentForm.doctorAddress,
        scheduledTime,
        parseInt(appointmentForm.duration)
      );
      await tx.wait();
      setMessage('Appointment scheduled successfully!');
      setAppointmentForm({ doctorAddress: '', scheduledTime: '', duration: '' });
    } catch (error) {
      setMessage('Error scheduling appointment: ' + error.message);
    }
    setLoading(false);
  };

  const addMedicalRecord = async () => {
    if (!contract) return;
    setLoading(true);
    try {
      const tx = await contract.addMedicalRecord(
        medicalRecordForm.patientAddress,
        medicalRecordForm.diagnosis,
        medicalRecordForm.treatment,
        medicalRecordForm.medicationHash
      );
      await tx.wait();
      setMessage('Medical record added successfully!');
      setMedicalRecordForm({ patientAddress: '', diagnosis: '', treatment: '', medicationHash: '' });
    } catch (error) {
      setMessage('Error adding medical record: ' + error.message);
    }
    setLoading(false);
  };

  const loadPatientAppointments = async () => {
    if (!contract) return;
    setLoading(true);
    try {
      const appointmentIds = await contract.getPatientAppointments();
      const appointmentData = [];
      
      for (let id of appointmentIds) {
        const appointment = await contract.appointments(id);
        appointmentData.push({
          id: id.toString(),
          patient: appointment.patient,
          doctor: appointment.doctor,
          scheduledTime: new Date(appointment.scheduledTime.toNumber() * 1000).toLocaleString(),
          duration: appointment.duration.toString(),
          notes: appointment.notes,
          isCompleted: appointment.isCompleted,
          isCancelled: appointment.isCancelled
        });
      }
      setAppointments(appointmentData);
    } catch (error) {
      setMessage('Error loading appointments: ' + error.message);
    }
    setLoading(false);
  };

  const loadMedicalRecords = async () => {
    if (!contract || !account) return;
    setLoading(true);
    try {
      const records = await contract.getMedicalRecords(account);
      const formattedRecords = records.map(record => ({
        doctor: record.doctor,
        diagnosis: record.diagnosis,
        treatment: record.treatment,
        medicationHash: record.medicationHash,
        timestamp: new Date(record.timestamp.toNumber() * 1000).toLocaleString()
      }));
      setMedicalRecords(formattedRecords);
    } catch (error) {
      setMessage('Error loading medical records: ' + error.message);
    }
    setLoading(false);
  };

  const loadActiveDoctors = async () => {
    if (!contract) return;
    setLoading(true);
    try {
      const doctorAddresses = await contract.getActiveDoctors();
      const doctorData = [];
      
      for (let address of doctorAddresses) {
        const doctor = await contract.doctors(address);
        doctorData.push({
          address: address,
          name: doctor.name,
          specialization: doctor.specialization,
          licenseNumber: doctor.licenseNumber,
          isVerified: doctor.isVerified,
          isActive: doctor.isActive
        });
      }
      setActiveDoctors(doctorData);
    } catch (error) {
      setMessage('Error loading doctors: ' + error.message);
    }
    setLoading(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'register':
        return (
          <div className="tab-content">
            <div className="user-type-selector">
              <button 
                className={userType === 'patient' ? 'active' : ''}
                onClick={() => setUserType('patient')}
              >
                Patient
              </button>
              <button 
                className={userType === 'doctor' ? 'active' : ''}
                onClick={() => setUserType('doctor')}
              >
                Doctor
              </button>
            </div>
            
            {userType === 'patient' ? (
              <div className="form-section">
                <h3>Register as Patient</h3>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={patientForm.name}
                  onChange={(e) => setPatientForm({...patientForm, name: e.target.value})}
                />
                <input
                  type="number"
                  placeholder="Age"
                  value={patientForm.age}
                  onChange={(e) => setPatientForm({...patientForm, age: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Medical Record Hash"
                  value={patientForm.medicalRecordHash}
                  onChange={(e) => setPatientForm({...patientForm, medicalRecordHash: e.target.value})}
                />
                <button onClick={registerPatient} disabled={loading}>
                  {loading ? 'Registering...' : 'Register Patient'}
                </button>
              </div>
            ) : (
              <div className="form-section">
                <h3>Register as Doctor</h3>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={doctorForm.name}
                  onChange={(e) => setDoctorForm({...doctorForm, name: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Specialization"
                  value={doctorForm.specialization}
                  onChange={(e) => setDoctorForm({...doctorForm, specialization: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="License Number"
                  value={doctorForm.licenseNumber}
                  onChange={(e) => setDoctorForm({...doctorForm, licenseNumber: e.target.value})}
                />
                <button onClick={registerDoctor} disabled={loading}>
                  {loading ? 'Registering...' : 'Register Doctor'}
                </button>
              </div>
            )}
          </div>
        );
        
      case 'appointments':
        return (
          <div className="tab-content">
            <div className="form-section">
              <h3>Schedule Appointment</h3>
              <input
                type="text"
                placeholder="Doctor Address"
                value={appointmentForm.doctorAddress}
                onChange={(e) => setAppointmentForm({...appointmentForm, doctorAddress: e.target.value})}
              />
              <input
                type="datetime-local"
                value={appointmentForm.scheduledTime}
                onChange={(e) => setAppointmentForm({...appointmentForm, scheduledTime: e.target.value})}
              />
              <input
                type="number"
                placeholder="Duration (minutes)"
                value={appointmentForm.duration}
                onChange={(e) => setAppointmentForm({...appointmentForm, duration: e.target.value})}
              />
              <button onClick={scheduleAppointment} disabled={loading}>
                {loading ? 'Scheduling...' : 'Schedule Appointment'}
              </button>
            </div>
            
            <div className="data-section">
              <button onClick={loadPatientAppointments} disabled={loading}>
                Load My Appointments
              </button>
              
              {appointments.length > 0 && (
                <div className="appointments-list">
                  <h4>My Appointments</h4>
                  {appointments.map((appointment, index) => (
                    <div key={index} className="appointment-card">
                      <p><strong>ID:</strong> {appointment.id}</p>
                      <p><strong>Doctor:</strong> {appointment.doctor}</p>
                      <p><strong>Time:</strong> {appointment.scheduledTime}</p>
                      <p><strong>Duration:</strong> {appointment.duration} minutes</p>
                      <p><strong>Status:</strong> {appointment.isCompleted ? 'Completed' : appointment.isCancelled ? 'Cancelled' : 'Scheduled'}</p>
                      {appointment.notes && <p><strong>Notes:</strong> {appointment.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
        
      case 'records':
        return (
          <div className="tab-content">
            <div className="form-section">
              <h3>Add Medical Record</h3>
              <input
                type="text"
                placeholder="Patient Address"
                value={medicalRecordForm.patientAddress}
                onChange={(e) => setMedicalRecordForm({...medicalRecordForm, patientAddress: e.target.value})}
              />
              <input
                type="text"
                placeholder="Diagnosis"
                value={medicalRecordForm.diagnosis}
                onChange={(e) => setMedicalRecordForm({...medicalRecordForm, diagnosis: e.target.value})}
              />
              <input
                type="text"
                placeholder="Treatment"
                value={medicalRecordForm.treatment}
                onChange={(e) => setMedicalRecordForm({...medicalRecordForm, treatment: e.target.value})}
              />
              <input
                type="text"
                placeholder="Medication Hash"
                value={medicalRecordForm.medicationHash}
                onChange={(e) => setMedicalRecordForm({...medicalRecordForm, medicationHash: e.target.value})}
              />
              <button onClick={addMedicalRecord} disabled={loading}>
                {loading ? 'Adding...' : 'Add Medical Record'}
              </button>
            </div>
            
            <div className="data-section">
              <button onClick={loadMedicalRecords} disabled={loading}>
                Load My Medical Records
              </button>
              
              {medicalRecords.length > 0 && (
                <div className="records-list">
                  <h4>My Medical Records</h4>
                  {medicalRecords.map((record, index) => (
                    <div key={index} className="record-card">
                      <p><strong>Doctor:</strong> {record.doctor}</p>
                      <p><strong>Diagnosis:</strong> {record.diagnosis}</p>
                      <p><strong>Treatment:</strong> {record.treatment}</p>
                      <p><strong>Medication Hash:</strong> {record.medicationHash}</p>
                      <p><strong>Date:</strong> {record.timestamp}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
        
      case 'doctors':
        return (
          <div className="tab-content">
            <div className="data-section">
              <button onClick={loadActiveDoctors} disabled={loading}>
                Load Active Doctors
              </button>
              
              {activeDoctors.length > 0 && (
                <div className="doctors-list">
                  <h4>Active Doctors</h4>
                  {activeDoctors.map((doctor, index) => (
                    <div key={index} className="doctor-card">
                      <p><strong>Name:</strong> {doctor.name}</p>
                      <p><strong>Specialization:</strong> {doctor.specialization}</p>
                      <p><strong>License:</strong> {doctor.licenseNumber}</p>
                      <p><strong>Address:</strong> {doctor.address}</p>
                      <p><strong>Verified:</strong> {doctor.isVerified ? 'Yes' : 'No'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🏥 Healthcare System DApp</h1>
        
        {!account ? (
          <div className="wallet-section">
            <p>Please connect your wallet to continue</p>
            <button onClick={connectWallet} className="connect-btn">
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="main-content">
            <div className="account-info">
              <p>Connected Account: {account.slice(0, 6)}...{account.slice(-4)}</p>
              <p>Contract: {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)}</p>
            </div>
            
            <nav className="tab-navigation">
              <button 
                className={activeTab === 'register' ? 'active' : ''}
                onClick={() => setActiveTab('register')}
              >
                Register
              </button>
              <button 
                className={activeTab === 'appointments' ? 'active' : ''}
                onClick={() => setActiveTab('appointments')}
              >
                Appointments
              </button>
              <button 
                className={activeTab === 'records' ? 'active' : ''}
                onClick={() => setActiveTab('records')}
              >
                Medical Records
              </button>
              <button 
                className={activeTab === 'doctors' ? 'active' : ''}
                onClick={() => setActiveTab('doctors')}
              >
                Doctors
              </button>
            </nav>
            
            {renderTabContent()}
            
            {message && (
              <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                {message}
              </div>
            )}
          </div>
        )}
      </header>
      
      <style jsx>{`
        .App {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .App-header {
          background: rgba(40, 44, 52, 0.95);
          backdrop-filter: blur(10px);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 2rem;
          color: white;
        }
        
        h1 {
          margin-bottom: 2rem;
          font-size: 2.5rem;
          text-align: center;
          background: linear-gradient(45deg, #61dafb, #21d4fd);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .wallet-section {
          text-align: center;
        }
        
        .connect-btn {
          background: linear-gradient(45deg, #61dafb, #21d4fd);
          border: none;
          padding: 1rem 2rem;
          border-radius: 25px;
          color: white;
          font-size: 1.1rem;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 1rem;
        }
        
        .connect-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(97, 218, 251, 0.3);
        }
        
        .main-content {
          width: 100%;
          max-width: 1200px;
        }
        
        .account-info {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 1rem;
          border-radius: 15px;
          margin-bottom: 2rem;
          text-align: center;
        }
        
        .account-info p {
          margin: 0.5rem 0;
          font-size: 0.9rem;
        }
        
        .tab-navigation {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          justify-content: center;
        }
        
        .tab-navigation button {
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid transparent;
          padding: 0.8rem 1.5rem;
          border-radius: 25px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
        }
        
        .tab-navigation button:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }
        
        .tab-navigation button.active {
          background: linear-gradient(45deg, #61dafb, #21d4fd);
          border-color: #61dafb;
        }
        
        .tab-content {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 2rem;
          border-radius: 20px;
          margin-bottom: 2rem;
        }
        
        .user-type-selector {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 2rem;
        }
        
        .user-type-selector button {
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid transparent;
          padding: 0.8rem 1.5rem;
          border-radius: 25px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .user-type-selector button.active {
          background: linear-gradient(45deg, #ff6b6b, #ee5a24);
          border-color: #ff6b6b;
        }
        
        .form-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-width: 500px;
          margin: 0 auto 2rem;
        }
        
        .form-section h3 {
          text-align: center;
          margin-bottom: 1rem;
          color: #61dafb;
        }
        
        .form-section input {
          padding: 1rem;
          border: none;
          border-radius: 15px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 1rem;
          backdrop-filter: blur(10px);
        }
        
        .form-section input::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }
        
        .form-section button {
          background: linear-gradient(45deg, #10ac84, #00d2d3);
          border: none;
          padding: 1rem;
          border-radius: 15px;
          color: white;
          font-size: 1rem;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .form-section button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(16, 172, 132, 0.3);
        }
        
        .form-section button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .data-section {
          margin-top: 2rem;
        }
        
        .data-section button {
          background: linear-gradient(45deg, #5f27cd, #341f97);
          border: none;
          padding: 1rem 2rem;
          border-radius: 15px;
          color: white;
          font-size: 1rem;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          display: block;
          margin: 0 auto 2rem;
        }
        
        .data-section button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(95, 39, 205, 0.3);
        }
        
        .appointments-list, .records-list, .doctors-list {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }
        
        .appointment-card, .record-card, .doctor-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 1.5rem;
          border-radius: 15px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .appointment-card h4, .record-card h4, .doctor-card h4 {
          margin-top: 0;
          color: #61dafb;
          text-align: center;
        }
        
        .appointment-card p, .record-card p, .doctor-card p {
          margin: 0.5rem 0;
          font-size: 0.9rem;
          word-break: break-all;
        }
        
        .message {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 1rem;
          border-radius: 15px;
          margin-top: 1rem;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .message.success {
          border-color: #10ac84;
          background: rgba(16, 172, 132, 0.2);
        }
        
        .message.error {
          border-color: #ff6b6b;
          background: rgba(255, 107, 107, 0.2);
        }
        
        @media (max-width: 768px) {
          .App-header {
            padding: 1rem;
          }
          
          h1 {
            font-size: 2rem;
          }
          
          .tab-navigation {
            flex-wrap: wrap;
          }
          
          .tab-navigation button {
            padding: 0.6rem 1rem;
            font-size: 0.9rem;
          }
          
          .appointments-list, .records-list, .doctors-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default App;