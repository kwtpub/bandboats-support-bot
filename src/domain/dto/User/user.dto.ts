// src/core/dto/user.dto.ts
import { ROLE } from '../../../domain/entities/User/user.entity';

export interface CreateUserDto {
  telegramId: string;
  name: string;
  role: ROLE;
}

export interface UpdateUserRoleDto {
  userId: number;
  role: ROLE;
}
