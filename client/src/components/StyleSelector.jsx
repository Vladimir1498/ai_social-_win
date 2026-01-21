function StyleSelector({ onStyleSelect }) {
  const styles = ['Смешной', 'Романтичный', 'Дерзкий'];

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">Выберите стиль ответа</label>
      <select onChange={(e) => onStyleSelect(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md">
        <option value="">Выберите стиль</option>
        {styles.map(style => (
          <option key={style} value={style}>{style}</option>
        ))}
      </select>
    </div>
  );
}

export default StyleSelector;