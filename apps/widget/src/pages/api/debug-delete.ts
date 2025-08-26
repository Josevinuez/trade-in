import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { deviceId } = req.body;
      
      if (!deviceId) {
        return res.status(400).json({ error: 'Device ID is required' });
      }

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      console.log('Debug Delete: Testing deletion for device:', deviceId);

      // First, check if the device exists
      const { data: device, error: deviceError } = await supabaseAdmin
        .from('DeviceModel')
        .select('*')
        .eq('id', parseInt(deviceId))
        .single();

      if (deviceError) {
        return res.status(404).json({ error: 'Device not found', details: deviceError });
      }

      console.log('Debug Delete: Found device:', device);

      // Check storage options
      const { data: storageOptions, error: storageError } = await supabaseAdmin
        .from('DeviceStorageOption')
        .select('*')
        .eq('deviceModelId', parseInt(deviceId));

      if (storageError) {
        console.log('Debug Delete: Storage options error:', storageError);
      } else {
        console.log('Debug Delete: Found storage options:', storageOptions?.length || 0);
      }

      // Check if there are any orders referencing this device
      try {
        const { data: orders, error: ordersError } = await supabaseAdmin
          .from('Order')
          .select('*')
          .eq('deviceModelId', parseInt(deviceId))
          .limit(1);

        if (ordersError) {
          console.log('Debug Delete: Orders check error (might not exist):', ordersError);
        } else {
          console.log('Debug Delete: Found orders:', orders?.length || 0);
        }
      } catch (err) {
        console.log('Debug Delete: Orders table might not exist');
      }

      // Try to delete storage options first
      console.log('Debug Delete: Attempting to delete storage options...');
      const { error: deleteStorageError } = await supabaseAdmin
        .from('DeviceStorageOption')
        .delete()
        .eq('deviceModelId', parseInt(deviceId));

      if (deleteStorageError) {
        console.log('Debug Delete: Storage options delete failed:', deleteStorageError);
        return res.status(500).json({ 
          error: 'Storage options delete failed', 
          details: deleteStorageError,
          message: 'This might be due to foreign key constraints'
        });
      }

      console.log('Debug Delete: Storage options deleted successfully');

      // Now try to delete the device
      console.log('Debug Delete: Attempting to delete device...');
      const { data: deletedDevice, error: deleteDeviceError } = await supabaseAdmin
        .from('DeviceModel')
        .delete()
        .eq('id', parseInt(deviceId))
        .select()
        .single();

      if (deleteDeviceError) {
        console.log('Debug Delete: Device delete failed:', deleteDeviceError);
        return res.status(500).json({ 
          error: 'Device delete failed', 
          details: deleteDeviceError,
          message: 'This might be due to foreign key constraints'
        });
      }

      console.log('Debug Delete: Device deleted successfully:', deletedDevice);

      return res.status(200).json({
        success: true,
        message: 'Device deleted successfully',
        deletedDevice,
        steps: [
          'Storage options deleted',
          'Device deleted'
        ]
      });

    } catch (error) {
      console.error('Debug Delete: Error:', error);
      return res.status(500).json({ 
        error: 'Debug delete failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
