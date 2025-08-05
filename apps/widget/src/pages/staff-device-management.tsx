import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Smartphone, Tablet, Laptop, Watch, Upload, X, Trash } from 'lucide-react';

interface DeviceModel {
  id: number;
  name: string;
  modelNumber: string;
  releaseYear: number;
  imageUrl?: string;
  displayOrder: number;
  isActive: boolean;
  category: {
    id: number;
    name: string;
  };
  brand: {
    id: number;
    name: string;
  };
  conditionPricing?: DeviceConditionPricing[];
  storageOptions?: DeviceStorageOption[];
}

interface DeviceConditionPricing {
  id: number;
  conditionId: number;
  price: string;
  condition: {
    name: string;
  };
}

interface DeviceStorageOption {
  id: number;
  storage: string;
  excellentPrice?: number;
  goodPrice?: number;
  fairPrice?: number;
  poorPrice?: number;
}

interface DeviceCategory {
  id: number;
  name: string;
}

interface DeviceBrand {
  id: number;
  name: string;
}

interface DeviceCondition {
  id: number;
  name: string;
}

export default function StaffDeviceManagement() {
  const router = useRouter();
  const [devices, setDevices] = useState<DeviceModel[]>([]);
  const [categories, setCategories] = useState<DeviceCategory[]>([]);
  const [brands, setBrands] = useState<DeviceBrand[]>([]);
  const [conditions, setConditions] = useState<DeviceCondition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState<DeviceModel | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    modelNumber: '',
    releaseYear: new Date().getFullYear(),
    imageUrl: '',
    categoryId: '',
    brandId: '',
    displayOrder: 0,
  });

  // Storage options state with condition pricing
  const [storageOptions, setStorageOptions] = useState([
    {
      storage: '',
      conditionPricing: {
        excellent: '',
        good: '',
        fair: '',
        poor: '',
      }
    }
  ]);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('staffAuthToken');
    if (!token) {
      router.push('/staff-login');
      return;
    }

    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const [devicesRes, categoriesRes, brandsRes, conditionsRes] = await Promise.all([
        fetch('/api/staff/devices?type=models'),
        fetch('/api/staff/devices?type=categories'),
        fetch('/api/staff/devices?type=brands'),
        fetch('/api/staff/devices?type=conditions'),
      ]);

      const devicesData = await devicesRes.json();
      const categoriesData = await categoriesRes.json();
      const brandsData = await brandsRes.json();
      const conditionsData = await conditionsRes.json();

      setDevices(devicesData);
      setCategories(categoriesData);
      setBrands(brandsData);
      setConditions(conditionsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/staff/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setFormData(prev => ({ ...prev, imageUrl: result.imageUrl }));
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const addStorageOption = () => {
    setStorageOptions([
      ...storageOptions,
      {
        storage: '',
        conditionPricing: {
          excellent: '',
          good: '',
          fair: '',
          poor: '',
        }
      }
    ]);
  };

  const removeStorageOption = (index: number) => {
    if (storageOptions.length > 1) {
      setStorageOptions(storageOptions.filter((_, i) => i !== index));
    }
  };

  const updateStorageOption = (index: number, field: string, value: string) => {
    const newOptions = [...storageOptions];
    if (field.includes('.')) {
      const [mainField, subField] = field.split('.');
      newOptions[index] = {
        ...newOptions[index],
        [mainField]: {
          ...newOptions[index][mainField as keyof typeof newOptions[index]],
          [subField]: value
        }
      } as any;
    } else {
      newOptions[index] = {
        ...newOptions[index],
        [field]: value
      } as any;
    }
    setStorageOptions(newOptions);
  };

  const handleAddDevice = async () => {
    try {
      const response = await fetch('/api/staff/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'model',
          data: formData,
          storageOptions: storageOptions
            .filter(opt => opt.storage !== '')
            .map(opt => ({
              storage: opt.storage,
              conditionPricing: opt.conditionPricing,
            })),
        }),
      });

      if (response.ok) {
        setShowAddForm(false);
        resetForm();
        fetchData();
      }
    } catch (error) {
      console.error('Error adding device:', error);
    }
  };

  const handleUpdateDevice = async () => {
    if (!editingDevice) return;

    try {
      const response = await fetch(`/api/staff/devices/${editingDevice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'model',
          data: formData,
          storageOptions: storageOptions
            .filter(opt => opt.storage !== '')
            .map(opt => ({
              storage: opt.storage,
              conditionPricing: opt.conditionPricing,
            })),
        }),
      });

      if (response.ok) {
        setEditingDevice(null);
        resetForm();
        fetchData();
      }
    } catch (error) {
      console.error('Error updating device:', error);
    }
  };

  const handleDeleteDevice = async (deviceId: number) => {
    if (!confirm('Are you sure you want to delete this device?')) return;

    try {
      const response = await fetch(`/api/staff/devices/${deviceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting device:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      modelNumber: '',
      releaseYear: new Date().getFullYear(),
      imageUrl: '',
      categoryId: '',
      brandId: '',
      displayOrder: 0,
    });
    setStorageOptions([
      {
        storage: '',
        conditionPricing: {
          excellent: '',
          good: '',
          fair: '',
          poor: '',
        }
      }
    ]);
  };

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'smartphone': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      case 'laptop': return <Laptop className="w-4 h-4" />;
      case 'smartwatch': return <Watch className="w-4 h-4" />;
      default: return <Smartphone className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Device Management</h1>
            <p className="text-gray-600 mt-2">Manage device catalog, images, and storage options with condition pricing</p>
          </div>
          <div className="flex space-x-4">
            <Button variant="outline" onClick={() => router.push('/staff-dashboard')}>
              Back to Dashboard
            </Button>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Device
            </Button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {(showAddForm || editingDevice) && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingDevice ? 'Edit Device' : 'Add New Device'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <Label htmlFor="name">Device Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., iPhone 15 Pro"
                  />
                </div>
                <div>
                  <Label htmlFor="modelNumber">Model Number</Label>
                  <Input
                    id="modelNumber"
                    value={formData.modelNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, modelNumber: e.target.value })}
                    placeholder="e.g., A3102"
                  />
                </div>
                <div>
                  <Label htmlFor="releaseYear">Release Year</Label>
                  <Input
                    id="releaseYear"
                    type="number"
                    value={formData.releaseYear}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, releaseYear: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={formData.categoryId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <select
                    id="brand"
                    value={formData.brandId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, brandId: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">Select brand</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="displayOrder">Display Order</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="mb-6">
                <Label className="text-base font-semibold">Device Image</Label>
                <div className="mt-2">
                  {formData.imageUrl ? (
                    <div className="flex items-center space-x-4">
                      <img 
                        src={formData.imageUrl} 
                        alt="Device" 
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData({ ...formData, imageUrl: '' })}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload(file);
                          }
                        }}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <span className="text-sm text-gray-600">
                          {uploadingImage ? 'Uploading...' : 'Click to upload device image'}
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Storage Options with Condition Pricing */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-base font-semibold">Storage Options with Condition Pricing</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addStorageOption}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Storage Option
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {storageOptions.map((option, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1 mr-4">
                          <Label>Storage Option {index + 1}</Label>
                          <Input
                            value={option.storage}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                              updateStorageOption(index, 'storage', e.target.value)
                            }
                            placeholder="e.g., 128GB"
                          />
                        </div>
                        {storageOptions.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeStorageOption(index)}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <Label className="text-sm">Excellent</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={option.conditionPricing.excellent}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                              updateStorageOption(index, 'conditionPricing.excellent', e.target.value)
                            }
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Good</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={option.conditionPricing.good}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                              updateStorageOption(index, 'conditionPricing.good', e.target.value)
                            }
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Fair</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={option.conditionPricing.fair}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                              updateStorageOption(index, 'conditionPricing.fair', e.target.value)
                            }
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Poor</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={option.conditionPricing.poor}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                              updateStorageOption(index, 'conditionPricing.poor', e.target.value)
                            }
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4">
                <Button onClick={editingDevice ? handleUpdateDevice : handleAddDevice}>
                  {editingDevice ? 'Update Device' : 'Add Device'}
                </Button>
                <Button variant="outline" onClick={() => {
                  setShowAddForm(false);
                  setEditingDevice(null);
                  resetForm();
                }}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Devices List */}
        <div className="grid gap-6">
          {(devices || []).map((device) => (
            <Card key={device.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(device.category.name)}
                      <Badge variant={device.isActive ? 'default' : 'secondary'}>
                        {device.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4">
                      {device.imageUrl && (
                        <img 
                          src={device.imageUrl} 
                          alt={device.name} 
                          className="w-16 h-16 object-cover rounded-lg border"
                        />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold">{device.name}</h3>
                        <p className="text-sm text-gray-600">
                          {device.brand.name} • {device.category.name} • Order: {device.displayOrder}
                        </p>
                        <p className="text-sm text-gray-500">
                          Model: {device.modelNumber} • Year: {device.releaseYear}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingDevice(device);
                        setFormData({
                          name: device.name,
                          modelNumber: device.modelNumber,
                          releaseYear: device.releaseYear,
                          imageUrl: device.imageUrl || '',
                          categoryId: device.category.id.toString(),
                          brandId: device.brand.id.toString(),
                          displayOrder: device.displayOrder,
                        });
                        // Set storage options if available
                        if (device.storageOptions && device.storageOptions.length > 0) {
                          const options = device.storageOptions.map(opt => ({
                            storage: opt.storage,
                            conditionPricing: {
                              excellent: opt.excellentPrice?.toString() || '',
                              good: opt.goodPrice?.toString() || '',
                              fair: opt.fairPrice?.toString() || '',
                              poor: opt.poorPrice?.toString() || '',
                            }
                          }));
                          setStorageOptions(options);
                        } else {
                          setStorageOptions([{
                            storage: '',
                            conditionPricing: {
                              excellent: '',
                              good: '',
                              fair: '',
                              poor: '',
                            }
                          }]);
                        }
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDevice(device.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Storage Options Display */}
                {device.storageOptions && device.storageOptions.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Storage Options:</h4>
                    <div className="space-y-2">
                      {device.storageOptions.map((option) => (
                        <div key={option.id} className="bg-gray-50 p-3 rounded-lg">
                          <div className="font-medium mb-2">{option.storage}</div>
                          <div className="grid grid-cols-4 gap-2 text-sm">
                            <div>Excellent: ${option.excellentPrice || '0.00'}</div>
                            <div>Good: ${option.goodPrice || '0.00'}</div>
                            <div>Fair: ${option.fairPrice || '0.00'}</div>
                            <div>Poor: ${option.poorPrice || '0.00'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 