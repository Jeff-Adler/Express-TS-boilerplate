import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { UserRoles } from './UserRoles';

export const roleValidator = (role: keyof UserRoles): boolean => {
  return (role as keyof UserRoles) !== undefined;
};

@ValidatorConstraint({ name: 'roleValidator', async: false })
export class RoleValidator implements ValidatorConstraintInterface {
  validate(role: keyof UserRoles, args: ValidationArguments) {
    return roleValidator(role);
  }

  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return 'Invalid role';
  }
}
