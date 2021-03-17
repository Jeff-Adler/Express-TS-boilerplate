import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';
import { Role } from './Roles';

export const roleValidator = (role: Role): boolean => {
  console.log('Role Validator: ' + <Role>role);
  return <Role>role !== undefined;
};

@ValidatorConstraint({ name: 'roleValidator', async: false })
export class RoleValidatorConstraint implements ValidatorConstraintInterface {
  validate(role: Role, args: ValidationArguments) {
    console.log(role);
    return roleValidator(role);
  }

  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return 'Invalid role';
  }
}

export function RoleValidator(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: RoleValidatorConstraint,
    });
  };
}
