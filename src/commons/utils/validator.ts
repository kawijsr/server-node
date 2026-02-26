import {plainToInstance} from 'class-transformer';
import {
  ClassConstructor,
  ClassTransformOptions,
} from 'class-transformer/types/interfaces';
import {validateOrReject, ValidatorOptions} from 'class-validator';
import {Request} from 'express';
import {QueryHttpReqEnum} from '../dto/query.http.req.dto';
import {BadRequestException} from '../exceptions/exceptions';

export class Validator {

  static transform<S, T>(
      cls: ClassConstructor<T>,
      obj: S | S[],
      options: ClassTransformOptions = {
        enableCircularCheck: true,
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      },
  ): T | T[] {
    return plainToInstance(cls, JSON.parse(JSON.stringify(obj)), options);
  }

  static transformPaginated<T>(
      cls: ClassConstructor<T>,
      data: [[], number],
      req: Request,
  ) {
    const {page, per_page} = req.query;
    const [items, counter] = data || [[], 0];
    const perPage =
        +(per_page || QueryHttpReqEnum.DEFAULT_PER_PAGE) ||
        QueryHttpReqEnum.DEFAULT_PER_PAGE;
    const currentPage =
        +(page || QueryHttpReqEnum.DEFAULT_PAGE) ||
        QueryHttpReqEnum.DEFAULT_PAGE;
    const totalPages = Math.ceil((counter ?? 0) / perPage);

    const newQueryParams = Array.from(
        new Set(Object.keys(req.query).filter((key) => key !== 'page')),
    ).map((key) => `&${key}=${req.query[key]}`).join('').substring(1);

    return Validator.transform(cls, {
      data: items || [],
      pagination: {
        total: counter ?? 0,
        count: items?.length ?? 0,
        per_page: perPage,
        current_page: currentPage,
        total_pages: totalPages,
      },
      links: {
        self: req.url,
        next:
            items?.length && currentPage < totalPages
                ? `${req.path}?${newQueryParams}&page=${currentPage + 1}`
                : undefined,
        prev:
            items?.length && currentPage > 1
                ? `${req.path}?${newQueryParams}&page=${currentPage - 1}`
                : undefined,
        first:
            items?.length && totalPages > 1
                ? `${req.path}?${newQueryParams}&page=1`
                : undefined,
        last:
            items?.length && totalPages > 1
                ? `${req.path}?${newQueryParams}&page=${totalPages}`
                : undefined,
      },
    });
  }

  static validate<S, T>(
      cls: ClassConstructor<T>,
      obj: S,
      options: TransformValidatorOptions = {
        validator: {
          whitelist: true,
          forbidNonWhitelisted: true,
          forbidUnknownValues: true,
        },
        transform: {
          enableCircularCheck: true,
          excludeExtraneousValues: true,
          enableImplicitConversion: true,
        },
      },
  ) {
    const transformedObj = Validator.transform(cls, obj, options?.transform);
    // @ts-ignore
    return validateOrReject(transformedObj, options?.validator).
        then(() => transformedObj).
        catch((errors: Error) => {
          throw new BadRequestException('Error Validating', {cause: errors});
        });
  }
}

interface TransformValidatorOptions {
  validator: ValidatorOptions;
  transform: ClassTransformOptions;
}
