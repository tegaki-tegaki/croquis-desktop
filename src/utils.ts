export const selectRandom = (array: any[]) =>
  array[Math.floor(Math.random() * array.length)];
