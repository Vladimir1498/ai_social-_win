import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Analysis({ data, isPremium: initialPremium }) {
  const [isPremium, setIsPremium] = useState(initialPremium);
  const navigate = useNavigate();

  const handleUnlock = async () => {
    try {
      const response = await axios.post('/api/payment/create-invoice', {
        title: 'Разблокировка анализа',
        description: 'Разблокировать полный анализ за 50 звезд',
        payload: 'unlock_analysis',
        currency: 'XTR',
        prices: [{ label: 'Разблокировка анализа', amount: 50 }]
      });
      if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.openInvoice(response.data.invoiceLink, (status) => {
          if (status === 'paid') {
            setIsPremium(true);
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

  if (!data) {
    return (
      <div className="min-h-screen bg-white p-6 font-sans">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-semibold mb-4">Анализ недоступен</h1>
          <p className="text-gray-600">Сначала загрузите скриншот и получите ответы.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 font-sans">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-semibold text-center mb-8">Разбор полетов</h1>

        {/* Score Circle */}
        <div className="flex justify-center mb-8">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="2"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray={`${data.interest_score * 10}, 100`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-gray-900">{data.interest_score}/10</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className={`p-4 rounded-lg ${isPremium ? 'bg-green-50' : 'bg-gray-50 filter blur-sm'}`}>
            <h3 className="font-semibold text-green-600 mb-2">Плюсы 🟢</h3>
            <ul className="text-sm space-y-1">
              {data.green_flags.map((flag, index) => (
                <li key={index}>• {flag}</li>
              ))}
            </ul>
          </div>
          <div className={`p-4 rounded-lg ${isPremium ? 'bg-red-50' : 'bg-gray-50 filter blur-sm'}`}>
            <h3 className="font-semibold text-red-600 mb-2">Риски 🔴</h3>
            <ul className="text-sm space-y-1">
              {data.red_flags.map((flag, index) => (
                <li key={index}>• {flag}</li>
              ))}
            </ul>
          </div>
        </div>

        {!isPremium && (
          <div className="text-center mb-6">
            <button onClick={handleUnlock} className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-medium">
              Разблокировать за 50 ⭐
            </button>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg">
           <h3 className="font-semibold mb-2">Анализ</h3>
           <p className="text-sm text-gray-700">{data.analysis}</p>
         </div>

         <button
           onClick={async () => {
             if (!data.screenshot_text) {
               alert('Текст скриншота не найден. Попробуйте перезагрузить анализ.');
               return;
             }
             try {
               const screenshotText = Array.isArray(data.screenshot_text) ? data.screenshot_text.join('\n') : data.screenshot_text;
               await axios.post('/api/session/create', { screenshotText });
               navigate('/rehearsal');
             } catch (error) {
               console.error(error);
               alert('Ошибка создания сессии: ' + (error.response?.data?.error || error.message));
             }
           }}
           className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-xl text-center font-medium transition-colors duration-200 shadow-sm mt-6"
         >
           Репетировать
         </button>
       </div>
     </div>
   );
 }

export default Analysis;