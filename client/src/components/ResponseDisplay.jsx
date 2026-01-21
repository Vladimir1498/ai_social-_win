function ResponseDisplay({ responses }) {
  if (!responses.length) return null;

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
              <p className="text-gray-800 leading-relaxed">{response}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResponseDisplay;