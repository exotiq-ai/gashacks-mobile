export type VehicleTemplate = {
  make: string;
  model: string;
  years: string;
  tankGallons: number;
  engine?: string;
};

export const VEHICLE_DATABASE: VehicleTemplate[] = [
  // Audi
  { make: "Audi", model: "RS3", years: "2017-2025", tankGallons: 14.5, engine: "2.5T I5" },
  { make: "Audi", model: "S3", years: "2015-2025", tankGallons: 13.2, engine: "2.0T I4" },
  { make: "Audi", model: "S4", years: "2018-2025", tankGallons: 16.6, engine: "3.0T V6" },
  { make: "Audi", model: "S5", years: "2018-2025", tankGallons: 16.6, engine: "3.0T V6" },
  { make: "Audi", model: "RS5", years: "2018-2025", tankGallons: 16.6, engine: "2.9TT V6" },
  { make: "Audi", model: "S6", years: "2020-2025", tankGallons: 18.5, engine: "2.9TT V6" },
  { make: "Audi", model: "RS6 Avant", years: "2021-2025", tankGallons: 22.5, engine: "4.0TT V8" },
  { make: "Audi", model: "S7", years: "2020-2025", tankGallons: 18.5, engine: "2.9TT V6" },
  { make: "Audi", model: "RS7", years: "2021-2025", tankGallons: 22.5, engine: "4.0TT V8" },
  { make: "Audi", model: "S8", years: "2020-2025", tankGallons: 23.7, engine: "4.0TT V8" },
  { make: "Audi", model: "SQ5", years: "2018-2025", tankGallons: 18.5, engine: "3.0T V6" },
  { make: "Audi", model: "RSQ8", years: "2020-2025", tankGallons: 22.5, engine: "4.0TT V8" },
  { make: "Audi", model: "TTRS", years: "2018-2022", tankGallons: 14.5, engine: "2.5T I5" },

  // BMW
  { make: "BMW", model: "M2", years: "2023-2025", tankGallons: 15.6, engine: "3.0T I6" },
  { make: "BMW", model: "M3", years: "2021-2025", tankGallons: 15.6, engine: "3.0TT I6" },
  { make: "BMW", model: "M4", years: "2021-2025", tankGallons: 15.6, engine: "3.0TT I6" },
  { make: "BMW", model: "M5", years: "2018-2025", tankGallons: 20.1, engine: "4.4TT V8" },
  { make: "BMW", model: "M8", years: "2020-2025", tankGallons: 20.1, engine: "4.4TT V8" },
  { make: "BMW", model: "340i/M340i", years: "2019-2025", tankGallons: 15.6, engine: "3.0T I6" },
  { make: "BMW", model: "X3 M", years: "2020-2025", tankGallons: 17.7, engine: "3.0TT I6" },
  { make: "BMW", model: "X5 M", years: "2020-2025", tankGallons: 22.0, engine: "4.4TT V8" },

  // Mercedes
  { make: "Mercedes", model: "C63 AMG", years: "2015-2025", tankGallons: 17.4, engine: "4.0TT V8 / 2.0T I4" },
  { make: "Mercedes", model: "E63 AMG", years: "2018-2025", tankGallons: 20.1, engine: "4.0TT V8" },
  { make: "Mercedes", model: "AMG GT", years: "2018-2025", tankGallons: 19.8, engine: "4.0TT V8" },
  { make: "Mercedes", model: "CLA 45 AMG", years: "2020-2025", tankGallons: 14.8, engine: "2.0T I4" },
  { make: "Mercedes", model: "GLC 63 AMG", years: "2018-2025", tankGallons: 17.4, engine: "4.0TT V8" },

  // Porsche
  { make: "Porsche", model: "911 Turbo", years: "2020-2025", tankGallons: 16.9, engine: "3.7TT H6" },
  { make: "Porsche", model: "911 GT3", years: "2022-2025", tankGallons: 16.9, engine: "4.0 H6" },
  { make: "Porsche", model: "Cayman GT4", years: "2020-2025", tankGallons: 16.9, engine: "4.0 H6" },
  { make: "Porsche", model: "Macan S/GTS", years: "2019-2025", tankGallons: 17.1, engine: "2.9TT V6" },
  { make: "Porsche", model: "Cayenne Turbo", years: "2019-2025", tankGallons: 23.7, engine: "4.0TT V8" },

  // VW
  { make: "VW", model: "Golf R", years: "2015-2025", tankGallons: 13.2, engine: "2.0T I4" },
  { make: "VW", model: "Golf GTI", years: "2015-2025", tankGallons: 13.2, engine: "2.0T I4" },
  { make: "VW", model: "Jetta GLI", years: "2019-2025", tankGallons: 13.2, engine: "2.0T I4" },

  // Ford
  { make: "Ford", model: "Mustang GT", years: "2018-2025", tankGallons: 16.0, engine: "5.0 V8" },
  { make: "Ford", model: "Mustang EcoBoost", years: "2018-2025", tankGallons: 16.0, engine: "2.3T I4" },
  { make: "Ford", model: "F-150 3.5 EcoBoost", years: "2017-2025", tankGallons: 26.0, engine: "3.5TT V6" },
  { make: "Ford", model: "Focus RS", years: "2016-2018", tankGallons: 13.7, engine: "2.3T I4" },

  // Chevy / GM
  { make: "Chevrolet", model: "Camaro SS", years: "2016-2025", tankGallons: 19.0, engine: "6.2 V8" },
  { make: "Chevrolet", model: "Corvette C8", years: "2020-2025", tankGallons: 18.5, engine: "6.2 V8" },
  { make: "Chevrolet", model: "Corvette Z06 C8", years: "2023-2025", tankGallons: 18.5, engine: "5.5 V8" },

  // Dodge
  { make: "Dodge", model: "Charger SRT", years: "2015-2023", tankGallons: 18.5, engine: "6.2SC V8" },
  { make: "Dodge", model: "Challenger SRT", years: "2015-2023", tankGallons: 18.5, engine: "6.2SC V8" },

  // Subaru
  { make: "Subaru", model: "WRX", years: "2015-2025", tankGallons: 15.9, engine: "2.4T H4" },
  { make: "Subaru", model: "WRX STI", years: "2015-2021", tankGallons: 15.9, engine: "2.5T H4" },

  // Mitsubishi
  { make: "Mitsubishi", model: "Evo X", years: "2008-2015", tankGallons: 14.0, engine: "2.0T I4" },

  // Toyota
  { make: "Toyota", model: "Supra 3.0", years: "2020-2025", tankGallons: 13.7, engine: "3.0T I6" },
  { make: "Toyota", model: "GR Corolla", years: "2023-2025", tankGallons: 13.2, engine: "1.6T I3" },

  // Nissan
  { make: "Nissan", model: "GT-R", years: "2009-2024", tankGallons: 19.5, engine: "3.8TT V6" },
  { make: "Nissan", model: "370Z", years: "2009-2020", tankGallons: 19.0, engine: "3.7 V6" },
  { make: "Nissan", model: "Z (400Z)", years: "2023-2025", tankGallons: 16.0, engine: "3.0TT V6" },

  // Honda
  { make: "Honda", model: "Civic Type R", years: "2017-2025", tankGallons: 12.4, engine: "2.0T I4" },
  { make: "Honda", model: "Civic Si", years: "2017-2025", tankGallons: 12.4, engine: "1.5T I4" },

  // Hyundai / Kia
  { make: "Hyundai", model: "Veloster N", years: "2019-2022", tankGallons: 13.2, engine: "2.0T I4" },
  { make: "Hyundai", model: "Elantra N", years: "2022-2025", tankGallons: 12.4, engine: "2.0T I4" },
  { make: "Kia", model: "Stinger GT", years: "2018-2025", tankGallons: 15.9, engine: "3.3TT V6" },
];

export const MAKES = [...new Set(VEHICLE_DATABASE.map((v) => v.make))].sort();

export function getModelsForMake(make: string): VehicleTemplate[] {
  return VEHICLE_DATABASE.filter((v) => v.make === make).sort((a, b) =>
    a.model.localeCompare(b.model),
  );
}
