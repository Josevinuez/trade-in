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
      excellentPrice: '',
      goodPrice: '',
      fairPrice: '',
      poorPrice: '',
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
      setLoading(true);
      
      // Get authentication token
      const token = localStorage.getItem('staffAuthToken');
      if (!token) {
        alert('Authentication required. Please log in again.');
        router.push('/staff-login');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [categoriesRes, brandsRes, conditionsRes, modelsRes] = await Promise.all([
        fetch('/api/staff/devices?type=categories', { headers }),
        fetch('/api/staff/devices?type=brands', { headers }),
        fetch('/api/staff/devices?type=conditions', { headers }),
        fetch('/api/staff/devices?type=models', { headers })
      ]);

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }
      if (brandsRes.ok) {
        const brandsData = await brandsRes.json();
        setBrands(brandsData);
      }
      if (conditionsRes.ok) {
        const conditionsData = await conditionsRes.json();
        setConditions(conditionsData);
      }
      if (modelsRes.ok) {
        const modelsData = await modelsRes.json();
        setDevices(modelsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      // Get authentication token
      const token = localStorage.getItem('staffAuthToken');
      if (!token) {
        alert('Authentication required. Please log in again.');
        router.push('/staff-login');
        return;
      }

      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const base64String = base64Data.split(',')[1]; // Remove data:image/...;base64, prefix
          
          const response = await fetch('/api/staff/upload-image', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              file: base64String,
              fileName: file.name,
              mimeType: file.type
            })
          });

          if (response.ok) {
            const result = await response.json();
            setFormData(prev => ({ ...prev, imageUrl: result.url }));
            alert('Image uploaded successfully!');
          } else {
            const errorData = await response.json();
            alert(`Failed to upload image: ${errorData.error || 'Unknown error'}`);
          }
        } catch (error) {
          console.error('Upload error:', error);
          alert('Failed to upload image. Please try again.');
        } finally {
          setUploadingImage(false);
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
      setUploadingImage(false);
    }
  };

  const addStorageOption = () => {
    setStorageOptions([
      ...storageOptions,
      {
        storage: '',
        excellentPrice: '',
        goodPrice: '',
        fairPrice: '',
        poorPrice: '',
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
    newOptions[index] = {
      ...newOptions[index],
      [field]: value
    } as any;
    setStorageOptions(newOptions);
  };

  const handleAddDevice = async () => {
    try {
      // Get authentication token
      const token = localStorage.getItem('staffAuthToken');
      if (!token) {
        alert('Authentication required. Please log in again.');
        router.push('/staff-login');
        return;
      }

      const response = await fetch('/api/staff/devices', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'model',
          data: formData,
          storageOptions: storageOptions
            .filter(opt => opt.storage !== '')
            .map(opt => ({
              storage: opt.storage,
              excellentPrice: opt.excellentPrice,
              goodPrice: opt.goodPrice,
              fairPrice: opt.fairPrice,
              poorPrice: opt.poorPrice,
            })),
        }),
      });

      if (response.ok) {
        alert('Device added successfully!');
        setShowAddForm(false);
        resetForm();
        fetchData();
      } else {
        const errorData = await response.json();
        alert(`Failed to add device: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding device:', error);
      alert('Failed to add device. Please try again.');
    }
  };

  const handleUpdateDevice = async () => {
    if (!editingDevice) return;

    try {
      // Get authentication token
      const token = localStorage.getItem('staffAuthToken');
      if (!token) {
        alert('Authentication required. Please log in again.');
        router.push('/staff-login');
        return;
      }

      const response = await fetch(`/api/staff/devices/${editingDevice.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'model',
          data: formData,
          storageOptions: storageOptions
            .filter(opt => opt.storage !== '')
            .map(opt => ({
              storage: opt.storage,
              excellentPrice: opt.excellentPrice,
              goodPrice: opt.goodPrice,
              fairPrice: opt.fairPrice,
              poorPrice: opt.poorPrice,
            })),
        }),
      });

      if (response.ok) {
        alert('Device updated successfully!');
        setEditingDevice(null);
        resetForm();
        fetchData();
      } else {
        const errorData = await response.json();
        alert(`Failed to update device: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating device:', error);
      alert('Failed to update device. Please try again.');
    }
  };

  const handleDeleteDevice = async (deviceId: number) => {
    if (!confirm('Are you sure you want to delete this device?')) return;

    try {
      // Get authentication headers
      const token = localStorage.getItem('staffAuthToken');
      if (!token) {
        alert('Authentication required. Please log in again.');
        router.push('/staff-login');
        return;
      }

      const response = await fetch(`/api/staff/devices?id=${deviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Device deleted successfully');
        fetchData();
      } else {
        const errorData = await response.json();
        
        // Handle specific case where device has orders
        if (errorData.error === 'Cannot delete device' && errorData.orderCount > 0) {
          const orderList = errorData.orders?.map((order: any) => 
            `• ${order.orderNumber} (${order.status})`
          ).join('\n') || '• Unknown orders';
          
          alert(`Cannot Delete Device\n\nThis device has ${errorData.orderCount} order(s) and cannot be deleted.\n\nOrders:\n${orderList}\n\nTo delete this device, you must first:\n1. Delete all associated orders, OR\n2. Reassign the orders to another device\n\n${errorData.suggestion}`);
        } else if (errorData.error === 'Cannot delete device' && errorData.details) {
          alert(`Cannot Delete Device\n\n${errorData.details}\n\n${errorData.suggestion || ''}`);
        } else if (errorData.error === 'Device not found') {
          alert(`Device Not Found\n\n${errorData.details}\n\n${errorData.suggestion || ''}`);
        } else {
          alert(`Failed to delete device: ${errorData.error || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Error deleting device:', error);
      alert('Failed to delete device. Please try again.');
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
    setStorageOptions([{
      storage: '',
      excellentPrice: '',
      goodPrice: '',
      fairPrice: '',
      poorPrice: '',
    }]);
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

  const handleExportCSV = () => {
    try {
      // Create CSV content
      const csvHeaders = [
        'Device Name',
        'Model Number',
        'Release Year',
        'Category',
        'Brand',
        'Display Order',
        'Storage Options',
        'Excellent Price',
        'Good Price',
        'Fair Price',
        'Poor Price'
      ];

      const csvRows = devices.map(device => {
        const baseRow = [
          device.name,
          device.modelNumber,
          device.releaseYear.toString(),
          device.category.name,
          device.brand.name,
          device.displayOrder.toString(),
        ];

        // Add storage options if they exist
        if (device.storageOptions && device.storageOptions.length > 0) {
          return device.storageOptions.map(storage => [
            ...baseRow,
            storage.storage,
            storage.excellentPrice?.toString() || '',
            storage.goodPrice?.toString() || '',
            storage.fairPrice?.toString() || '',
            storage.poorPrice?.toString() || ''
          ]);
        } else {
          return [baseRow.concat(['', '', '', '', ''])];
        }
      }).flat();

      // Create CSV content
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `devices-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert('CSV exported successfully!');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV. Please try again.');
    }
  };

  const handleCSVImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      
      // Validate headers
      const requiredHeaders = [
        'Device Name',
        'Model Number',
        'Release Year',
        'Category',
        'Brand',
        'Storage Options',
        'Excellent Price',
        'Good Price',
        'Fair Price',
        'Poor Price'
      ];

      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        alert(`Invalid CSV format. Missing required headers: ${missingHeaders.join(', ')}`);
        return;
      }

      const devicesToImport = [];
      let currentDevice: any = null;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        const values = line.split(',').map(v => v.replace(/"/g, '').trim());
        const deviceName = values[headers.indexOf('Device Name')];
        const modelNumber = values[headers.indexOf('Model Number')];
        const releaseYear = values[headers.indexOf('Release Year')];
        const categoryName = values[headers.indexOf('Category')];
        const brandName = values[headers.indexOf('Brand')];
        const storage = values[headers.indexOf('Storage Options')];
        const excellentPrice = values[headers.indexOf('Excellent Price')];
        const goodPrice = values[headers.indexOf('Good Price')];
        const fairPrice = values[headers.indexOf('Fair Price')];
        const poorPrice = values[headers.indexOf('Poor Price')];

        if (deviceName && modelNumber && releaseYear && categoryName && brandName) {
          // Find category and brand IDs
          const category = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
          const brand = brands.find(b => b.name.toLowerCase() === brandName.toLowerCase());

          if (!category || !brand) {
            alert(`Category "${categoryName}" or Brand "${brandName}" not found. Please add them first.`);
            return;
          }

          if (currentDevice && currentDevice.name === deviceName) {
            // Add storage option to existing device
            if (storage && excellentPrice && goodPrice && fairPrice && poorPrice) {
              currentDevice.storageOptions.push({
                storage,
                excellentPrice: parseFloat(excellentPrice),
                goodPrice: parseFloat(goodPrice),
                fairPrice: parseFloat(fairPrice),
                poorPrice: parseFloat(poorPrice)
              });
            }
          } else {
            // Create new device
            if (currentDevice) {
              devicesToImport.push(currentDevice);
            }
            currentDevice = {
              name: deviceName,
              modelNumber,
              releaseYear: parseInt(releaseYear),
              categoryId: category.id,
              brandId: brand.id,
              displayOrder: 0,
              storageOptions: []
            };
            if (storage && excellentPrice && goodPrice && fairPrice && poorPrice) {
              currentDevice.storageOptions.push({
                storage,
                excellentPrice: parseFloat(excellentPrice),
                goodPrice: parseFloat(goodPrice),
                fairPrice: parseFloat(fairPrice),
                poorPrice: parseFloat(poorPrice)
              });
            }
          }
        }
      }

      // Add the last device
      if (currentDevice) {
        devicesToImport.push(currentDevice);
      }

      if (devicesToImport.length === 0) {
        alert('No valid devices found in CSV file.');
        return;
      }

      // Confirm import
      if (!confirm(`Import ${devicesToImport.length} device(s) with their storage options?`)) {
        return;
      }

      // Import devices
      const token = localStorage.getItem('staffAuthToken');
      if (!token) {
        alert('Authentication required. Please log in again.');
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const device of devicesToImport) {
        try {
          const response = await fetch('/api/staff/devices', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              type: 'model',
              data: device,
              storageOptions: device.storageOptions
            }),
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
            console.error(`Failed to import device ${device.name}:`, await response.text());
          }
        } catch (error) {
          errorCount++;
          console.error(`Error importing device ${device.name}:`, error);
        }
      }

      alert(`Import completed!\n\nSuccessfully imported: ${successCount} device(s)\nFailed to import: ${errorCount} device(s)`);
      
      // Refresh data and reset file input
      fetchData();
      event.target.value = '';
      
    } catch (error) {
      console.error('Error importing CSV:', error);
      alert('Failed to import CSV. Please check the file format and try again.');
    }
  };

  const handleDownloadTemplate = () => {
    try {
      // Create sample CSV template
      const templateHeaders = [
        'Device Name',
        'Model Number',
        'Release Year',
        'Category',
        'Brand',
        'Storage Options',
        'Excellent Price',
        'Good Price',
        'Fair Price',
        'Poor Price'
      ];

      const templateRows = [
        ['iPhone 15 Pro', 'A3102', '2023', 'Smartphones', 'Apple', '128GB', '800.00', '700.00', '600.00', '500.00'],
        ['iPhone 15 Pro', 'A3102', '2023', 'Smartphones', 'Apple', '256GB', '900.00', '800.00', '700.00', '600.00'],
        ['iPhone 15 Pro', 'A3102', '2023', 'Smartphones', 'Apple', '512GB', '1000.00', '900.00', '800.00', '700.00'],
        ['iPad Pro', 'A2893', '2023', 'Tablets', 'Apple', '128GB', '600.00', '500.00', '400.00', '300.00'],
        ['iPad Pro', 'A2893', '2023', 'Tablets', 'Apple', '256GB', '700.00', '600.00', '500.00', '400.00']
      ];

      // Create CSV content
      const csvContent = [templateHeaders, ...templateRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'devices-import-template.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert('CSV template downloaded successfully!');
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Failed to download template. Please try again.');
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
            <Button variant="outline" onClick={handleExportCSV}>
              <ArrowDown className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={handleDownloadTemplate}>
              <ArrowDown className="w-4 h-4 mr-2" />
              Template
            </Button>
            <Button variant="outline" onClick={() => document.getElementById('csvFileInput')?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Device
            </Button>
          </div>
        </div>

        {/* Hidden CSV file input */}
        <input
          id="csvFileInput"
          type="file"
          accept=".csv"
          onChange={handleCSVImport}
          style={{ display: 'none' }}
        />

        {/* CSV Import/Export Info */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">📊 CSV Import/Export</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Export:</strong> Download all devices with their storage options and pricing</p>
            <p><strong>Template:</strong> Download a sample CSV file to understand the required format</p>
            <p><strong>Import:</strong> Upload a CSV file to bulk add devices with storage options</p>
            <p className="text-xs mt-2"><em>Note: Categories and brands must exist before importing devices</em></p>
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
                            value={option.excellentPrice}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                              updateStorageOption(index, 'excellentPrice', e.target.value)
                            }
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Good</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={option.goodPrice}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                              updateStorageOption(index, 'goodPrice', e.target.value)
                            }
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Fair</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={option.fairPrice}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                              updateStorageOption(index, 'fairPrice', e.target.value)
                            }
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Poor</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={option.poorPrice}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                              updateStorageOption(index, 'poorPrice', e.target.value)
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
                      {device.imageUrl ? (
                        <img 
                          src={device.imageUrl} 
                          alt={device.name} 
                          className="w-20 h-20 object-contain rounded-lg border"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center border">
                          <span className="text-lg font-bold text-gray-600">
                            {device.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
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
                            excellentPrice: opt.excellentPrice?.toString() || '',
                            goodPrice: opt.goodPrice?.toString() || '',
                            fairPrice: opt.fairPrice?.toString() || '',
                            poorPrice: opt.poorPrice?.toString() || '',
                          }));
                          setStorageOptions(options);
                        } else {
                          setStorageOptions([{
                            storage: '',
                            excellentPrice: '',
                            goodPrice: '',
                            fairPrice: '',
                            poorPrice: '',
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