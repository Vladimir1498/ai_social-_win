import { useState, useEffect } from 'react';
import axios from 'axios';

function Rehearsal() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await axios.get('/api/session');
      setSessions(response.data);
    } catch (error) {
      console.error(error);
      alert('Ошибка загрузки сессий: ' + (error.response?.data?.error || error.message));
    }
  };

  const selectSession = (session) => {
    setSelectedSession(session);
  };

  const deleteSession = async (sessionId) => {
    try {
      await axios.post(`/api/session/${sessionId}/end`);
      setSessions(sessions.filter(s => s._id !== sessionId));
    } catch (error) {
      console.error(error);
      alert('Ошибка удаления сессии');
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedSession) return;
    setLoading(true);
    try {
      const response = await axios.post(`/api/session/${selectedSession._id}/message`, { message });
      setSelectedSession({ ...selectedSession, messages: [...selectedSession.messages, { role: 'user', content: message }, { role: 'assistant', content: response.data.response }] });
      setMessage('');
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white p-6 font-sans">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-semibold text-center mb-8">🎭 Репетиция свидания</h1>
        {!selectedSession ? (
          <div>
            <h2 className="text-lg font-medium mb-4">💬 Активные чаты</h2>
            {sessions.length === 0 ? (
              <p className="text-gray-600 text-center">Нет активных сессий. Создайте из анализа.</p>
            ) : (
              <ul className="space-y-3">
                {sessions.map((session) => (
                  <li key={session._id} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
                    <div className="cursor-pointer flex-1" onClick={() => selectSession(session)}>
                      <p className="text-sm font-medium text-gray-800">🗓️ Сессия от {new Date(session.createdAt).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-600">Нажмите для чата</p>
                    </div>
                    <button onClick={() => deleteSession(session._id)} className="ml-3 px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors">🗑️ Удалить</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div>
            <button onClick={() => setSelectedSession(null)} className="mb-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">← Назад к списку</button>
            <div className="bg-gradient-to-b from-gray-50 to-white p-4 rounded-xl h-96 overflow-y-auto mb-4 shadow-inner border">
              {selectedSession.messages.map((msg, index) => (
                <div key={index} className={`mb-3 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <span className={`inline-block p-3 rounded-2xl max-w-xs break-words ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-black border border-gray-300'}`}>
                    {msg.content}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="💬 Введите сообщение..."
              />
              <button onClick={sendMessage} disabled={loading} className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 transition-colors">
                {loading ? '⏳' : '📤 Отправить'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Rehearsal;