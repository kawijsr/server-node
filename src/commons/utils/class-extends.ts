import { getMetadataStorage } from 'class-validator';
import { MetadataStorage } from 'class-validator/types/metadata/MetadataStorage';
import { ValidationMetadata } from 'class-validator/types/metadata/ValidationMetadata';

type Type<T> = new (...args: any[]) => T;

export function PickType<T, K extends keyof T>(
    classRef: Type<T>,
    keys: readonly K[]
): { new (): Pick<T, K> } {
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
      false
  );

  targetMetadata
  .filter((metadata) => keys.includes(metadata.propertyName as K))
  .forEach((metadata) => {
    const newMetadata: ValidationMetadata = {
      ...metadata,
      target: PickObjectType, // Asignamos la nueva clase como objetivo
    };
    metadataStorage.addValidationMetadata(newMetadata);
  });

  return PickObjectType as Type<Pick<T, K>>;
}
