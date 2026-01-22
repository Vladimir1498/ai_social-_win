import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import FileUpload from './components/FileUpload';
import StyleSelector from './components/StyleSelector';
import BalanceDisplay from './components/BalanceDisplay';
import ResponseDisplay from './components/ResponseDisplay';
import Analysis from './components/Analysis';
import Rehearsal from './components/Rehearsal';

// Set axios base URL to backend
axios.defaults.baseURL = 'https://ai-social-win.onrender.com'; // v1.0

function AppContent() {
  const [balance, setBalance] = useState(0);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [analysisData, setAnalysisData] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const initData = window.Telegram.WebApp.initData;
      if (initData) {
        axios.defaults.headers.common['x-init-data'] = initData;
        // Clear hash if it contains initData to avoid routing issues
        if (window.location.hash.includes('tgWebAppData')) {
          window.history.replaceState(null, null, window.location.pathname + window.location.search);
        }
      }
    }
    fetchBalance();
    fetchPremium();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await axios.get('/api/user/balance');
      setBalance(response.data.balance);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPremium = async () => {
    try {
      const response = await axios.get('/api/user/premium');
      setIsPremium(response.data.isPremium);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('style', selectedStyle);
    formData.append('gender', selectedGender);

    try {
      const response = await axios.post('/api/ai/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResponses(response.data.responses);

      // Fetch analysis
      const analysisResponse = await axios.post('/api/ai/analyze-full', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAnalysisData(analysisResponse.data);

      fetchBalance();
    } catch (error) {
      alert(error.response?.data?.error || error.message);
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
      });
      if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.openInvoice(response.data.invoiceLink, (status) => {
          if (status === 'paid') {
            fetchBalance();
          } else if (status === 'cancelled') {
            alert('Платеж отменен');
          } else if (status === 'failed') {
            alert('Платеж не удался');
          }
        });
      } else {
        window.open(response.data.invoiceLink, '_blank');
      }
    } catch (error) {
      alert('Ошибка при создании платежа: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans pb-20">
      <Routes>
        <Route path="/" element={
          <div className="p-6">
            <div className="max-w-md mx-auto">
              <h1 className="text-3xl font-light text-center mb-8 text-gray-900">AI Social Wingman</h1>
              <div className="space-y-6">
                <BalanceDisplay balance={balance} onPurchase={handlePurchase} />
                <FileUpload onFileSelect={setSelectedFile} />
                <StyleSelector onStyleSelect={setSelectedStyle} />
                <div className="mb-6">
                  <label className="block text-lg font-medium text-gray-900 mb-3">Пол собеседника</label>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setSelectedGender('М')}
                      className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                        selectedGender === 'М' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Мужской 👨
                    </button>
                    <button
                      onClick={() => setSelectedGender('Ж')}
                      className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                        selectedGender === 'Ж' ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Женский 👩
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={!selectedFile || !selectedStyle || !selectedGender || loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-3 px-4 rounded-xl mt-6 font-medium transition-colors duration-200 shadow-sm"
                >
                  {loading ? 'Анализ...' : 'Проанализировать'}
                </button>
                <ResponseDisplay responses={responses} />
                {analysisData && (
                  <Link to="/analysis" className="block w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl text-center font-medium transition-colors duration-200 shadow-sm">
                    Перейти к анализу
                  </Link>
                )}
              </div>
            </div>
          </div>
        } />
        <Route path="/analysis" element={<Analysis data={analysisData} isPremium={isPremium} />} />
        <Route path="/rehearsal" element={<Rehearsal />} />
      </Routes>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <Link to="/" className={`flex flex-col items-center py-2 px-4 rounded-lg ${location.pathname === '/' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}>
            <span className="text-lg">⚡</span>
            <span className="text-xs mt-1">Генератор</span>
          </Link>
          <Link to="/analysis" className={`flex flex-col items-center py-2 px-4 rounded-lg ${location.pathname === '/analysis' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}>
            <span className="text-lg">📊</span>
            <span className="text-xs mt-1">Анализ</span>
          </Link>
          <Link to="/rehearsal" className={`flex flex-col items-center py-2 px-4 rounded-lg ${location.pathname === '/rehearsal' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}>
            <span className="text-lg">🎭</span>
            <span className="text-xs mt-1">Репетиция</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

function App() {
  return (
    <Router basename="/ai_social-_win">
      <AppContent />
    </Router>
  );
}

export default App;