import { Expose, Type } from 'class-transformer';

class PaginatedDto {
  @Expose()
  total!: number;

  @Expose()
  count!: number;

  @Expose()
  per_page!: number;

  @Expose()
  current_page!: number;

  @Expose()
  total_pages!: number;
}

class PaginatedLinksDto {
  @Expose()
  self!: string;

  @Expose()
  next!: string;

  @Expose()
  prev!: string;

  @Expose()
  first!: string;

  @Expose()
  last!: string;
}

class PaginatedHttpResDto {
  @Expose()
  @Type(() => PaginatedDto)
  pagination!: PaginatedDto;

  @Expose()
  @Type(() => PaginatedLinksDto)
  links!: PaginatedLinksDto;
}

export { PaginatedHttpResDto };
