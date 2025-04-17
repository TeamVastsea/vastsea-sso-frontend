import { Expose, Transform } from 'class-transformer';

export class Permission {
  @Transform(({ value }: { value: bigint }) => value.toString())
  id: bigint;
  @Expose()
  name: string;
  @Expose()
  desc: string;
}
