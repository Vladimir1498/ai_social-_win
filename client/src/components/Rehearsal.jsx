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
    }
  };

  const selectSession = (session) => {
    setSelectedSession(session);
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
        <h1 className="text-2xl font-semibold text-center mb-8">Репетиция свидания</h1>
        {!selectedSession ? (
          <div>
            <h2 className="text-lg font-medium mb-4">Активные чаты</h2>
            {sessions.length === 0 ? (
              <p className="text-gray-600">Нет активных сессий. Создайте из анализа.</p>
            ) : (
              <ul className="space-y-2">
                {sessions.map((session) => (
                  <li key={session._id} className="p-4 bg-gray-50 rounded-lg cursor-pointer" onClick={() => selectSession(session)}>
                    <p className="text-sm">Сессия от {new Date(session.createdAt).toLocaleDateString()}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div>
            <button onClick={() => setSelectedSession(null)} className="mb-4 text-blue-600">← Назад к списку</button>
            <div className="bg-gray-50 p-4 rounded-lg h-96 overflow-y-auto mb-4">
              {selectedSession.messages.map((msg, index) => (
                <div key={index} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <span className={`inline-block p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}>
                    {msg.content}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1 p-2 border rounded-l-lg"
                placeholder="Введите сообщение..."
              />
              <button onClick={sendMessage} disabled={loading} className="bg-blue-600 text-white px-4 rounded-r-lg disabled:bg-gray-400">
                {loading ? '...' : 'Отправить'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Rehearsal;