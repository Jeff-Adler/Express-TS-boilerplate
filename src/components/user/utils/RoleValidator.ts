import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';
import { Role, rolesArr } from './Roles';

export const roleValidator = (role: Role): role is Role => {
  return rolesArr.includes(role);
};

@ValidatorConstraint({ name: 'roleValidator', async: false })
export class RoleValidatorConstraint implements ValidatorConstraintInterface {
  validate(role: Role, args: ValidationArguments) {
    const result = roleValidator(role);
    return roleValidator(role);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Invalid Role';
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
