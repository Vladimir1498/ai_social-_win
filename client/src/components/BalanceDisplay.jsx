function BalanceDisplay({ balance, onPurchase }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-4 shadow-sm">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">Баланс</p>
          <p className="text-2xl font-semibold text-gray-900">{balance} генераций</p>
        </div>
        <button
          onClick={onPurchase}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          Купить 10 за 50 ⭐
        </button>
      </div>
    </div>
  );
}

export default BalanceDisplay;