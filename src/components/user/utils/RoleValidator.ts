import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { UserRoles } from './UserRoles';

@ValidatorConstraint({ name: 'roleValidator', async: false })
export class RoleValidator implements ValidatorConstraintInterface {
  validate(role: keyof UserRoles, args: ValidationArguments) {
    return (role as keyof UserRoles) !== undefined;
  }

  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return 'Invalid role';
  }
}
