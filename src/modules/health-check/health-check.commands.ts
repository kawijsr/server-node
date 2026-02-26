import {IsNotEmpty, IsObject, IsString} from 'class-validator';
import {PickType} from '../../commons/utils/class-extends';
import {Expose} from 'class-transformer';
type json = Record<string, any>;

export class PingDynamicCommand {
  @Expose()
  @IsString()
  id: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  t: string;
}

export class PingDynamicCommandPost extends PickType(PingDynamicCommand, ['id', 'name'], ['t']) {
  @Expose()
  @IsObject()
  @IsNotEmpty()
  body: json;
}