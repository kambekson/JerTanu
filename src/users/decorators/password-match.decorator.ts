import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export function PasswordMatch(property: string, validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'PasswordMatch',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value === relatedValue;
        },
        defaultMessage() {
          return `${propertyName} must match ${property}`;
        },
      },
    });
  };
}
