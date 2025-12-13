import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../schemas/user.schema';

export const ROLES_KEY = 'roles';

// ✅ Accept UserRole enum for type safety
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);