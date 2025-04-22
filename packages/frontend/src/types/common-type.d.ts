declare interface List<T> {
  total: bigint;
  data: T extends unknown[] ? T : T[];
}

declare type Form = InstanceType<typeof TinyForm> & { validate: () => Promise<boolean> };
