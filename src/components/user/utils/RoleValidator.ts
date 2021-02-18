import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { UserRoles } from './UserRoles';

@ValidatorConstraint({ name: 'roleValidator', async: false })
export class RoleValidator implements ValidatorConstraintInterface {
  validate(role: string, args: ValidationArguments) {
    return !!UserRoles.roles.includes(role);
  }

  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return 'Invalid role';
  }
}
