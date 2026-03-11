/**
 * models/Animal.ts
 * Interface TypeScript para a entidade Animal.
 */

export type AnimalSpecies = 'dog' | 'cat' | 'bird' | 'other';
export type AnimalGender = 'male' | 'female' | 'unknown';

export interface Animal {
  id: number;
  species: AnimalSpecies;
  breed?: string;
  color?: string;
  estimated_age?: string;
  gender: AnimalGender;
  description?: string;
  created_at: Date;
}

export interface CreateAnimalDTO {
  species: AnimalSpecies;
  breed?: string;
  color?: string;
  estimated_age?: string;
  gender?: AnimalGender;
  description?: string;
}
