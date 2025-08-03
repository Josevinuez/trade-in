import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDeviceStore } from '../store/deviceStore';
import { DeviceType, DeviceBrand, StorageOption, DeviceCondition } from '@device-buyback/types';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Smartphone, Tablet, Laptop, Watch } from 'lucide-react';
import { ChevronRight } from 'lucide-react';

const DEVICE_TYPES: { type: DeviceType; icon: React.ReactNode; label: string }[] = [
  { type: 'smartphone', icon: <Smartphone className="w-6 h-6" />, label: 'Smartphone' },
  { type: 'tablet', icon: <Tablet className="w-6 h-6" />, label: 'Tablet' },
  { type: 'laptop', icon: <Laptop className="w-6 h-6" />, label: 'Laptop' },
  { type: 'smartwatch', icon: <Watch className="w-6 h-6" />, label: 'Smartwatch' },
];

const STEPS = ['type', 'brand', 'model', 'storage', 'condition', 'quote', 'customerInfo'] as const;
type Step = typeof STEPS[number];

const brands = {
  smartphone: ['apple', 'samsung', 'google', 'other'] as DeviceBrand[],
  tablet: ['apple', 'samsung', 'microsoft', 'other'] as DeviceBrand[],
  laptop: ['apple', 'microsoft', 'other'] as DeviceBrand[],
  smartwatch: ['apple', 'samsung', 'other'] as DeviceBrand[],
};

const models = {
  smartphone: {
    apple: [
      { name: 'iPhone 16e', image: '/images/iphone-16e.png' },
      { name: 'iPhone 16 Pro Max', image: '/images/iphone-16-pro-max.png' },
      { name: 'iPhone 16 Pro', image: '/images/iphone-16-pro.png' },
      { name: 'iPhone 16 Plus', image: '/images/iphone-16-plus.png' },
      { name: 'iPhone 16', image: '/images/iphone-16.png' },
      { name: 'iPhone 15 Pro Max', image: '/images/iphone-15-pro-max.png' },
      { name: 'iPhone 15 Pro', image: '/images/iphone-15-pro.png' },
      { name: 'iPhone 15 Plus', image: '/images/iphone-15-plus.png' },
      { name: 'iPhone 15', image: '/images/iphone-15.png' },
      { name: 'iPhone 14 Pro Max', image: '/images/iphone-14-pro-max.png' },
      { name: 'iPhone 14 Pro', image: '/images/iphone-14-pro.png' },
      { name: 'iPhone 14 Plus', image: '/images/iphone-14-plus.png' },
      { name: 'iPhone 14', image: '/images/iphone-14.png' },
    ],
    samsung: [
      { name: 'Galaxy S24 Ultra', image: '/images/galaxy-s24-ultra.png' },
      { name: 'Galaxy S24+', image: '/images/galaxy-s24-plus.png' },
      { name: 'Galaxy S24', image: '/images/galaxy-s24.png' },
    ],
    google: [
      { name: 'Pixel 8 Pro', image: '/images/pixel-8-pro.png' },
      { name: 'Pixel 8', image: '/images/pixel-8.png' },
    ],
    other: [
      { name: 'Other Smartphone', image: '/images/other-smartphone.png' },
    ],
  },
  tablet: {
    apple: ['iPad Pro 12.9"', 'iPad Pro 11"', 'iPad Air', 'iPad Mini'],
    samsung: ['Galaxy Tab S9 Ultra', 'Galaxy Tab S9+', 'Galaxy Tab S9', 'Galaxy Tab A'],
    microsoft: ['Surface Pro 9', 'Surface Pro 8', 'Surface Go 4'],
    other: ['Other Tablet']
  },
  laptop: {
    apple: ['MacBook Pro 16"', 'MacBook Pro 14"', 'MacBook Pro 13"', 'MacBook Air 15"', 'MacBook Air 13"'],
    microsoft: ['Surface Laptop 5', 'Surface Laptop Studio', 'Surface Laptop Go'],
    other: ['Other Laptop']
  },
  smartwatch: {
    apple: ['Apple Watch Ultra 2', 'Apple Watch Series 9', 'Apple Watch SE'],
    samsung: ['Galaxy Watch 6 Pro', 'Galaxy Watch 6', 'Galaxy Watch 5 Pro', 'Galaxy Watch 5'],
    other: ['Other Smartwatch']
  }
};

const storageOptions: StorageOption[] = ['64GB', '128GB', '256GB', '512GB', '1TB'];
const conditions: DeviceCondition[] = ['like-new', 'good', 'fair'];

const brandLogos: Record<string, string> = {
  apple: '/logos/apple.png',
  samsung: '/logos/samsung.png',
  google: '/logos/google.png',
  microsoft: '/logos/microsoft.png',
  other: '/logos/other.png',
};

export function DeviceBuybackWidget() {
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
    createAccount: false,
    shippingLabel: false,
    paymentMethod: 'e-transfer',
    paymentEmail: '',
  });

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
          !!customerInfo.address &&
          !!customerInfo.city &&
          !!customerInfo.province &&
          !!customerInfo.postalCode &&
          !!customerInfo.phone &&
          !!customerInfo.paymentMethod &&
          !!customerInfo.paymentEmail
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
          <div className="grid grid-cols-2 gap-4">
            {DEVICE_TYPES.map(({ type, icon, label }) => (
              <Card
                key={type}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  device?.type === type ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => {
                  setDevice({ ...device, type });
                  handleNext();
                }}
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  {icon}
                  <span className="mt-2 text-sm font-medium">{label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      case 'brand':
        return (
          <div className="grid grid-cols-2 gap-4">
            {brands[device?.type || 'smartphone'].map((brand) => (
              <Card
                key={brand}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  device?.brand === brand ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => {
                  setDevice({ ...device, brand });
                  handleNext();
                }}
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <img src={brandLogos[brand]} alt={brand} className="w-12 h-12 object-contain mb-2" />
                  <span className="font-medium capitalize">{brand}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      case 'model':
        if (!device?.type || !device?.brand) {
          return <div className="text-center text-gray-500">Please select a type and brand first.</div>;
        }
        const modelList = (models[device.type] as Record<string, { name: string; image: string }[]>)[device.brand as string] || [];
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {modelList.map((model) => (
              <Card
                key={model.name}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  device?.model === model.name ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => {
                  setDevice({ ...device, model: model.name });
                  handleNext();
                }}
              >
                <CardContent className="flex flex-col items-center justify-center p-4">
                  <img src={model.image} alt={model.name} className="w-20 h-20 object-contain mb-2" />
                  <span className="font-medium text-center">{model.name}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      case 'storage':
        return (
          <div className="grid grid-cols-2 gap-4">
            {storageOptions.map((storage) => (
              <Card
                key={storage}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  device?.storage === storage ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => {
                  setDevice({ ...device, storage });
                  handleNext();
                }}
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <span className="font-medium">{storage}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      case 'condition':
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
            <div>
              <label className="block font-medium">Phone *</label>
              <input type="tel" className="input" value={customerInfo.phone} onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })} required />
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" checked={customerInfo.createAccount} onChange={e => setCustomerInfo({ ...customerInfo, createAccount: e.target.checked })} />
              <span className="text-sm font-medium">Create an account? <span className="text-gray-500">(optional)</span></span>
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
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <div className="mb-8">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between mt-2">
          {STEPS.map((step, index) => (
            <div
              key={step}
              className={`text-sm ${
                index <= STEPS.indexOf(currentStep) ? 'text-primary' : 'text-gray-400'
              }`}
            >
              {step.charAt(0).toUpperCase() + step.slice(1)}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderStep(currentStep)}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-8">
        {STEPS.indexOf(currentStep) > 0 && (
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
        )}
        {STEPS.indexOf(currentStep) < STEPS.length - 1 && (
          <Button onClick={handleNext} className="ml-auto" disabled={!isStepComplete()}>
            Next <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
} 