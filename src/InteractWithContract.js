import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import DataLeasing from './artifacts/contracts/DataLeasing.sol/DataLeasing.json';
import './InteractWithContract.css'; // Import CSS file
import Loading from './components/Loading'; // Import Loading component

function InteractWithContract() {
  const [duration, setDuration] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state
  const [success, setSuccess] = useState(false); // Add success state
  const [error, setError] = useState(false); // Add error state
  const blockAddress = '0x7E04219A3cBBa97e0Ef6d783f1aa56eB6E891D58';

  useEffect(() => {
    // Check MetaMask state changes
    window.ethereum.on('chainChanged', handleChainChanged);

    // Cleanup function
    return () => {
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  const handleChainChanged = () => {
    setLoading(true); // Set loading to true when MetaMask confirms transaction
  };

  async function handleLeaseData() {
    try {
      setLoading(true); // Set loading to true when leasing starts
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
   
      const signer = provider.getSigner();

      const contract = new ethers.Contract(blockAddress, DataLeasing.abi, signer);
      
      const durationInSeconds = parseInt(duration, 10);

      const tx = await contract.leaseData(durationInSeconds, { value: ethers.utils.parseEther('0.1') });

      await tx.wait();

      setMessage('Data leased successfully!');
      setSuccess(true); // Set success to true when leasing is successful
    } catch (error) {
      console.error('Error leasing data:', error);
      setMessage('Error leasing data. See console for details.');
      setError(true); // Set error to true when an error occurs
    } finally {
      setLoading(false); // Set loading to false when leasing completes (whether success or failure)
    }
  }

  return (
    <div className="container">
      {loading ? ( // Render loading component when loading is true
        <Loading />
      ) : success ? ( // Render success page when success is true
        <div className="success-container">
          <h2>Success!</h2>
          <p>{message}</p>
        </div>
      ) : error ? ( // Render error page when error is true
        <div className="error-container">
          <h2>Error!</h2>
          <p>{message}</p>
        </div>
      ) : (
        <div className="animated-container">
          <h2>Lease Data</h2>
          <label htmlFor="duration">Duration (seconds):</label>
          <input
            id="duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
          <button className="animated-button" onClick={handleLeaseData}>Lease Data</button> {/* Add class to button */}
          <p>{message}</p>
        </div>
      )}
    </div>
  );
}

export default InteractWithContract;