export interface User {
  id: string
  phone_number: string
  email: string | null
  name: string | null
  createdAt: string
  dateOfBirth: Date | null
  imageUrl: string | null
  scores: number
  role: 0|1|2|3|4
}