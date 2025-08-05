import { DeviceBuybackWidget } from '@/components/DeviceBuybackWidget';

export default function TestWidgetPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-8">Device Buyback Widget Demo</h1>
      <DeviceBuybackWidget />
    </div>
  );
} 