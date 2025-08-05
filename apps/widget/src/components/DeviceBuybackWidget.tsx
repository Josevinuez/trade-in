import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDeviceStore } from '../store/deviceStore';
import { DeviceType, DeviceBrand, StorageOption } from '@device-buyback/types';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Smartphone, Tablet, Laptop, Watch, X, Check, AlertCircle } from 'lucide-react';
import { ChevronRight } from 'lucide-react';

interface DeviceBuybackWidgetProps {
  showForm?: boolean;
  setShowForm?: (show: boolean) => void;
}

interface DeviceCategory {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
}

interface DeviceModel {
  id: number;
  name: string;
  brand: { name: string };
  category: { name: string };
  storageOptions: Array<{
    id: number;
    storage: string;
    excellentPrice: number;
    goodPrice: number;
    fairPrice: number;
    poorPrice: number;
  }>;
}

interface DeviceCondition {
  id: number;
  name: string;
  multiplier: number;
}

const STEPS = ['type', 'brand', 'model', 'storage', 'condition', 'quote', 'customerInfo'] as const;
type Step = typeof STEPS[number];

export function DeviceBuybackWidget({ showForm = false, setShowForm }: DeviceBuybackWidgetProps) {
  const [currentStep, setCurrentStep] = useState<Step>('type');
  const { device, setDevice, quote, calculateQuote } = useDeviceStore();
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    familyName: '',
    email: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    phone: '',
    paymentMethod: 'e-transfer',
    acceptTerms: false,
    shippingLabel: false,
  });

  // Backend data
  const [deviceCategories, setDeviceCategories] = useState<DeviceCategory[]>([]);
  const [deviceModels, setDeviceModels] = useState<DeviceModel[]>([]);
  const [deviceConditions, setDeviceConditions] = useState<DeviceCondition[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<DeviceCategory | null>(null);
  const [selectedDeviceModel, setSelectedDeviceModel] = useState<DeviceModel | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<DeviceCondition | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<string>('');
  const [quoteAmount, setQuoteAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch device data from backend
  useEffect(() => {
    const fetchDeviceData = async () => {
      try {
        const [catalogResponse, conditionsResponse] = await Promise.all([
          fetch('/api/devices/catalog'),
          fetch('/api/devices/conditions')
        ]);
        
        if (catalogResponse.ok) {
          const catalogData = await catalogResponse.json();
          setDeviceCategories(catalogData.categories || []);
          setDeviceModels(catalogData.models || []);
        }
        
        if (conditionsResponse.ok) {
          const conditionsData = await conditionsResponse.json();
          setDeviceConditions(conditionsData.conditions || []);
        }
      } catch (error) {
        console.error('Error fetching device data:', error);
      }
    };

    fetchDeviceData();
  }, []);

  const isStepComplete = () => {
    switch (currentStep) {
      case 'type':
        return !!device?.type;
      case 'brand':
        return !!device?.brand;
      case 'model':
        return selectedDeviceModel !== null;
      case 'storage':
        return selectedStorage !== '';
      case 'condition':
        return selectedCondition !== null;
      case 'quote':
        return quoteAmount > 0;
      case 'customerInfo':
        return customerInfo.firstName && customerInfo.familyName && customerInfo.email && 
               customerInfo.address && customerInfo.city && customerInfo.province && 
               customerInfo.postalCode && customerInfo.phone && customerInfo.acceptTerms;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (isStepComplete()) {
      const currentIndex = STEPS.indexOf(currentStep);
      if (currentIndex < STEPS.length - 1) {
        setCurrentStep(STEPS[currentIndex + 1]);
      }
    }
  };

  const handleBack = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1]);
    }
  };

  const handleDeviceTypeSelect = (categoryName: string) => {
    const category = deviceCategories.find(cat => cat.name === categoryName);
    if (category) {
      setSelectedCategory(category);
      setDevice({ type: categoryName as DeviceType, brand: undefined, model: undefined, storage: undefined, condition: undefined });
      setCurrentStep('brand');
    }
  };

  const handleBrandSelect = (brandName: string) => {
    setDevice({ ...device, brand: brandName as DeviceBrand, model: undefined, storage: undefined, condition: undefined });
    setSelectedDeviceModel(null);
    setSelectedStorage('');
    setSelectedCondition(null);
    setQuoteAmount(0);
    setCurrentStep('model');
  };

  // Filter brands by selected category
  const filteredBrands = deviceModels
    .filter(model => model.category.name === selectedCategory?.name)
    .map(model => model.brand.name)
    .filter((brandName, index, self) => self.indexOf(brandName) === index);

  // Filter models by selected category and brand
  const filteredModels = deviceModels.filter(model => 
    model.category.name === selectedCategory?.name && 
    model.brand.name === device?.brand
  );

  const handleModelSelect = (model: DeviceModel) => {
    setSelectedDeviceModel(model);
    setDevice({ model: model.name });
    setSelectedStorage('');
    setSelectedCondition(null);
    setQuoteAmount(0);
  };

  const handleStorageSelect = (storage: string) => {
    setSelectedStorage(storage);
    setDevice({ storage: storage as StorageOption });
    setSelectedCondition(null);
    setQuoteAmount(0);
  };

  const handleConditionSelect = (condition: DeviceCondition) => {
    setSelectedCondition(condition);
    setDevice({ condition: condition.name as any });
    
    // Calculate quote
    if (selectedDeviceModel && selectedStorage) {
      const storageOption = selectedDeviceModel.storageOptions.find(opt => opt.storage === selectedStorage);
      if (storageOption) {
        let price = 0;
        switch (condition.name.toLowerCase()) {
          case 'excellent':
            price = storageOption.excellentPrice;
            break;
          case 'good':
            price = storageOption.goodPrice;
            break;
          case 'fair':
            price = storageOption.fairPrice;
            break;
          case 'poor':
            price = storageOption.poorPrice;
            break;
        }
        setQuoteAmount(price);
      }
    }
  };

  const handleSubmit = async () => {
    if (!isStepComplete()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/trade-in/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerEmail: customerInfo.email,
          customerName: `${customerInfo.firstName} ${customerInfo.familyName}`,
          customerPhone: customerInfo.phone,
          customerAddress: customerInfo.address,
          customerCity: customerInfo.city,
          customerProvince: customerInfo.province,
          customerPostalCode: customerInfo.postalCode,
          deviceModelId: selectedDeviceModel?.id,
          deviceConditionId: selectedCondition?.id,
          quotedAmount: quoteAmount,
          paymentMethod: customerInfo.paymentMethod,
          notes: `Shipping label: ${customerInfo.shippingLabel}`,
        }),
      });

      if (response.ok) {
        setShowSuccess(true);
        // Reset form
        setCurrentStep('type');
        setDevice({ type: undefined, brand: undefined, model: undefined, storage: undefined, condition: undefined });
        setSelectedDeviceModel(null);
        setSelectedStorage('');
        setSelectedCondition(null);
        setQuoteAmount(0);
        setCustomerInfo({
          firstName: '',
          familyName: '',
          email: '',
          address: '',
          city: '',
          province: '',
          postalCode: '',
          phone: '',
          paymentMethod: 'e-transfer',
          acceptTerms: false,
          shippingLabel: false,
        });
      } else {
        throw new Error('Failed to submit trade-in');
      }
    } catch (error) {
      console.error('Error submitting trade-in:', error);
      alert('Failed to submit trade-in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = (step: Step) => {
    switch (step) {
      case 'type':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">What type of device are you selling?</h2>
            <div className="grid grid-cols-2 gap-4">
              {deviceCategories.map((category) => (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDeviceTypeSelect(category.name)}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    device?.type === category.name
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    {category.icon && <img src={category.icon} alt={category.name} className="w-10 h-10" />}
                    <span className="font-medium">{category.name}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 'brand':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Select your device brand</h2>
            <div className="grid grid-cols-2 gap-4">
              {filteredBrands.map((brandName) => (
                <motion.button
                  key={brandName}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleBrandSelect(brandName)}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    device?.brand === brandName
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <span className="font-medium capitalize">{brandName}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 'model':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Select your device model</h2>
            <div className="grid grid-cols-2 gap-4">
              {filteredModels.map((model) => (
                <motion.button
                  key={model.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleModelSelect(model)}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    selectedDeviceModel?.id === model.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <span className="font-medium text-center">{model.name}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 'storage':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Select storage capacity</h2>
            {selectedDeviceModel?.storageOptions && selectedDeviceModel.storageOptions.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {selectedDeviceModel.storageOptions.map((option) => (
                  <motion.button
                    key={option.storage}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStorageSelect(option.storage)}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      selectedStorage === option.storage
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <span className="font-medium">{option.storage}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No storage options available for this device.</p>
              </div>
            )}
          </div>
        );

      case 'condition':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">What's the condition of your device?</h2>
            <div className="grid grid-cols-2 gap-4">
              {deviceConditions.map((condition) => (
                <motion.button
                  key={condition.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleConditionSelect(condition)}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    selectedCondition?.id === condition.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <span className="font-medium capitalize">{condition.name}</span>
                    <span className="text-sm text-gray-600">
                      {condition.multiplier * 100}% of original value
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 'quote':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Your Quote</h2>
            <Card className="p-6">
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Device:</span>
                  <span className="font-medium">{selectedDeviceModel?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Storage:</span>
                  <span className="font-medium">{selectedStorage}</span>
                </div>
                <div className="flex justify-between">
                  <span>Condition:</span>
                  <span className="font-medium capitalize">{selectedCondition?.name}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Your Quote:</span>
                    <span className="text-green-600">${quoteAmount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'customerInfo':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Your Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={customerInfo.firstName}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, firstName: e.target.value })}
                  className="p-3 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={customerInfo.familyName}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, familyName: e.target.value })}
                  className="p-3 border rounded-lg"
                />
              </div>
              <input
                type="email"
                placeholder="Email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Street Address"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                className="w-full p-3 border rounded-lg"
              />
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="City"
                  value={customerInfo.city}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                  className="p-3 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Province"
                  value={customerInfo.province}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, province: e.target.value })}
                  className="p-3 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Postal Code"
                  value={customerInfo.postalCode}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, postalCode: e.target.value })}
                  className="p-3 border rounded-lg"
                />
              </div>
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium">Payment Method</span>
                  <select
                    value={customerInfo.paymentMethod}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, paymentMethod: e.target.value })}
                    className="w-full p-3 border rounded-lg mt-1"
                  >
                    <option value="e-transfer">E-transfer</option>
                    <option value="paypal">PayPal</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={customerInfo.shippingLabel}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, shippingLabel: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">I need a shipping label</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={customerInfo.acceptTerms}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, acceptTerms: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">I accept the terms and conditions</span>
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // If not showing form, show the landing page
  if (!showForm) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Get an instant quote for your device
          </h1>
          <p className="text-xl text-gray-600">
            Sell your used electronics quickly and securely
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
          {deviceCategories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm?.(true)}
              className="p-6 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all"
            >
              <div className="flex flex-col items-center space-y-2">
                {category.icon && <img src={category.icon} alt={category.name} className="w-10 h-10" />}
                <span className="font-medium">{category.name}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // Modal form
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={() => setShowForm?.(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Trade In Your Device</h1>
              <button
                onClick={() => setShowForm?.(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <Progress value={(STEPS.indexOf(currentStep) + 1) / STEPS.length * 100} className="mb-6" />

            <div className="min-h-[400px]">
              {renderStep(currentStep)}
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={handleBack}
                disabled={currentStep === 'type'}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                Back
              </button>
              
              {currentStep === 'customerInfo' ? (
                <button
                  onClick={handleSubmit}
                  disabled={!isStepComplete() || isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Trade-In'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!isStepComplete()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 