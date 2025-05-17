export interface Doctor {
  _id: string;
  name: string;
  qualification: string;
  specialization: string;
  department: string;
  registerNumber: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  phone: string;
  email: string;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DoctorFormData {
  name: string;
  qualification: string;
  specialization: string;
  department: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  phone: string;
  email: string;
  status?: boolean;
}