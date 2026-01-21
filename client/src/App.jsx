import { useEffect, useState } from 'react';
import { init, initData } from '@twa-dev/sdk';
import axios from 'axios';
import FileUpload from './components/FileUpload';
import StyleSelector from './components/StyleSelector';
import BalanceDisplay from './components/BalanceDisplay';
import ResponseDisplay from './components/ResponseDisplay';

// Set axios base URL to backend
axios.defaults.baseURL = 'https://ai-social-win.onrender.com';

function App() {
  const [balance, setBalance] = useState(0);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState('');

  useEffect(() => {
    try {
      init();
    } catch (error) {
      console.warn('TWA SDK init failed:', error);
    }
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
    <div className="min-h-screen bg-white p-6 font-sans">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-light text-center mb-8 text-gray-900">AI Social Wingman</h1>
        <div className="space-y-6">
          <BalanceDisplay balance={balance} onPurchase={handlePurchase} />
          <FileUpload onFileSelect={setSelectedFile} />
          <StyleSelector onStyleSelect={setSelectedStyle} />
          <button
            onClick={handleAnalyze}
            disabled={!selectedFile || !selectedStyle || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-3 px-4 rounded-xl mt-6 font-medium transition-colors duration-200 shadow-sm"
          >
            {loading ? 'Анализ...' : 'Проанализировать'}
          </button>
          <ResponseDisplay responses={responses} />
        </div>
      </div>
    </div>
  );
}

export default App;