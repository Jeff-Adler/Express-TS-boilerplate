// Methods of dynamically creating union types

// Method 1: use interface
interface Roles {
  ADMIN: string;
  USER: string;
}

export type Role = keyof Roles;

// Method 2: use array
const rolesArr = ['ADMIN', 'USER'] as const;

type RoleAlt = typeof rolesArr[number];

// Method 3: use object
const rolesObj = {
  ADMIN: '',
  USER: '',
};

type RoleAlt2 = keyof typeof rolesObj;

// Method 4: use Class
class RoleClass {
  private readonly roles = ['ADMIN', 'USER'] as const;

  constructor() {}

  get getRoles() {
    return this.roles;
  }
}

const roleClass = new RoleClass();
type RoleAlt3 = typeof roleClass.getRoles;

// Method 5: use Dynamic Class: DOESN'T WORK
class RoleDynamicClass {
  private readonly roles: { [key: string]: string } = {};

  constructor(roles: string[]) {
    const capitalizedRoles: string[] = this.capitalizeRoles(roles);
    this.mapRolesToObj(roles);
  }

  private capitalizeRoles(roles: string[]): string[] {
    return roles.map((role) => role.toUpperCase());
  }

  private mapRolesToObj(roles: string[]): void {
    roles.forEach((role) => (this.roles[role] = ''));
  }

  get getRoles() {
    return this.roles;
  }
}

const roleDynamicClass = new RoleDynamicClass(['ADMIN', 'USER']);
// wrong type
type RoleAlt4 = keyof typeof roleDynamicClass.getRoles;
