import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  UserProfile,
  BodyMetricsRecord,
  CreateUserProfileRequest,
  UpdateUserProfileRequest,
  CreateBodyMetricsRequest,
} from '@/types';

// 数据存储目录
const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const RECORDS_FILE = path.join(DATA_DIR, 'records.json');

@Injectable()
export class StorageService {
  constructor() {
    this.ensureDataDir();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
    }
    if (!fs.existsSync(RECORDS_FILE)) {
      fs.writeFileSync(RECORDS_FILE, JSON.stringify([], null, 2));
    }
  }

  private readUsers(): UserProfile[] {
    try {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private writeUsers(users: UserProfile[]): void {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  }

  private readRecords(): BodyMetricsRecord[] {
    try {
      const data = fs.readFileSync(RECORDS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private writeRecords(records: BodyMetricsRecord[]): void {
    fs.writeFileSync(RECORDS_FILE, JSON.stringify(records, null, 2));
  }

  // 用户相关操作
  async createUser(data: CreateUserProfileRequest): Promise<UserProfile> {
    const users = this.readUsers();
    const now = new Date().toISOString();
    const user: UserProfile = {
      id: uuidv4(),
      nickname: data.nickname,
      age: data.age,
      gender: data.gender,
      created_at: now,
      updated_at: now,
    };
    users.push(user);
    this.writeUsers(users);
    return user;
  }

  async getUserById(id: string): Promise<UserProfile | null> {
    const users = this.readUsers();
    return users.find((u) => u.id === id) || null;
  }

  async getUserByNickname(nickname: string): Promise<UserProfile | null> {
    const users = this.readUsers();
    return users.find((u) => u.nickname === nickname) || null;
  }

  async updateUser(id: string, data: UpdateUserProfileRequest): Promise<UserProfile | null> {
    const users = this.readUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return null;

    users[index] = {
      ...users[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    this.writeUsers(users);
    return users[index];
  }

  async getAllUsers(): Promise<UserProfile[]> {
    return this.readUsers();
  }

  // 体脂记录相关操作
  async createRecord(data: CreateBodyMetricsRequest): Promise<BodyMetricsRecord> {
    const records = this.readRecords();
    const record: BodyMetricsRecord = {
      id: uuidv4(),
      user_id: data.user_id,
      record_date: data.record_date,
      weight: data.weight,
      bmi: data.bmi,
      body_fat: data.body_fat,
      skeletal_muscle: data.skeletal_muscle,
      visceral_fat: data.visceral_fat,
      waist_hip_ratio: data.waist_hip_ratio,
      bmr: data.bmr,
      water_rate: data.water_rate,
      bone_salt: data.bone_salt,
      protein: data.protein,
      lean_mass: data.lean_mass,
      body_age: data.body_age,
      source: data.source,
      image_url: data.image_url,
      created_at: new Date().toISOString(),
    };
    records.push(record);
    this.writeRecords(records);
    return record;
  }

  async createRecordsBatch(dataList: CreateBodyMetricsRequest[]): Promise<BodyMetricsRecord[]> {
    const records = this.readRecords();
    const now = new Date().toISOString();
    const newRecords: BodyMetricsRecord[] = dataList.map((data) => ({
      id: uuidv4(),
      user_id: data.user_id,
      record_date: data.record_date,
      weight: data.weight,
      bmi: data.bmi,
      body_fat: data.body_fat,
      skeletal_muscle: data.skeletal_muscle,
      visceral_fat: data.visceral_fat,
      waist_hip_ratio: data.waist_hip_ratio,
      bmr: data.bmr,
      water_rate: data.water_rate,
      bone_salt: data.bone_salt,
      protein: data.protein,
      lean_mass: data.lean_mass,
      body_age: data.body_age,
      source: data.source,
      image_url: data.image_url,
      created_at: now,
    }));
    records.push(...newRecords);
    this.writeRecords(records);
    return newRecords;
  }

  async getRecordsByUserId(userId: string): Promise<BodyMetricsRecord[]> {
    const records = this.readRecords();
    return records
      .filter((r) => r.user_id === userId)
      .sort((a, b) => new Date(a.record_date).getTime() - new Date(b.record_date).getTime());
  }

  async getRecordById(id: string): Promise<BodyMetricsRecord | null> {
    const records = this.readRecords();
    return records.find((r) => r.id === id) || null;
  }

  async getRecordsInRange(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<BodyMetricsRecord[]> {
    const records = await this.getRecordsByUserId(userId);
    return records.filter((r) => {
      const date = new Date(r.record_date);
      return date >= new Date(startDate) && date <= new Date(endDate);
    });
  }

  async deleteRecord(id: string): Promise<boolean> {
    const records = this.readRecords();
    const index = records.findIndex((r) => r.id === id);
    if (index === -1) return false;
    records.splice(index, 1);
    this.writeRecords(records);
    return true;
  }

  async getLatestRecord(userId: string): Promise<BodyMetricsRecord | null> {
    const records = await this.getRecordsByUserId(userId);
    if (records.length === 0) return null;
    return records[records.length - 1];
  }

  async getPreviousRecord(userId: string, beforeDate: string): Promise<BodyMetricsRecord | null> {
    const records = await this.getRecordsByUserId(userId);
    const filtered = records.filter((r) => r.record_date < beforeDate);
    if (filtered.length === 0) return null;
    return filtered[filtered.length - 1];
  }
}
