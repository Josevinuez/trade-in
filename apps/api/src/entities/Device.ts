import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { DeviceType, DeviceBrand, StorageOption, DeviceCondition } from '@device-buyback/types';

@Entity()
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ['smartphone', 'tablet', 'laptop', 'smartwatch'],
  })
  type: DeviceType;

  @Column({
    type: 'enum',
    enum: ['apple', 'samsung', 'google', 'microsoft', 'other'],
  })
  brand: DeviceBrand;

  @Column()
  model: string;

  @Column('simple-array')
  storageOptions: StorageOption[];

  @Column('decimal', { precision: 10, scale: 2 })
  basePrice: number;

  @Column('jsonb')
  conditionMultipliers: Record<DeviceCondition, number>;

  @Column('jsonb')
  storageMultipliers: Record<StorageOption, number>;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ nullable: true })
  releaseDate?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 