export interface User {
  id: string
  phone_number: string
  email: string | null
  name: string | null
  created_at: string
  dateOfBirth: Date | null
  image_url: string | null
  scores: number
  role: Roles
}

export enum Roles {
  USER = 0,
  COURIER = 1,
  COOK = 2,
  MANAGER = 3,
  ADMIN = 4
}
export const RolesLabels: Record<Roles, string> = {
  [Roles.USER]: 'Пользователь',
  [Roles.COURIER]: 'Курьер',
  [Roles.COOK]: 'Повар',
  [Roles.MANAGER]: 'Менеджер',
  [Roles.ADMIN]: 'Администратор',
}

export const createEmptyUser = () :User => ({
  id: '',
  phone_number: '',
  email: '',
  name: '',
  created_at: '',
  dateOfBirth: new Date(),
  image_url: '',
  scores: 0,
  role: Roles.USER
})