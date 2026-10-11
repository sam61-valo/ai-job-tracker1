export type Status = "applied" | "interview" | "offer" | "rejected";
export const STATUSES: Status[] = ["applied", "interview", "offer", "rejected"];
export interface Application {
  id: number; company: string; role: string; status: Status;
  location: string; job_url: string; notes: string; applied_date: string | null;
}