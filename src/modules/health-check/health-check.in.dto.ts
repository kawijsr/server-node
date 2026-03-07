import {IsString} from 'class-validator';
import {Expose} from 'class-transformer';

export class PingDynamicPostInDto {
  @Expose()
  @IsString()
  foo: string;
}