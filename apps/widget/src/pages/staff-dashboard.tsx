import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Smartphone, 
  Shield, 
  LogOut, 
  Package, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  DollarSign,
  Truck,
  Eye,
  Edit,
  Filter,
  Search,
  Plus,
  BarChart3,
  Users,
  Settings,
  Trash2,
  Tablet,
  Laptop,
  Watch,
  ChevronDown,
  ChevronUp,
  Upload,
  X,
  Phone,
  Mail,
  MapPin,
  Star,
  TrendingUp,
  Image as ImageIcon
} from 'lucide-react';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { NotificationModal } from '../components/NotificationModal';

interface Order {
  id: number;
  orderNumber: string;
  quotedAmount: number;
  finalAmount?: number;
  status: string;
  submittedAt: string;
  completedAt?: string;
  notes?: string;
  customer: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  deviceModel: {
    name: string;
    brand: {
      name: string;
    };
    category: {
      name: string;
    };
  };
  deviceCondition: {
    name: string;
  };
  shippingLabels: any[];
  payments: any[];
  paymentMethod?: string;
}

interface DeviceModel {
  id: number;
  name: string;
  modelNumber?: string;
  releaseYear?: number;
  imageUrl?: string;
  displayOrder?: number;
  isActive: boolean;
  category: {
    id: number;
    name: string;
  };
  brand: {
    id: number;
    name: string;
  };
  storageOptions?: any[];
}

export default function StaffDashboard() {
  const [staff, setStaff] = useState<{ email: string; role: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'clients' | 'management' | 'brands'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [devices, setDevices] = useState<DeviceModel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  
  // Device management state
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [conditions, setConditions] = useState<any[]>([]);
  const [deviceSearchTerm, setDeviceSearchTerm] = useState('');
  
  // Brand management state
  const [allBrands, setAllBrands] = useState<any[]>([]);
  const [showAddBrandForm, setShowAddBrandForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [brandFormData, setBrandFormData] = useState({
    name: '',
    logoUrl: '',
    isActive: true,
  });
  const [uploadingBrandLogo, setUploadingBrandLogo] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState<DeviceModel | null>(null);
  
  // Order management state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [orderStatus, setOrderStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  
  // Client management state
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    modelNumber: '',
    releaseYear: 2024,
    displayOrder: 0,
    categoryId: '',
    brandId: '',
    imageUrl: '',
    isActive: true,
  });
  const [storageOptions, setStorageOptions] = useState([
    {
      storage: '',
      excellentPrice: '',
      goodPrice: '',
      fairPrice: '',
      poorPrice: '',
    }
  ]);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmTitle, setConfirmTitle] = useState('');
  
  // Notification modal state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  
  // Categories management
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    icon: '',
    isActive: true,
  });
  
  const router = useRouter();

  // Hardcoded categories for device form
  const deviceCategories = [
    { id: 1, name: 'Smartphones' },
    { id: 2, name: 'Tablets' },
    { id: 3, name: 'Laptops' },
    { id: 4, name: 'Smartwatches' },
  ];

  // Helper function to show notifications
  const showNotificationModal = (type: 'success' | 'error', title: string, message: string) => {
    setNotificationType(type);
    setNotificationTitle(title);
    setNotificationMessage(message);
    setShowNotification(true);
  };

  useEffect(() => {
    const token = localStorage.getItem('staffAuthToken');
    if (!token) {
      router.push('/staff-login');
      return;
    }

    const validateToken = async () => {
      try {
        // For demo purposes, just check if token exists
        const staffEmail = localStorage.getItem('staffEmail');
        if (token && staffEmail) {
          setStaff({ email: staffEmail, role: 'staff' });
          setIsLoading(false);
        } else {
          localStorage.removeItem('staffAuthToken');
          localStorage.removeItem('staffEmail');
          router.push('/staff-login');
        }
      } catch (error) {
        console.error('Token validation error:', error);
        localStorage.removeItem('staffAuthToken');
        localStorage.removeItem('staffEmail');
        router.push('/staff-login');
      }
    };

    validateToken();
  }, [router]);

  useEffect(() => {
    if (staff) {
      fetchOrders();
      fetchDeviceManagementData();
      fetchBrands();
      fetchClients();
    }
  }, [staff]);

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const response = await fetch('/api/staff/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoadingOrders(false);
    }
  };



  // Device management functions
  const fetchDeviceManagementData = async () => {
    try {
      console.log('Fetching device management data...');
      
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

      console.log('Categories data:', categoriesData);
      console.log('Brands data:', brandsData);
      console.log('Conditions data:', conditionsData);

      setDevices(devicesData);
      setCategories(categoriesData);
      setBrands(brandsData);
      setConditions(conditionsData);
    } catch (error) {
      console.error('Error fetching device management data:', error);
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      console.log('Starting image upload for file:', file.name, file.size, file.type);
      
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const imageData = e.target?.result as string;
          console.log('File converted to base64, length:', imageData.length);
          
          const response = await fetch('/api/staff/upload-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageData,
              fileName: file.name,
            }),
          });

          console.log('Upload response status:', response.status);
          
          if (response.ok) {
            const result = await response.json();
            console.log('Upload successful:', result);
            setFormData(prev => ({ ...prev, imageUrl: result.imageUrl }));
            showNotificationModal('success', 'Success', 'Image uploaded successfully!');
          } else {
            const errorData = await response.json();
            console.error('Upload failed:', errorData);
            showNotificationModal('error', 'Error', `Failed to upload image: ${errorData.error || 'Unknown error'}`);
          }
        } catch (error) {
          console.error('Upload error:', error);
          showNotificationModal('error', 'Error', 'Failed to upload image. Please try again.');
        } finally {
          setUploadingImage(false);
        }
      };

      reader.onerror = () => {
        console.error('FileReader error');
        showNotificationModal('error', 'Error', 'Failed to read image file.');
        setUploadingImage(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      showNotificationModal('error', 'Error', 'Failed to upload image. Please try again.');
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
      console.log('Submitting device data:', {
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
      });

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
              excellentPrice: opt.excellentPrice,
              goodPrice: opt.goodPrice,
              fairPrice: opt.fairPrice,
              poorPrice: opt.poorPrice,
            })),
        }),
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Device created successfully:', result);
        setShowAddForm(false);
        resetForm();
        fetchDeviceManagementData();
        showNotificationModal('success', 'Success', 'Device added successfully!');
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        showNotificationModal('error', 'Error', `Failed to add device: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding device:', error);
      showNotificationModal('error', 'Error', 'Failed to add device. Please try again.');
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
              excellentPrice: opt.excellentPrice,
              goodPrice: opt.goodPrice,
              fairPrice: opt.fairPrice,
              poorPrice: opt.poorPrice,
            })),
        }),
      });

      if (response.ok) {
        setEditingDevice(null);
        resetForm();
        fetchDeviceManagementData();
      }
    } catch (error) {
      console.error('Error updating device:', error);
    }
  };

  const handleDeleteDevice = async (deviceId: number) => {
    setConfirmTitle('Delete Device');
    setConfirmMessage('Are you sure you want to delete this device?');
    setConfirmAction(() => async () => {
      try {
        const response = await fetch(`/api/staff/devices/${deviceId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setDevices(devices.filter(device => device.id !== deviceId));
          showNotificationModal('success', 'Success', 'Device deleted successfully!');
        } else {
          const errorData = await response.json();
          if (errorData.error === 'FOREIGN_KEY_CONSTRAINT') {
            const message = `Cannot delete this device because it has associated trade-in orders.\n\nWould you like to deactivate this device instead?`;
            setConfirmTitle('Device Has Orders');
            setConfirmMessage(message);
            setConfirmAction(() => async () => {
              try {
                const deactivateResponse = await fetch(`/api/staff/devices/${deviceId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ isActive: false }),
                });

                if (deactivateResponse.ok) {
                  setDevices(devices.map(device => 
                    device.id === deviceId ? { ...device, isActive: false } : device
                  ));
                  showNotificationModal('success', 'Success', 'Device deactivated successfully!');
                } else {
                  showNotificationModal('error', 'Error', 'Failed to deactivate device. Please try again.');
                }
              } catch (error) {
                console.error('Error deactivating device:', error);
                showNotificationModal('error', 'Error', 'Error deactivating device. Please try again.');
              }
            });
            setShowConfirmModal(true);
          } else {
            showNotificationModal('error', 'Error', 'Failed to delete device. Please try again.');
          }
        }
      } catch (error) {
        console.error('Error deleting device:', error);
        showNotificationModal('error', 'Error', 'Error deleting device. Please try again.');
      }
    });
    setShowConfirmModal(true);
  };

  const handleDeactivateDevice = async (deviceId: number) => {
    try {
      // First get the current device data
      const deviceResponse = await fetch(`/api/staff/devices?type=models`);
      const devices = await deviceResponse.json();
      const device = devices.find((d: any) => d.id === deviceId);
      
      if (!device) {
        alert('Device not found.');
        return;
      }

      const response = await fetch(`/api/staff/devices/${deviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'model',
          data: {
            name: device.name,
            modelNumber: device.modelNumber || '',
            releaseYear: device.releaseYear || new Date().getFullYear(),
            imageUrl: device.imageUrl || '',
            categoryId: device.category?.id?.toString() || '',
            brandId: device.brand?.id?.toString() || '',
            displayOrder: device.displayOrder || 0,
            isActive: false
          }
        }),
      });

      if (response.ok) {
        fetchDeviceManagementData();
        alert('Device deactivated successfully!');
      } else {
        alert('Failed to deactivate device. Please try again.');
      }
    } catch (error) {
      console.error('Error deactivating device:', error);
      alert('Failed to deactivate device. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      modelNumber: '',
      releaseYear: 2024,
      displayOrder: 0,
      categoryId: '',
      brandId: '',
      imageUrl: '',
      isActive: true,
    });
    setStorageOptions([
      {
        storage: '',
        excellentPrice: '',
        goodPrice: '',
        fairPrice: '',
        poorPrice: '',
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

  const handleLogout = () => {
    localStorage.removeItem('staffAuthToken');
    localStorage.removeItem('staffEmail');
    router.push('/staff-login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      case 'PROCESSING':
        return <Package className="w-4 h-4" />;
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'CANCELLED':
      case 'REJECTED':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Brand management functions
  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/staff/brands?type=brands');
      if (response.ok) {
        const data = await response.json();
        setAllBrands(data);
      } else {
        console.error('Failed to fetch brands');
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const handleBrandLogoUpload = async (file: File) => {
    setUploadingBrandLogo(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/staff/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setBrandFormData({ ...brandFormData, logoUrl: data.imageUrl });
      } else {
        console.error('Failed to upload brand logo');
      }
    } catch (error) {
      console.error('Error uploading brand logo:', error);
    } finally {
      setUploadingBrandLogo(false);
    }
  };

  const handleAddBrand = async () => {
    try {
      const response = await fetch('/api/staff/brands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'brand',
          data: brandFormData,
        }),
      });

      if (response.ok) {
        const newBrand = await response.json();
        setAllBrands([...allBrands, newBrand]);
        setShowAddBrandForm(false);
        setBrandFormData({ name: '', logoUrl: '', isActive: true });
        alert('Brand added successfully!');
      } else {
        console.error('Failed to add brand');
        alert('Failed to add brand. Please try again.');
      }
    } catch (error) {
      console.error('Error adding brand:', error);
      alert('Error adding brand. Please try again.');
    }
  };

  const handleUpdateBrand = async () => {
    if (!editingBrand) return;

    try {
      const response = await fetch(`/api/staff/brands/${editingBrand.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'brand',
          data: brandFormData,
        }),
      });

      if (response.ok) {
        const updatedBrand = await response.json();
        setAllBrands(allBrands.map(brand => 
          brand.id === editingBrand.id ? updatedBrand : brand
        ));
        setShowAddBrandForm(false);
        setEditingBrand(null);
        setBrandFormData({ name: '', logoUrl: '', isActive: true });
        alert('Brand updated successfully!');
      } else {
        console.error('Failed to update brand');
        alert('Failed to update brand. Please try again.');
      }
    } catch (error) {
      console.error('Error updating brand:', error);
      alert('Error updating brand. Please try again.');
    }
  };

  const handleDeleteBrand = async (brandId: number) => {
    setConfirmTitle('Delete Brand');
    setConfirmMessage('Are you sure you want to delete this brand?');
    setConfirmAction(() => async () => {
      try {
        const response = await fetch(`/api/staff/brands/${brandId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setAllBrands(allBrands.filter(brand => brand.id !== brandId));
          showNotificationModal('success', 'Success', 'Brand deleted successfully!');
        } else {
          const errorData = await response.json();
          showNotificationModal('error', 'Error', `Failed to delete brand: ${errorData.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error deleting brand:', error);
        showNotificationModal('error', 'Error', 'Error deleting brand. Please try again.');
      }
    });
    setShowConfirmModal(true);
  };

  const handleEditBrand = (brand: any) => {
    setEditingBrand(brand);
    setBrandFormData({
      name: brand.name,
      logoUrl: brand.logoUrl || '',
      isActive: brand.isActive,
    });
    setShowAddBrandForm(true);
  };

  const resetBrandForm = () => {
    setBrandFormData({ name: '', logoUrl: '', isActive: true });
    setEditingBrand(null);
    setShowAddBrandForm(false);
  };

  // Order management functions
  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setOrderStatus(order.status);
    setTrackingNumber(order.shippingLabels?.[0]?.trackingNumber || '');
    setNotes(order.notes || '');
    setPaymentMethod(order.paymentMethod || '');
    setShowOrderDetails(true);
  };

  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder) return;

    setIsUpdatingOrder(true);
    try {
      const response = await fetch(`/api/staff/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: orderStatus,
          trackingNumber,
          notes,
          paymentMethod,
        }),
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders(orders.map(order => 
          order.id === selectedOrder.id ? updatedOrder : order
        ));
        setSelectedOrder(updatedOrder);
        showNotificationModal('success', 'Success', 'Order updated successfully!');
      } else {
        console.error('Failed to update order');
        showNotificationModal('error', 'Error', 'Failed to update order. Please try again.');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      showNotificationModal('error', 'Error', 'Error updating order. Please try again.');
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  const closeOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
    setOrderStatus('');
    setTrackingNumber('');
    setNotes('');
    setPaymentMethod('');
  };

  const handleDeleteOrder = async (orderId: number) => {
    setConfirmTitle('Delete Order');
    setConfirmMessage('Are you sure you want to delete this order? This action cannot be undone.');
    setConfirmAction(() => async () => {
      try {
        const response = await fetch(`/api/staff/orders/${orderId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setOrders(orders.filter(order => order.id !== orderId));
          showNotificationModal('success', 'Success', 'Order deleted successfully!');
        } else {
          console.error('Failed to delete order');
          showNotificationModal('error', 'Error', 'Failed to delete order. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting order:', error);
        showNotificationModal('error', 'Error', 'Error deleting order. Please try again.');
      }
    });
    setShowConfirmModal(true);
  };

  // Client management functions
  const fetchClients = async () => {
    setIsLoadingClients(true);
    try {
      const response = await fetch('/api/staff/clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      } else {
        console.error('Failed to fetch clients');
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setIsLoadingClients(false);
    }
  };

  const handleViewClientDetails = (client: any) => {
    setSelectedClient(client);
    setShowClientDetails(true);
  };

  const closeClientDetails = () => {
    setSelectedClient(null);
  };



  // Filter clients based on search term
  const filteredClients = clients.filter(client => {
    const searchLower = clientSearchTerm.toLowerCase();
    return (
      client.firstName.toLowerCase().includes(searchLower) ||
      client.lastName.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower) ||
      (client.phone && client.phone.toLowerCase().includes(searchLower)) ||
      (client.addressLine1 && client.addressLine1.toLowerCase().includes(searchLower)) ||
      (client.city && client.city.toLowerCase().includes(searchLower)) ||
      (client.province && client.province.toLowerCase().includes(searchLower)) ||
      (client.postalCode && client.postalCode.toLowerCase().includes(searchLower))
    );
  });

  // Filter devices based on search term
  const filteredDevices = devices.filter(device => {
    const searchLower = deviceSearchTerm.toLowerCase();
    return (
      device.name.toLowerCase().includes(searchLower) ||
      (device.modelNumber && device.modelNumber.toLowerCase().includes(searchLower)) ||
      (device.brand?.name && device.brand.name.toLowerCase().includes(searchLower)) ||
      (device.category?.name && device.category.name.toLowerCase().includes(searchLower))
    );
  });

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.deviceModel.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!staff) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">{staff.email}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
          <p className="text-purple-100">Manage trade-in orders and device catalog</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 mb-8 shadow-sm">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'orders'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Package className="w-4 h-4" />
              <span>Orders</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'clients'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Clients</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('management')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'management'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Device Management</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('brands')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'brands'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Brand Management</span>
            </div>
          </button>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {orders.filter(o => o.status === 'PENDING').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Processing</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {orders.filter(o => o.status === 'PROCESSING').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Truck className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {orders.filter(o => o.status === 'COMPLETED').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search orders, customers, or devices..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="text-xl font-semibold text-gray-900">Trade-In Orders</h3>
              </div>
              {isLoadingOrders ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading orders...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Device
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {order.customer.firstName} {order.customer.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{order.customer.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{order.deviceModel.name}</div>
                              <div className="text-sm text-gray-500">
                                {order.deviceModel.brand.name} • {order.deviceCondition.name}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              ${order.finalAmount || order.quotedAmount}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1">{order.status}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(order.submittedAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => handleViewOrderDetails(order)}
                                className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                              >
                                <Eye className="w-4 h-4" />
                                <span>View Details</span>
                              </button>
                              <button 
                                onClick={() => handleDeleteOrder(order.id)}
                                className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Order Details - {selectedOrder.orderNumber}
                </h3>
                <button
                  onClick={closeOrderDetails}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Information */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order Number:</span>
                        <span className="font-medium">{selectedOrder.orderNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                          {getStatusIcon(selectedOrder.status)}
                          <span className="ml-1">{selectedOrder.status}</span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Submitted:</span>
                        <span className="font-medium">{new Date(selectedOrder.submittedAt).toLocaleString()}</span>
                      </div>
                      {selectedOrder.completedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Completed:</span>
                          <span className="font-medium">{new Date(selectedOrder.completedAt).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quoted Amount:</span>
                        <span className="font-medium">${selectedOrder.quotedAmount}</span>
                      </div>
                      {selectedOrder.finalAmount && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Final Amount:</span>
                          <span className="font-medium">${selectedOrder.finalAmount}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="font-medium">{selectedOrder.paymentMethod || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{selectedOrder.customer.firstName} {selectedOrder.customer.lastName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{selectedOrder.customer.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{selectedOrder.customer.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Device Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Device Information</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Device:</span>
                        <span className="font-medium">{selectedOrder.deviceModel.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Brand:</span>
                        <span className="font-medium">{selectedOrder.deviceModel.brand.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">{selectedOrder.deviceModel.category.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Condition:</span>
                        <span className="font-medium">{selectedOrder.deviceCondition.name}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Management */}
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Order Management</h4>
                    <div className="space-y-4">
                      {/* Status Update */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
                        <select
                          value={orderStatus}
                          onChange={(e) => setOrderStatus(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="PROCESSING">Processing</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </div>

                      {/* Tracking Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Number</label>
                        <input
                          type="text"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          placeholder="Enter tracking number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Payment Method */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select payment method</option>
                          <option value="e-transfer">E-Transfer</option>
                          <option value="paypal">PayPal</option>
                          <option value="cheque">Cheque</option>
                        </select>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Add notes about this order..."
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Update Button */}
                      <button
                        onClick={handleUpdateOrderStatus}
                        disabled={isUpdatingOrder}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdatingOrder ? 'Updating...' : 'Update Order'}
                      </button>
                    </div>
                  </div>

                  {/* Shipping Information */}
                  {selectedOrder.shippingLabels && selectedOrder.shippingLabels.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h4>
                      <div className="space-y-3">
                        {selectedOrder.shippingLabels.map((label: any, index: number) => (
                          <div key={index} className="border-l-4 border-blue-500 pl-4">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tracking Number:</span>
                              <span className="font-medium">{label.trackingNumber}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Carrier:</span>
                              <span className="font-medium">{label.carrier}</span>
                            </div>
                            {label.shippedAt && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Shipped:</span>
                                <span className="font-medium">{new Date(label.shippedAt).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Payment Information */}
                  {selectedOrder.payments && selectedOrder.payments.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h4>
                      <div className="space-y-3">
                        {selectedOrder.payments.map((payment: any, index: number) => (
                          <div key={index} className="border-l-4 border-green-500 pl-4">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Amount:</span>
                              <span className="font-medium">${payment.amount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Status:</span>
                              <span className="font-medium">{payment.status}</span>
                            </div>
                            {payment.transactionId && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Transaction ID:</span>
                                <span className="font-medium">{payment.transactionId}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Client Management</h2>
                <p className="text-gray-600 mt-1">View and manage all customer information and trade-in history</p>
              </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search clients by name, email, or phone..."
                      value={clientSearchTerm}
                      onChange={(e) => setClientSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                {clientSearchTerm && (
                  <button
                    onClick={() => setClientSearchTerm('')}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Clients List */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">All Clients</h3>
                  {clientSearchTerm && (
                    <p className="text-sm text-gray-600">
                      Showing {filteredClients.length} of {clients.length} clients
                    </p>
                  )}
                </div>
              </div>
              
              {isLoadingClients ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading clients...</p>
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-gray-500">
                    {clientSearchTerm 
                      ? `No clients found matching "${clientSearchTerm}". Try a different search term.`
                      : 'No clients found.'
                    }
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trade-ins
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Order
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredClients.map((client) => (
                        <tr key={client.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {client.firstName} {client.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {client.id}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm text-gray-900">{client.email}</div>
                              <div className="text-sm text-gray-500">{client.phone}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {client._count?.tradeInOrders || 0} orders
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              ${client.tradeInOrders?.reduce((sum: number, order: any) => 
                                sum + parseFloat(order.finalAmount || order.quotedAmount), 0
                              ).toFixed(2) || '0.00'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {client.tradeInOrders && client.tradeInOrders.length > 0 
                                ? new Date(client.tradeInOrders[0].submittedAt).toLocaleDateString()
                                : 'Never'
                              }
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              onClick={() => handleViewClientDetails(client)}
                              className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                            >
                              <Eye className="w-4 h-4" />
                              <span>View Details</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Client Details Modal */}
        {showClientDetails && selectedClient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Client Details - {selectedClient.firstName} {selectedClient.lastName}
                </h3>
                <button
                  onClick={closeClientDetails}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Client Information */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{selectedClient.firstName} {selectedClient.lastName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{selectedClient.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{selectedClient.phone || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Client ID:</span>
                        <span className="font-medium">{selectedClient.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Member Since:</span>
                        <span className="font-medium">{new Date(selectedClient.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  {(selectedClient.addressLine1 || selectedClient.city || selectedClient.province) && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h4>
                      <div className="space-y-3">
                        {selectedClient.addressLine1 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Address:</span>
                            <span className="font-medium">{selectedClient.addressLine1}</span>
                          </div>
                        )}
                        {selectedClient.addressLine2 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Address 2:</span>
                            <span className="font-medium">{selectedClient.addressLine2}</span>
                          </div>
                        )}
                        {selectedClient.city && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">City:</span>
                            <span className="font-medium">{selectedClient.city}</span>
                          </div>
                        )}
                        {selectedClient.province && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Province:</span>
                            <span className="font-medium">{selectedClient.province}</span>
                          </div>
                        )}
                        {selectedClient.postalCode && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Postal Code:</span>
                            <span className="font-medium">{selectedClient.postalCode}</span>
                          </div>
                        )}
                        {selectedClient.country && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Country:</span>
                            <span className="font-medium">{selectedClient.country}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Summary</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Orders:</span>
                        <span className="font-medium">{selectedClient._count?.tradeInOrders || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Value:</span>
                        <span className="font-medium">
                          ${selectedClient.tradeInOrders?.reduce((sum: number, order: any) => 
                            sum + parseFloat(order.finalAmount || order.quotedAmount), 0
                          ).toFixed(2) || '0.00'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Completed Orders:</span>
                        <span className="font-medium">
                          {selectedClient.tradeInOrders?.filter((order: any) => order.status === 'COMPLETED').length || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pending Orders:</span>
                        <span className="font-medium">
                          {selectedClient.tradeInOrders?.filter((order: any) => order.status === 'PENDING').length || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trade-in History */}
                <div className="lg:col-span-2">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Trade-in History</h4>
                    {selectedClient.tradeInOrders && selectedClient.tradeInOrders.length > 0 ? (
                      <div className="space-y-4">
                        {selectedClient.tradeInOrders.map((order: any) => (
                          <div key={order.id} className="bg-white rounded-lg p-4 border">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <div className="font-medium text-gray-900">{order.orderNumber}</div>
                                <div className="text-sm text-gray-500">
                                  {order.deviceModel.name} • {order.deviceCondition.name}
                                </div>
                              </div>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)}
                                <span className="ml-1">{order.status}</span>
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Amount:</span>
                                <span className="font-medium ml-2">${order.finalAmount || order.quotedAmount}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Date:</span>
                                <span className="font-medium ml-2">{new Date(order.submittedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-gray-500">No trade-in orders found for this client.</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Devices Management Tab */}
        {activeTab === 'management' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Device Management</h2>
                <p className="text-gray-600 mt-1">Manage device catalog, images, and storage options with condition pricing</p>
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Device</span>
              </button>
            </div>

            {/* Add/Edit Device Form - Popup Modal */}
            {(showAddForm || editingDevice) && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {editingDevice ? 'Edit Device' : 'Add New Device'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingDevice(null);
                        resetForm();
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Device Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., iPhone 15 Pro"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Model Number</label>
                      <input
                        type="text"
                        value={formData.modelNumber}
                        onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., A2972"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Release Year</label>
                      <input
                        type="number"
                        value={formData.releaseYear}
                        onChange={(e) => setFormData({ ...formData, releaseYear: parseInt(e.target.value) })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="2025"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                      <input
                        type="number"
                        value={formData.displayOrder}
                        onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Category</option>
                        {deviceCategories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                      <select
                        value={formData.brandId}
                        onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Brand</option>
                        {brands.map((brand) => (
                          <option key={brand.id} value={brand.id}>
                            {brand.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Device Status</label>
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, isActive: true })}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            formData.isActive 
                              ? 'bg-green-600 text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Active
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, isActive: false })}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            !formData.isActive 
                              ? 'bg-red-600 text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Inactive
                        </button>
                        <span className="text-sm text-gray-500">
                          {formData.isActive 
                            ? 'Device will appear in trade-in form' 
                            : 'Device will be hidden from trade-in form'
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Device Image</label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {uploadingImage && <span className="text-sm text-gray-500">Uploading...</span>}
                    </div>
                    {formData.imageUrl && (
                      <div className="mt-2">
                        <img src={formData.imageUrl} alt="Device" className="w-20 h-20 object-cover rounded-lg" />
                      </div>
                    )}
                  </div>

                  {/* Storage Options */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900">Storage Options with Condition Pricing</h4>
                      <button
                        type="button"
                        onClick={addStorageOption}
                        className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700 transition-colors"
                      >
                        Add Storage Option
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {storageOptions.map((option, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="font-medium text-gray-900">Storage Option {index + 1}</h5>
                            {storageOptions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeStorageOption(index)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Storage</label>
                              <input
                                type="text"
                                value={option.storage}
                                onChange={(e) => updateStorageOption(index, 'storage', e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 128GB"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Excellent Price</label>
                              <input
                                type="number"
                                value={option.excellentPrice}
                                onChange={(e) => updateStorageOption(index, 'excellentPrice', e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Good Price</label>
                              <input
                                type="number"
                                value={option.goodPrice}
                                onChange={(e) => updateStorageOption(index, 'goodPrice', e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Fair Price</label>
                              <input
                                type="number"
                                value={option.fairPrice}
                                onChange={(e) => updateStorageOption(index, 'fairPrice', e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Poor Price</label>
                              <input
                                type="number"
                                value={option.poorPrice}
                                onChange={(e) => updateStorageOption(index, 'poorPrice', e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-4 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingDevice(null);
                        resetForm();
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={editingDevice ? handleUpdateDevice : handleAddDevice}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      {editingDevice ? 'Update Device' : 'Add Device'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Devices List */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Device Models</h3>
                    {deviceSearchTerm && (
                      <p className="text-sm text-gray-600 mt-1">
                        Showing {filteredDevices.length} of {devices.length} devices
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search devices, brands, or categories..."
                        value={deviceSearchTerm}
                        onChange={(e) => setDeviceSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                      />
                    </div>
                    {deviceSearchTerm && (
                      <button
                        onClick={() => setDeviceSearchTerm('')}
                        className="text-gray-500 hover:text-gray-700 text-sm"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {filteredDevices.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-gray-500">
                    {deviceSearchTerm 
                      ? `No devices found matching "${deviceSearchTerm}". Try a different search term.`
                      : 'No devices found. Add your first device to get started.'
                    }
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Device
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Brand
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Storage Options
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredDevices.map((device) => (
                        <tr key={device.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {device.imageUrl ? (
                                  <img className="h-10 w-10 rounded-lg object-cover" src={device.imageUrl} alt={device.name} />
                                ) : (
                                  <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                    {getCategoryIcon(device.category?.name || 'smartphone')}
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{device.name}</div>
                                {device.modelNumber && (
                                  <div className="text-sm text-gray-500">{device.modelNumber}</div>
                                )}
                                {device.releaseYear && (
                                  <div className="text-sm text-gray-500">Year: {device.releaseYear}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{device.brand?.name || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{device.category?.name || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {device.storageOptions?.length || 0} options
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              device.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {device.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => {
                                  setEditingDevice(device);
                                  setFormData({
                                    name: device.name,
                                    modelNumber: device.modelNumber || '',
                                    releaseYear: device.releaseYear || new Date().getFullYear(),
                                    imageUrl: device.imageUrl || '',
                                    categoryId: device.category?.id?.toString() || '',
                                    brandId: device.brand?.id?.toString() || '',
                                    displayOrder: device.displayOrder || 0,
                                    isActive: device.isActive,
                                  });
                                  if (device.storageOptions && device.storageOptions.length > 0) {
                                    const options = device.storageOptions.map((opt: any) => ({
                                      storage: opt.storage,
                                      excellentPrice: opt.excellentPrice,
                                      goodPrice: opt.goodPrice,
                                      fairPrice: opt.fairPrice,
                                      poorPrice: opt.poorPrice,
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
                                className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                              >
                                <Edit className="w-4 h-4" />
                                <span>Edit</span>
                              </button>
                              <button 
                                onClick={() => handleDeleteDevice(device.id)}
                                className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Brands Tab */}
        {activeTab === 'brands' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Brand Management</h2>
                <p className="text-gray-600">Manage device brands and manufacturers</p>
              </div>
              <button
                onClick={() => setShowAddBrandForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Brand</span>
              </button>
            </div>

            {/* Brands List */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">All Brands</h3>
                {allBrands.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No brands found. Add your first brand to get started.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {allBrands.map((brand) => (
                      <div key={brand.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          {brand.logoUrl ? (
                            <img 
                              src={brand.logoUrl} 
                              alt={brand.name} 
                              className="w-12 h-12 object-contain rounded-lg"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <BarChart3 className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="text-lg font-medium text-gray-900">{brand.name}</div>
                            <div className="text-sm text-gray-500">
                              {brand._count?.deviceModels || 0} device models
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            brand.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {brand.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleEditBrand(brand)}
                              className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                            >
                              <Edit className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                            <button 
                              onClick={() => handleDeleteBrand(brand.id)}
                              className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Brand Modal */}
        {showAddBrandForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingBrand ? 'Edit Brand' : 'Add New Brand'}
                </h3>
                <button
                  onClick={resetBrandForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (editingBrand) {
                  handleUpdateBrand();
                } else {
                  handleAddBrand();
                }
              }}>
                <div className="space-y-4">
                  {/* Brand Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={brandFormData.name}
                      onChange={(e) => setBrandFormData({ ...brandFormData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Apple, Samsung, Google"
                    />
                  </div>

                  {/* Brand Logo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand Logo
                    </label>
                    <div className="flex items-center space-x-4">
                      {brandFormData.logoUrl ? (
                        <div className="relative">
                          <img 
                            src={brandFormData.logoUrl} 
                            alt="Brand logo" 
                            className="w-16 h-16 object-contain rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => setBrandFormData({ ...brandFormData, logoUrl: '' })}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleBrandLogoUpload(file);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {uploadingBrandLogo && (
                          <p className="text-sm text-blue-600 mt-1">Uploading...</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Brand Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand Status</label>
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => setBrandFormData({ ...brandFormData, isActive: true })}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          brandFormData.isActive
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Active
                      </button>
                      <button
                        type="button"
                        onClick={() => setBrandFormData({ ...brandFormData, isActive: false })}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          !brandFormData.isActive
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Inactive
                      </button>
                      <span className="text-sm text-gray-500">
                        {brandFormData.isActive
                          ? 'Brand will appear in device forms'
                          : 'Brand will be hidden from device forms'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={resetBrandForm}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingBrand ? 'Update Brand' : 'Add Brand'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => {
          if (confirmAction) {
            confirmAction();
          }
        }}
        title={confirmTitle}
        message={confirmMessage}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
      
      {/* Notification Modal */}
      <NotificationModal
        isOpen={showNotification}
        onClose={() => setShowNotification(false)}
        type={notificationType}
        title={notificationTitle}
        message={notificationMessage}
      />
    </div>
  );
} 