import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDeviceStore } from '../store/deviceStore';
import { DeviceType, DeviceBrand, StorageOption, DeviceCondition } from '@device-buyback/types';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Smartphone, Tablet, Laptop, Watch, CheckCircle, Loader2 } from 'lucide-react';
import { ChevronRight } from 'lucide-react';

const DEVICE_TYPES: { type: DeviceType; icon: React.ReactNode; label: string }[] = [
  { type: 'smartphone', icon: <Smartphone className="w-6 h-6" />, label: 'Smartphone' },
  { type: 'tablet', icon: <Tablet className="w-6 h-6" />, label: 'Tablet' },
  { type: 'laptop', icon: <Laptop className="w-6 h-6" />, label: 'Laptop' },
  { type: 'smartwatch', icon: <Watch className="w-6 h-6" />, label: 'Smartwatch' },
];

const STEPS = ['type', 'brand', 'model', 'storage', 'condition', 'quote', 'customerInfo'] as const;
type Step = typeof STEPS[number];

// Dynamic device catalog will be loaded from API
const brands = {
  smartphone: [] as DeviceBrand[],
  tablet: [] as DeviceBrand[],
  laptop: [] as DeviceBrand[],
  smartwatch: [] as DeviceBrand[],
};

const models = {
  smartphone: {} as Record<string, any[]>,
  tablet: {} as Record<string, any[]>,
  laptop: {} as Record<string, any[]>,
  smartwatch: {} as Record<string, any[]>,
};

// Storage options will be loaded dynamically from API based on selected device
let storageOptions: StorageOption[] = [];
// Conditions will be loaded dynamically from API
const conditions: DeviceCondition[] = [];

// Brand logos will be populated dynamically from API
const brandLogos: Record<string, string> = {};

interface DeviceBuybackWidgetProps {
  showForm?: boolean;
  setShowForm?: (show: boolean) => void;
}

export function DeviceBuybackWidget({ showForm: externalShowForm, setShowForm: externalSetShowForm }: DeviceBuybackWidgetProps = {}) {
  const [internalShowForm, setInternalShowForm] = useState(false);
  
  // Use external state if provided, otherwise use internal state
  const showForm = externalShowForm !== undefined ? externalShowForm : internalShowForm;
  const setShowForm = externalSetShowForm || setInternalShowForm;

  const [currentStep, setCurrentStep] = useState<Step>('type');
  const { device, setDevice, quote, calculateQuote, deviceCatalog, setDeviceCatalog } = useDeviceStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    familyName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    shippingLabel: false,
    paymentMethod: 'e-transfer',
    paymentEmail: '',
    acceptTerms: false,
  });

  // Fetch device catalog from API and process data
  useEffect(() => {
    const fetchDeviceCatalog = async () => {
      try {
        const response = await fetch('/api/devices/catalog');
        const data = await response.json();
        setDeviceCatalog(data);
        
        // Process the data to populate dynamic brands and models
        if (data.categories && data.brands && data.models) {
          // Group brands by category
          const brandsByCategory: Record<string, string[]> = {};
          const modelsByCategory: Record<string, Record<string, any[]>> = {};
          
          data.categories.forEach((category: any) => {
            const categoryName = category.name.toLowerCase();
            brandsByCategory[categoryName] = [];
            modelsByCategory[categoryName] = {};
          });
          
          // Group models by brand and category
          data.models.forEach((model: any) => {
            const categoryName = model.category.name.toLowerCase();
            const brandName = model.brand.name.toLowerCase();
            
            // Add brand to category if not already present
            if (!brandsByCategory[categoryName].includes(brandName)) {
              brandsByCategory[categoryName].push(brandName);
            }
            
            // Initialize brand in models if not present
            if (!modelsByCategory[categoryName][brandName]) {
              modelsByCategory[categoryName][brandName] = [];
            }
            
            // Add model to brand with storage options
            modelsByCategory[categoryName][brandName].push({
              id: model.id,
              name: model.name,
              modelNumber: model.modelNumber,
              releaseYear: model.releaseYear,
              imageUrl: model.imageUrl,
              storageOptions: model.storageOptions || []
            });
          });
          
          // Update the global brands and models objects
          Object.keys(brandsByCategory).forEach(category => {
            if (brands[category as keyof typeof brands]) {
              (brands[category as keyof typeof brands] as any) = brandsByCategory[category];
            }
          });
          
          Object.keys(modelsByCategory).forEach(category => {
            if (models[category as keyof typeof models]) {
              (models[category as keyof typeof models] as any) = modelsByCategory[category];
            }
          });
          
          // Populate conditions from API data
          if (data.conditions) {
            conditions.length = 0; // Clear existing conditions
            data.conditions.forEach((condition: any) => {
              conditions.push(condition.name.toLowerCase().replace(' ', '-') as DeviceCondition);
            });
          }
          
          // Populate brand logos from API data
          if (data.brands) {
            Object.keys(brandLogos).length = 0; // Clear existing logos
            data.brands.forEach((brand: any) => {
              brandLogos[brand.name.toLowerCase()] = brand.logoUrl || `/logos/${brand.name.toLowerCase()}.png`;
            });
          }
        }
      } catch (error) {
        console.error('Error fetching device catalog:', error);
      }
    };

    fetchDeviceCatalog();
  }, []);

  // Submit trade-in order
  const handleOpenForm = () => {
    setShowForm(true);
    setCurrentStep('type');
    // Reset device state when opening form
    setDevice({});
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setCurrentStep('type');
    setDevice({});
    setSubmitSuccess(false);
  };

  const handleSubmit = async () => {
    if (!device?.model || !device?.condition || !quote) {
      return;
    }

    setIsSubmitting(true);
    try {
          // Get the selected device model and condition from the device catalog
    const selectedModel = device.model;
    const selectedCondition = device.condition;
    
    // Find the corresponding database IDs
    let deviceModelId = 1; // Default fallback
    let deviceConditionId = 1; // Default fallback
    
    if (deviceCatalog && selectedModel && selectedCondition) {
      // Find model ID
      const model = deviceCatalog.models.find((m: any) => m.name === selectedModel);
      if (model) {
        deviceModelId = model.id;
      }
      
      // Find condition ID
      const condition = deviceCatalog.conditions.find((c: any) => 
        c.name.toLowerCase().replace(' ', '-') === selectedCondition
      );
      if (condition) {
        deviceConditionId = condition.id;
      }
    }

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
          deviceModelId,
          deviceConditionId,
          quotedAmount: quote,
          paymentMethod: customerInfo.paymentMethod,
          notes: `Shipping label: ${customerInfo.shippingLabel}`,
        }),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        // Reset form after successful submission
        setTimeout(() => {
          setCurrentStep('type');
          setCustomerInfo({
            firstName: '',
            familyName: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            province: '',
            postalCode: '',
            shippingLabel: false,
            paymentMethod: 'e-transfer',
            paymentEmail: '',
            acceptTerms: false,
          });
          setSubmitSuccess(false);
        }, 3000);
      } else {
        throw new Error('Failed to submit trade-in order');
      }
    } catch (error) {
      console.error('Error submitting trade-in order:', error);
      alert('Failed to submit trade-in order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((STEPS.indexOf(currentStep) + 1) / STEPS.length) * 100;

  // Helper to check if the current step is complete
  const isStepComplete = () => {
    switch (currentStep) {
      case 'type':
        return !!device?.type;
      case 'brand':
        return !!device?.brand;
      case 'model':
        return !!device?.model;
      case 'storage':
        return !!device?.storage;
      case 'condition':
        return !!device?.condition;
      case 'quote':
        return !!quote;
      case 'customerInfo':
        return (
          !!customerInfo.firstName &&
          !!customerInfo.familyName &&
          !!customerInfo.email &&
          !!customerInfo.phone &&
          !!customerInfo.address &&
          !!customerInfo.city &&
          !!customerInfo.province &&
          !!customerInfo.postalCode &&
          !!customerInfo.paymentEmail &&
          customerInfo.acceptTerms
        );
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!isStepComplete()) return;
    if (STEPS.indexOf(currentStep) < STEPS.length - 1) {
      setCurrentStep(STEPS[STEPS.indexOf(currentStep) + 1] as Step);
    }
  };

  const handleBack = () => {
    if (STEPS.indexOf(currentStep) > 0) {
      setCurrentStep(STEPS[STEPS.indexOf(currentStep) - 1] as Step);
    }
  };

  const renderStep = (step: Step) => {
    switch (step) {
      case 'type':
        return (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Select Device Type</h3>
              <p className="text-gray-600">Choose the type of device you want to trade in</p>
            </motion.div>
            
            <div className="grid grid-cols-2 gap-6">
              {DEVICE_TYPES.map(({ type, icon, label }, index) => (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                      device?.type === type 
                        ? 'ring-2 ring-blue-500 bg-blue-50 shadow-lg' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setDevice({ ...device, type });
                      handleNext();
                    }}
                  >
                    <CardContent className="flex flex-col items-center justify-center p-8">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="text-blue-600 mb-4"
                      >
                        {icon}
                      </motion.div>
                      <span className="text-lg font-semibold text-gray-900">{label}</span>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );
      case 'brand':
        return (
          <div className="grid grid-cols-2 gap-6">
            {brands[device?.type || 'smartphone'].map((brand, index) => (
              <motion.div
                key={brand}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
                    device?.brand === brand 
                      ? 'ring-2 ring-blue-500 bg-blue-50 shadow-lg' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setDevice({ ...device, brand });
                    handleNext();
                  }}
                >
                  <CardContent className="flex flex-col items-center justify-center p-8">
                    <div className="mb-4">
                      <img src={brandLogos[brand]} alt={brand} className="w-20 h-20 object-contain" />
                    </div>
                    <span className="text-xl font-semibold text-gray-900 capitalize">{brand}</span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        );
      case 'model':
        if (!device?.type || !device?.brand) {
          return (
            <motion.div 
              className="text-center text-gray-500 py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Please select a type and brand first.
            </motion.div>
          );
        }
        const modelList = (models[device.type] as Record<string, any[]>)[device.brand as string] || [];
        return (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Select Model</h3>
              <p className="text-gray-600">Choose your specific device model</p>
            </motion.div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {modelList.map((model, index) => (
                <motion.div
                  key={model.name}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                      device?.model === model.name 
                        ? 'ring-2 ring-blue-500 bg-blue-50 shadow-lg' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setDevice({ ...device, model: model.name });
                      // Update storage options based on selected model
                      if (deviceCatalog && model.storageOptions) {
                        storageOptions = model.storageOptions.map((opt: any) => opt.storage);
                      }
                      handleNext();
                    }}
                  >
                    <CardContent className="flex flex-col items-center justify-center p-6">
                      {model.imageUrl ? (
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="mb-3"
                        >
                          <img src={model.imageUrl} alt={model.name} className="w-20 h-20 object-contain" />
                        </motion.div>
                      ) : (
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mb-3"
                        >
                          <Smartphone className="w-8 h-8 text-gray-400" />
                        </motion.div>
                      )}
                      <span className="text-sm font-semibold text-gray-900 text-center leading-tight">{model.name}</span>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );
      case 'storage':
        // Get storage options for the selected model
        const selectedModel = deviceCatalog?.models?.find((m: any) => m.name === device?.model);
        const modelStorageOptions = selectedModel?.storageOptions || [];
        
        if (modelStorageOptions.length === 0) {
          return (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                <Smartphone className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-lg font-medium">No Storage Options Available</p>
                <p className="text-sm">This device doesn't have any storage options configured yet.</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => handleBack()}
                className="mt-4"
              >
                Choose Different Device
              </Button>
            </div>
          );
        }
        
        return (
          <div className="grid grid-cols-2 gap-4">
            {modelStorageOptions.map((option: any) => (
              <Card
                key={option.storage}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  device?.storage === option.storage ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => {
                  setDevice({ ...device, storage: option.storage });
                  handleNext();
                }}
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <span className="font-medium">{option.storage}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      case 'condition':
        if (conditions.length === 0) {
          return (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                <Smartphone className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-lg font-medium">No Conditions Available</p>
                <p className="text-sm">No device conditions have been configured yet.</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => handleBack()}
                className="mt-4"
              >
                Go Back
              </Button>
            </div>
          );
        }
        
        return (
          <div className="grid grid-cols-2 gap-4">
            {conditions.map((condition) => (
              <Card
                key={condition}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  device?.condition === condition ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => {
                  setDevice({ ...device, condition });
                  calculateQuote();
                  handleNext(); 
                }}
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <span className="font-medium capitalize">{condition.replace('-', ' ')}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      case 'quote':
        return (
          <div className="p-6 bg-gray-50 rounded-xl">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Device Type</p>
              <p className="font-medium capitalize">{device?.type}</p>
            </div>
            <div className="space-y-2 mt-4">
              <p className="text-sm text-gray-500">Brand</p>
              <p className="font-medium capitalize">{device?.brand}</p>
            </div>
            <div className="space-y-2 mt-4">
              <p className="text-sm text-gray-500">Storage</p>
              <p className="font-medium">{device?.storage}</p>
            </div>
            <div className="space-y-2 mt-4">
              <p className="text-sm text-gray-500">Condition</p>
              <p className="font-medium capitalize">{device?.condition?.replace('-', ' ')}</p>
            </div>
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-500">Estimated Value</p>
              <p className="text-3xl font-bold text-primary">${(quote || 0).toFixed(2)}</p>
            </div>
          </div>
        );
      case 'customerInfo':
        return (
          <form className="space-y-4 max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium">First name *</label>
                <input type="text" className="input" value={customerInfo.firstName} onChange={e => setCustomerInfo({ ...customerInfo, firstName: e.target.value })} required />
              </div>
              <div>
                <label className="block font-medium">Family name *</label>
                <input type="text" className="input" value={customerInfo.familyName} onChange={e => setCustomerInfo({ ...customerInfo, familyName: e.target.value })} required />
              </div>
            </div>
            <div>
              <label className="block font-medium">Your email *</label>
              <input type="email" className="input" value={customerInfo.email} onChange={e => setCustomerInfo({ ...customerInfo, email: e.target.value })} required />
            </div>
            <div>
              <label className="block font-medium">Phone *</label>
              <input type="tel" className="input" value={customerInfo.phone} onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })} required />
            </div>
            <div>
              <label className="block font-medium">Street address *</label>
              <input type="text" className="input" value={customerInfo.address} onChange={e => setCustomerInfo({ ...customerInfo, address: e.target.value })} required placeholder="(Don't forget your unit or apartment number if you have one)" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium">City *</label>
                <input type="text" className="input" value={customerInfo.city} onChange={e => setCustomerInfo({ ...customerInfo, city: e.target.value })} required />
              </div>
              <div>
                <label className="block font-medium">Province *</label>
                <input type="text" className="input" value={customerInfo.province} onChange={e => setCustomerInfo({ ...customerInfo, province: e.target.value })} required />
              </div>
              <div>
                <label className="block font-medium">Postal code *</label>
                <input type="text" className="input" value={customerInfo.postalCode} onChange={e => setCustomerInfo({ ...customerInfo, postalCode: e.target.value })} required />
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-blue-50 p-4 rounded">
              <input type="checkbox" checked={customerInfo.shippingLabel} onChange={e => setCustomerInfo({ ...customerInfo, shippingLabel: e.target.checked })} />
              <span className="text-sm font-medium">I only need the shipping label (required for all products other than smartphones)</span>
            </div>
            <div className="bg-blue-50 p-4 rounded">
              <label className="block font-medium mb-2">Select how you would like to be paid</label>
              <div className="flex space-x-6 mb-2">
                <label className="flex items-center space-x-2">
                  <input type="radio" name="paymentMethod" checked={customerInfo.paymentMethod === 'e-transfer'} onChange={() => setCustomerInfo({ ...customerInfo, paymentMethod: 'e-transfer' })} />
                  <span>E-Transfer</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="paymentMethod" checked={customerInfo.paymentMethod === 'paypal'} onChange={() => setCustomerInfo({ ...customerInfo, paymentMethod: 'paypal' })} />
                  <span>Paypal</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="paymentMethod" checked={customerInfo.paymentMethod === 'cheque'} onChange={() => setCustomerInfo({ ...customerInfo, paymentMethod: 'cheque' })} />
                  <span>Cheque</span>
                </label>
              </div>
              <div>
                <label className="block font-medium">{customerInfo.paymentMethod === 'paypal' ? 'Paypal Email:' : customerInfo.paymentMethod === 'e-transfer' ? 'E-Transfer Email:' : 'Mailing Address for Cheque:'}</label>
                <input type="text" className="input" value={customerInfo.paymentEmail} onChange={e => setCustomerInfo({ ...customerInfo, paymentEmail: e.target.value })} required />
              </div>
            </div>
            
            {/* Terms and Conditions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-3">Terms and Conditions</h3>
              <div className="text-sm text-yellow-700 space-y-2">
                <p><strong>Important:</strong> The offer provided is based on the information you have input. We will check your device upon receipt to ensure it matches the description provided.</p>
                <p><strong>Device Verification:</strong> If the device condition or specifications do not match what was described, the offer may be subject to change. We will contact you to discuss any adjustments.</p>
                <p><strong>Customer Responsibility:</strong> If you decline the adjusted offer, you will be responsible for paying the shipping costs and any additional fees for the time taken to process your device.</p>
                <p><strong>Acceptance:</strong> By proceeding with this trade-in, you acknowledge and agree to these terms and conditions.</p>
              </div>
              <div className="mt-4 flex items-start space-x-2">
                <input 
                  type="checkbox" 
                  checked={customerInfo.acceptTerms} 
                  onChange={e => setCustomerInfo({ ...customerInfo, acceptTerms: e.target.checked })} 
                  className="mt-1"
                />
                <span className="text-sm font-medium">I have read and agree to the terms and conditions *</span>
              </div>
            </div>
          </form>
        );
      default:
        return null;
    }
  };

  // If form is not shown, display the trigger button
  if (!showForm) {
    return (
      <motion.div 
        className="w-full max-w-4xl mx-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >


        {/* Device Categories Grid */}
        <div className="w-full flex justify-center">
          <div className="flex flex-wrap justify-center gap-6" style={{maxWidth: '800px', width: '100%'}}>
          {DEVICE_TYPES.map(({ type, icon, label }, index) => (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
              onClick={handleOpenForm}
            >
              <div className="text-blue-600 mb-4 flex justify-center">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                  {icon}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center">{label}</h3>
            </motion.div>
          ))}
          </div>
        </div>
      </motion.div>
    );
  }

  // Full-screen modal overlay
  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-gray-900">Select Brand</h2>
            <p className="text-gray-600">Choose your device manufacturer</p>
          </motion.div>
          
          <motion.button
            onClick={handleCloseForm}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        </div>

        {/* Form Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {renderStep(currentStep)}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between p-6 border-t border-gray-200 bg-gray-50">
          {STEPS.indexOf(currentStep) > 0 && (
            <Button variant="outline" onClick={handleBack} className="px-6 py-3">
              ← Back
            </Button>
          )}
          {STEPS.indexOf(currentStep) < STEPS.length - 1 && currentStep !== 'customerInfo' && (
            <Button 
              onClick={handleNext} 
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 ml-auto" 
              disabled={!isStepComplete()}
            >
              Next <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          {currentStep === 'customerInfo' && (
            <Button 
              onClick={handleSubmit} 
              className="px-6 py-3 bg-green-600 hover:bg-green-700 ml-auto" 
              disabled={!isStepComplete() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : submitSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submitted!
                </>
              ) : (
                <>
                  Submit Trade-In
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
} 