import { useEffect, useState } from 'react';
import { init, initData } from '@twa-dev/sdk';
import axios from 'axios';
import FileUpload from './components/FileUpload';
import StyleSelector from './components/StyleSelector';
import BalanceDisplay from './components/BalanceDisplay';
import ResponseDisplay from './components/ResponseDisplay';

function App() {
  const [balance, setBalance] = useState(0);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState('');

  useEffect(() => {
    init();
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await axios.get('/api/user/balance', {
        headers: { 'x-init-data': initData }
      });
      setBalance(response.data.balance);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('style', selectedStyle);

    try {
      const response = await axios.post('/api/ai/analyze', formData, {
        headers: { 'x-init-data': initData, 'Content-Type': 'multipart/form-data' }
      });
      setResponses(response.data.responses);
      fetchBalance();
    } catch (error) {
      alert(error.response.data.error);
    }
    setLoading(false);
  };

  const handlePurchase = async () => {
    try {
      const response = await axios.post('/api/payment/create-invoice', {
        title: '10 генераций',
        description: 'Купить 10 генераций ответов',
        payload: '10_generations',
        currency: 'XTR',
        prices: [{ label: '10 генераций', amount: 50 }]
      }, {
        headers: { 'x-init-data': initData }
      });
      window.open(response.data.invoiceLink, '_blank');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-4">AI Social Wingman</h1>
      <BalanceDisplay balance={balance} onPurchase={handlePurchase} />
      <FileUpload onFileSelect={setSelectedFile} />
      <StyleSelector onStyleSelect={setSelectedStyle} />
      <button
        onClick={handleAnalyze}
        disabled={!selectedFile || !selectedStyle || loading}
        className="w-full bg-blue-500 text-white py-2 rounded mt-4"
      >
        {loading ? 'Анализ...' : 'Проанализировать'}
      </button>
      <ResponseDisplay responses={responses} />
    </div>
  );
}

export default App;