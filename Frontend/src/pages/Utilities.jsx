import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, Scale, ArrowRightLeft, ArrowDownUp } from 'lucide-react';
import { convertCurrency, convertUnit } from '../services/utilities';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'SGD', 'THB', 'MMK'];

const UNIT_CATEGORIES = {
  Weight: ['Kilograms', 'Grams', 'Pounds', 'Ounces'],
  Length: ['Meters', 'Centimeters', 'Kilometers', 'Miles', 'Feet', 'Inches'],
  Volume: ['Liters', 'Milliliters', 'Gallons', 'Fluid Ounces'],
  Temperature: ['Celsius', 'Fahrenheit', 'Kelvin']
};

const Utilities = () => {
  const [activeTab, setActiveTab] = useState('currency'); // 'currency' or 'unit'

  // Currency State
  const [currAmount, setCurrAmount] = useState(1);
  const [fromCurr, setFromCurr] = useState('USD');
  const [toCurr, setToCurr] = useState('MMK');
  const [currResult, setCurrResult] = useState(null);
  const [isCurrLoading, setIsCurrLoading] = useState(false);

  // Unit State
  const [unitCategory, setUnitCategory] = useState('Weight');
  const [unitAmount, setUnitAmount] = useState(1);
  const [fromUnit, setFromUnit] = useState('Kilograms');
  const [toUnit, setToUnit] = useState('Pounds');
  const [unitResult, setUnitResult] = useState(null);
  const [isUnitLoading, setIsUnitLoading] = useState(false);

  // Currency Effect
  useEffect(() => {
    const fetchCurrency = async () => {
      setIsCurrLoading(true);
      try {
        const data = await convertCurrency(currAmount, fromCurr, toCurr);
        setCurrResult(data.result);
      } catch (error) {
        console.error("Failed to convert currency", error);
      } finally {
        setIsCurrLoading(false);
      }
    };
    
    // Add debounce for amount typing
    const timeoutId = setTimeout(() => {
      if (currAmount !== '' && !isNaN(currAmount)) {
        fetchCurrency();
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [currAmount, fromCurr, toCurr]);

  // Unit Effect
  useEffect(() => {
    const fetchUnit = async () => {
      setIsUnitLoading(true);
      try {
        const data = await convertUnit(unitAmount, unitCategory, fromUnit, toUnit);
        setUnitResult(data.result);
      } catch (error) {
        console.error("Failed to convert unit", error);
      } finally {
        setIsUnitLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (unitAmount !== '' && !isNaN(unitAmount)) {
        fetchUnit();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [unitAmount, unitCategory, fromUnit, toUnit]);

  // Handle Category Change
  const handleCategoryChange = (e) => {
    const newCat = e.target.value;
    setUnitCategory(newCat);
    setFromUnit(UNIT_CATEGORIES[newCat][0]);
    setToUnit(UNIT_CATEGORIES[newCat][1] || UNIT_CATEGORIES[newCat][0]);
  };

  const swapCurrency = () => {
    setFromCurr(toCurr);
    setToCurr(fromCurr);
  };

  const swapUnit = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 h-full flex flex-col items-center justify-center">
      
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-3 flex items-center justify-center space-x-3">
          <Calculator className="w-10 h-10 text-blue-500" />
          <span>Utilities</span>
        </h1>
        <p className="text-gray-400 text-lg">Everyday conversions powered by UKLA.</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-1 mb-8">
        <button 
          onClick={() => setActiveTab('currency')}
          className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
            activeTab === 'currency' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
          }`}
        >
          <DollarSign className="w-5 h-5" />
          <span>Currency</span>
        </button>
        <button 
          onClick={() => setActiveTab('unit')}
          className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
            activeTab === 'unit' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
          }`}
        >
          <Scale className="w-5 h-5" />
          <span>Units</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-xl bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Decorative background blur */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {activeTab === 'currency' && (
          <div className="relative z-10 flex flex-col space-y-6">
            <div className="flex justify-between items-end space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-400 mb-2">Amount</label>
                <input 
                  type="number"
                  value={currAmount}
                  onChange={(e) => setCurrAmount(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white text-2xl font-bold rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="w-32">
                <select 
                  value={fromCurr}
                  onChange={(e) => setFromCurr(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white text-lg rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 appearance-none text-center cursor-pointer"
                >
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="flex justify-center -my-2 relative z-20">
              <button 
                onClick={swapCurrency}
                className="bg-gray-800 p-3 rounded-full border border-gray-600 hover:bg-gray-700 transition-colors shadow-lg group"
              >
                <ArrowDownUp className="w-5 h-5 text-blue-400 group-hover:rotate-180 transition-transform duration-300" />
              </button>
            </div>

            <div className="flex justify-between items-end space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-400 mb-2">Converted Amount</label>
                <div className="w-full bg-gray-800/50 border border-transparent text-blue-400 text-3xl font-bold rounded-xl px-4 py-3 h-[60px] flex items-center">
                  {isCurrLoading ? <span className="animate-pulse">...</span> : currResult}
                </div>
              </div>
              <div className="w-32">
                <select 
                  value={toCurr}
                  onChange={(e) => setToCurr(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white text-lg rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 appearance-none text-center cursor-pointer"
                >
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            
            <p className="text-center text-sm text-gray-500 mt-4">Rates updated daily via open exchange API</p>
          </div>
        )}

        {activeTab === 'unit' && (
          <div className="relative z-10 flex flex-col space-y-6">
            
            <div className="flex justify-center mb-2">
              <select 
                value={unitCategory}
                onChange={handleCategoryChange}
                className="bg-gray-800 border border-gray-700 text-white text-lg font-medium rounded-xl px-6 py-2 focus:outline-none focus:border-blue-500 appearance-none text-center cursor-pointer shadow-sm"
              >
                {Object.keys(UNIT_CATEGORIES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="flex justify-between items-end space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-400 mb-2">Amount</label>
                <input 
                  type="number"
                  value={unitAmount}
                  onChange={(e) => setUnitAmount(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white text-2xl font-bold rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="w-40">
                <select 
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white text-lg rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 appearance-none text-center cursor-pointer truncate"
                >
                  {UNIT_CATEGORIES[unitCategory].map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div className="flex justify-center -my-2 relative z-20">
              <button 
                onClick={swapUnit}
                className="bg-gray-800 p-3 rounded-full border border-gray-600 hover:bg-gray-700 transition-colors shadow-lg group"
              >
                <ArrowDownUp className="w-5 h-5 text-blue-400 group-hover:rotate-180 transition-transform duration-300" />
              </button>
            </div>

            <div className="flex justify-between items-end space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-400 mb-2">Converted Amount</label>
                <div className="w-full bg-gray-800/50 border border-transparent text-blue-400 text-3xl font-bold rounded-xl px-4 py-3 h-[60px] flex items-center">
                  {isUnitLoading ? <span className="animate-pulse">...</span> : unitResult}
                </div>
              </div>
              <div className="w-40">
                <select 
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white text-lg rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 appearance-none text-center cursor-pointer truncate"
                >
                  {UNIT_CATEGORIES[unitCategory].map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Utilities;
