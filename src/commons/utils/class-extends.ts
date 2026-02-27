import {getMetadataStorage, IsOptional} from 'class-validator';
import {MetadataStorage} from 'class-validator/types/metadata/MetadataStorage';
import {
  ValidationMetadata,
} from 'class-validator/types/metadata/ValidationMetadata';

type Type<T> = new (...args: any[]) => T;

export function PickType<T, K extends keyof T, P extends keyof T = never,>(
    classRef: Type<T>,
    keys: readonly K[],
    partialKeys?: readonly P[],
): Type<Omit<Pick<T, K | P>, P> & Partial<Pick<T, P>>> {
  const toPartialKeys = partialKeys || [];

  abstract class PickObjectType extends (classRef as any) {}

  const metadataStorage: MetadataStorage = getMetadataStorage();

  const targetMetadata = metadataStorage.getTargetValidationMetadatas(
      classRef,
      classRef.name,
      true,
      false,
  );

  targetMetadata.filter((metadata) => [...keys, ...toPartialKeys].includes(
      metadata.propertyName as K)).forEach((metadata) => {
    const newMetadata: ValidationMetadata = {
      ...metadata,
      target: PickObjectType,
    };
    metadataStorage.addValidationMetadata(newMetadata);
  });

  toPartialKeys.forEach((propertyKey) => {
    IsOptional()(PickObjectType.prototype, propertyKey as string);
  });

  return PickObjectType as Type<Omit<Pick<T, K | P>, P> & Partial<Pick<T, P>>>;
}
