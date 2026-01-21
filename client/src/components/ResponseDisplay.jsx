function ResponseDisplay({ responses }) {
  if (!responses.length) return null;

  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold mb-2">Варианты ответов:</h2>
      <ul className="list-disc list-inside">
        {responses.map((response, index) => (
          <li key={index} className="mb-2">{response}</li>
        ))}
      </ul>
    </div>
  );
}

export default ResponseDisplay;