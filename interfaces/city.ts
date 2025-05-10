export interface City {
  id: string
  name: string
  point: [number, number]
}

export const CityFieldLabels: Record<string, string> = {
  name: 'Название города',
};