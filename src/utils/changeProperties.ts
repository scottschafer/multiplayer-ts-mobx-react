// remove 'readonly' from all fields
export type MakeWritable<T> = {
  -readonly [K in keyof T]: T[K]
};


// remove readonly and make all fields optional
export type MakeWritableOptional<T> = {
  -readonly [K in keyof T]?: T[K]
};

// remove readonly and make all fields optional
export type MakeOptional<T> = {
  [K in keyof T]?: T[K]
};
