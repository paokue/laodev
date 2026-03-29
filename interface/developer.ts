// Developer interface on admin
export interface Developer {
  id: string;
  name: string;
  email: string;
  title: string;
  location: string;
  skills: string[];
  experience: string;
  hourlyRate: number;
  bio: string;
  appliedAt: string;
  status: "pending" | "active" | "rejected" | "suspended";
  bookings?: number;
  rating?: number;
}
