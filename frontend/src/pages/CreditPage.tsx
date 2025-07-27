// src/components/CreditPage.tsx
import React, { useEffect, useState, useRef } from "react";
import { fetchCredit } from "../api/profile";
import { initCreditPurchase, uploadBankTransferProof } from "../api/payment";
import StudentCreditHistory from "./StudentCreditHistory";

const CreditPage: React.FC = () => {
  const [credit, setCredit] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [amount, setAmount] = useState<string>("");
  const [transferType, setTransferType] = useState<string>("bank");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCredit().then(response => {
      if (response?.success) {
        setCredit(response?.data?.credit || 0);
      } else {
        console.error("Failed to load credit:", response?.error || "Unknown error");
      }
    });
  }, []);

  const handleOnlinePurchase = async () => {
    try {
      if (!amount || parseFloat(amount) <= 0) {
        setMessage({ text: "Please enter a valid amount", type: "error" });
        return;
      }

      const response = await initCreditPurchase(parseFloat(amount));
      // Redirect to payment gateway
      window.location.href = response.paymentUrl;
    } catch (error) {
      setMessage({ text: "Failed to initialize payment", type: "error" });
    }
  };

  const handleTransferProofUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setMessage(null);

    try {
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error("Please enter a valid amount");
      }

      if (!fileInputRef.current?.files?.[0]) {
        throw new Error("Please select a proof file");
      }

      const formData = new FormData();
      formData.append("proofFile", fileInputRef.current.files[0]);
      formData.append("amount", amount);
      formData.append("transferDate", new Date().toISOString());
      formData.append("type", transferType);

      const response = await uploadBankTransferProof(formData);
      setMessage({ 
        text: "Proof uploaded successfully. Our team will verify your transfer soon.", 
        type: "success" 
      });
      
      // Reset form
      setAmount("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } catch (error) {
      setMessage({ 
        text: error instanceof Error ? error.message : "Failed to upload proof", 
        type: "error" 
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <h2>My Credit</h2>
      <p>Your current credit: <b>{credit} TND</b></p>

      {message && (
        <div style={{ 
          padding: '10px', 
          margin: '10px 0', 
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24',
          borderRadius: '4px'
        }}>
          {message.text}
        </div>
      )}

      <h3>Buy Credit</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>1. Choose your payment method:</h4>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '15px' }}>
            <b>Bank Transfer (Virement bancaire)</b><br />
            RIB: <span style={{ fontWeight: "bold" }}>123 456 789 000 12345678</span>
          </li>
          <li style={{ marginBottom: '15px' }}>
            <b>Postal Transfer (Virement postale)</b><br />
            RIB: <span style={{ fontWeight: "bold" }}>987 654 321 000 87654321</span>
          </li>
          <li style={{ marginBottom: '15px' }}>
            <b>D17 post app</b><br />
            Send to phone: <b>+216 55 377 225</b>
          </li>
        </ul>

        <h4>2. Make your payment and upload proof:</h4>
        <form onSubmit={handleTransferProofUpload} style={{ maxWidth: '400px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Transfer Type:
              <select 
                value={transferType}
                onChange={(e) => setTransferType(e.target.value)}
                style={{ 
                  width: '100%',
                  padding: '8px',
                  marginTop: '5px'
                }}
              >
                <option value="bank">Bank Transfer</option>
                <option value="postal">Postal Transfer</option>
                <option value="d17">D17 Transfer</option>
              </select>
            </label>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Amount (TND):
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.001"
                required
                style={{ 
                  width: '100%',
                  padding: '8px',
                  marginTop: '5px'
                }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Upload Proof (Image or PDF):
              <input
                type="file"
                ref={fileInputRef}
                accept=".jpg,.jpeg,.png,.pdf"
                required
                style={{ 
                  width: '100%',
                  marginTop: '5px'
                }}
              />
            </label>
          </div>

          <button 
            type="submit" 
            disabled={isUploading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              opacity: isUploading ? 0.7 : 1
            }}
          >
            {isUploading ? 'Uploading...' : 'Upload Proof'}
          </button>
        </form>

        <h4>3. Online Payment (Credit Card):</h4>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Amount (TND):
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.001"
              style={{ 
                width: '200px',
                padding: '8px',
                marginLeft: '10px'
              }}
            />
          </label>
          <button 
            onClick={handleOnlinePurchase}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Pay Online
          </button>
        </div>
      </div>

      <hr />
      <StudentCreditHistory />
    </div>
  );
};

export default CreditPage;
