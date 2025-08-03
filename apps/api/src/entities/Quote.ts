import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { StorageOption, DeviceCondition } from '@device-buyback/types';
import { Device } from './Device';

@Entity()
export class Quote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  deviceId: string;

  @ManyToOne(() => Device)
  @JoinColumn({ name: 'deviceId' })
  device: Device;

  @Column({
    type: 'enum',
    enum: ['64GB', '128GB', '256GB', '512GB', '1TB'],
  })
  storage: StorageOption;

  @Column({
    type: 'enum',
    enum: ['like-new', 'good', 'fair', 'poor'],
  })
  condition: DeviceCondition;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('jsonb', { nullable: true })
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 