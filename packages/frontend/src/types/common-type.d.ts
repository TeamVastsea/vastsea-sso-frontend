declare interface List<T> {
  total: bigint;
  data: T extends unknown[] ? T : T[];
}
