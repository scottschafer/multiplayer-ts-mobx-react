export class UtilRandom {

  static rangeRandom(min = 1, max = 6) {
    return Math.floor(min + Math.random() * (max - min + 1));
  }

  static generate(population: number, thresh: number) {
    let result = 0;
    while (population--) {
      if (UtilRandom.rangeRandom() <= thresh) {
        ++result;
      }
    }
    return result;
  }
};
