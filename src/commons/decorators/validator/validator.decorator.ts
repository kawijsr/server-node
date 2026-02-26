import 'reflect-metadata';
import {Validator} from '../../utils/validator';
const commandParamMetadataKey = Symbol('command:param');

export function Type(ClassConstructor) {
  return function (
    target: object,
    propertyKey: string | symbol,
    parameterIndex: number,
  ) {
    const existingCommandParameters: [number, any] =
      Reflect.getOwnMetadata(commandParamMetadataKey, target, propertyKey) ||
      [];
    existingCommandParameters.push([parameterIndex, ClassConstructor]);
    Reflect.defineMetadata(
      commandParamMetadataKey,
      existingCommandParameters,
      target,
      propertyKey,
    );
  };
}

export function Command() {
  return function (
      target: any,
      propertyName: string,
      descriptor: PropertyDescriptor,
  ) {
    const method = descriptor.value!;

    descriptor.value = async function () {
      const commandParameters: [number, any] = Reflect.getOwnMetadata(
          commandParamMetadataKey,
          target,
          propertyName,
      );
      await Promise.all(
          commandParameters?.map(async (commandParameter) => {
            const [index, ClassConstructor] = commandParameter;
            arguments[index] = await Validator.validate(
                ClassConstructor,
                arguments[index],
            );
          }) || [],
      );
      return method.apply(this, arguments);
    };
  }
}

