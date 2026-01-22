import axios from 'axios';

function ResponseDisplay({ responses }) {
  if (!responses.length) return null;

  const handleCopy = async (response) => {
    navigator.clipboard.writeText(response);
    // Update is_copied for the latest response
    try {
      await axios.post('/api/response/mark-copied');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Варианты ответов</h2>
      <div className="space-y-4">
        {responses.map((response, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
              </div>
              <div className="flex-1">
                <p className="text-gray-800 leading-relaxed">{response}</p>
                <button
                  onClick={() => handleCopy(response)}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  Копировать
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResponseDisplay;