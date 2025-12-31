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
//# sourceMappingURL=user.dto.d.ts.map