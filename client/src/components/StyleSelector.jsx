function StyleSelector({ onStyleSelect }) {
  const styles = [
    { name: 'Смешной', emoji: '😄' },
    { name: 'Романтичный', emoji: '💕' },
    { name: 'Дерзкий', emoji: '😏' },
    { name: 'Милый', emoji: '🥰' },
    { name: 'Саркастичный', emoji: '😜' },
    { name: 'Загадочный', emoji: '🕵️' },
    { name: 'Ироничный', emoji: '🙃' },
    { name: 'Прямолинейный', emoji: '💪' },
    { name: 'Легкомысленный', emoji: '🌈' },
    { name: 'Как в анекдотах', emoji: '😂' }
  ];

  return (
    <div className="mb-6">
      <label className="block text-lg font-medium text-gray-900 mb-3">Выберите стиль ответа</label>
      <div className="grid grid-cols-1 gap-3">
        {styles.map(style => (
          <button
            key={style.name}
            onClick={() => onStyleSelect(style.name)}
            className="flex items-center justify-center p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <span className="text-2xl mr-3">{style.emoji}</span>
            <span className="text-lg font-medium text-gray-900">{style.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default StyleSelector;