// 利用規約の型定義

export interface Terms {
  id: number;
  file_name: string;
  data_path: string;
  public_flag: boolean;
  admin_id: number;
  applied_at: Date | null;
  scheduled_applied_at: Date | null;
  created_at: Date;
  updated_at: Date;
  deleted_flag: boolean;
}

export interface CurrentTermsResponse {
  success: boolean;
  terms: {
    id: number;
    file_name: string;
    data_path: string;
    applied_at: string | null;
  } | null;
  message?: string;
}
