export const selectRandom = (array: any[]) =>
  array[Math.floor(Math.random() * array.length)];

export const log = (...loggable: any) => {
  console.log("renderer: ", ...loggable);
};
