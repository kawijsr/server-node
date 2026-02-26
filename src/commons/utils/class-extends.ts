import {getMetadataStorage, IsOptional} from 'class-validator';
import {MetadataStorage} from 'class-validator/types/metadata/MetadataStorage';
import {
  ValidationMetadata,
} from 'class-validator/types/metadata/ValidationMetadata';
import {metadata} from 'reflect-metadata/no-conflict';

type Type<T> = new (...args: any[]) => T;

export function PickType<T, K extends keyof T>(
    classRef: Type<T>,
    keys: readonly K[],
    partialKeys?: readonly K[],
): { new(): Pick<T, K> } {
  const toPartialKeys = partialKeys || [];

  abstract class PickObjectType extends (classRef as any) {
    constructor() {
      super();
    }
  }

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

  targetMetadata.filter(
      (metadata) => toPartialKeys.includes(metadata.propertyName as K)).map((m) => {
    IsOptional()(m.target, m.propertyName)
  });

  return PickObjectType as Type<Pick<T, K>>;
}
