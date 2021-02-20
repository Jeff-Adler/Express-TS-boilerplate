import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Role } from './Roles';

export const roleValidator = (role: Role): boolean => {
  return <Role>role !== undefined;
};

@ValidatorConstraint({ name: 'roleValidator', async: false })
export class RoleValidator implements ValidatorConstraintInterface {
  validate(role: Role, args: ValidationArguments) {
    return roleValidator(role);
  }

  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return 'Invalid role';
  }
}
