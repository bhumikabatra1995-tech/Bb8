export type HouseId = '33C' | '34C'

export type Member = {
  id: string
  name: string
  house: HouseId
  city: string
  kid?: boolean
}

export const MEMBERS: Member[] = [
  { id: 'bhumika', name: 'Bhumika', house: '33C', city: 'New York' },
  { id: 'rachita', name: 'Rachita', house: '33C', city: 'Vancouver' },
  { id: 'mom', name: 'Mom', house: '33C', city: 'Delhi' },
  { id: 'dad', name: 'Dad', house: '33C', city: 'Delhi' },
  { id: 'avika', name: 'Avika', house: '34C', city: 'Delhi', kid: true },
  { id: 'avya', name: 'Avya', house: '34C', city: 'Delhi', kid: true },
  { id: 'bhabhi', name: 'Bhabhi', house: '34C', city: 'Delhi' },
  { id: 'bhaiya', name: 'Bhaiya', house: '34C', city: 'Delhi' },
  { id: 'auntie', name: 'Auntie', house: '34C', city: 'Delhi' },
  { id: 'uncle', name: 'Uncle', house: '34C', city: 'Delhi' },
]

export const memberById = (id: string | null | undefined) => MEMBERS.find((m) => m.id === id)
export const membersOf = (house: HouseId) => MEMBERS.filter((m) => m.house === house)

export const CITIES = [
  { name: 'New York', lat: 40.71, lon: -74.01, who: 'Bhumika' },
  { name: 'Vancouver', lat: 49.28, lon: -123.12, who: 'Rachita' },
  { name: 'Delhi', lat: 28.61, lon: 77.21, who: '33C & 34C' },
]
