function BalanceDisplay({ balance, onPurchase }) {
  return (
    <div className="mb-4 flex justify-between items-center">
      <p className="text-lg">Баланс: {balance} генераций</p>
      <button onClick={onPurchase} className="bg-yellow-500 text-white px-4 py-2 rounded">
        Купить 10 за 50 ⭐
      </button>
    </div>
  );
}

export default BalanceDisplay;