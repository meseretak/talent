// DTO for hiring/firing/saving a freelancer
export interface HireFreelancerDto {
  clientId: number;
  freelancerId: number;
}

export interface FireFreelancerDto {
  clientId: number;
  freelancerId: number;
  reason?: string;
}
