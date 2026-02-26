import { IsDate, IsOptional, IsPositive, Max } from 'class-validator';
import { Expose, Transform, Type } from 'class-transformer';
type json = Record<string, any>;

export enum QueryHttpReqEnum {
  DEFAULT_PAGE = 1,
  DEFAULT_PER_PAGE = 25,
}

export class QueryHttpReqDto {
  @Expose()
  @IsOptional()
  criteria?: string = '';

  @Expose()
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  @Transform(({ obj, key }: { obj: json; key: string }) => {
    if (!obj[key]) {
      return new Date(1800, 0, 1);
    }
    const dateStr: string = obj[key];
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  })
  from?: Date;

  @Expose()
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  @Transform(({ obj, key }: { obj: json; key: string }) => {
    if (!obj[key]) {
      return new Date(Date.UTC(3000, 0, 1, 23, 59, 59, 999));
    }
    const dateStr: string = obj[key];
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
  })
  to?: Date;

  @Expose()
  @IsOptional()
  @IsPositive()
  @Transform(({ value }) => {
    return +(value || QueryHttpReqEnum.DEFAULT_PAGE);
  })
  page?: number = QueryHttpReqEnum.DEFAULT_PAGE;

  @Expose()
  @IsOptional()
  @IsPositive()
  @Max(255)
  @Transform(({ value }) => {
    return +(value || QueryHttpReqEnum.DEFAULT_PER_PAGE);
  })
  per_page?: number = QueryHttpReqEnum.DEFAULT_PER_PAGE;
}
