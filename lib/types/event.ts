/**
 * イベントの型定義
 */
export interface Event {
  id: number;
  title: string;
  detail: string | null;
  status: number;
  start_period: string;
  end_period: string;
  first_voting_start_period: string;
  first_voting_end_period: string;
  second_voting_start_period: string;
  second_voting_end_period: string;
  public_flag: boolean;
  created_at: string;
  updated_at: string;
  deleted_flag: boolean;
}
