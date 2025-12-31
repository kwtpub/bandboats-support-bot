/**
 * @file start.command.ts
 * @brief Обработчик команды /start.
 *
 * Приветствует пользователя и регистрирует его в системе.
 */
import { BotContext } from '../types';
import { UserService } from '../../../domain/services/UserService/user.service';
/**
 * Обработчик команды /start
 */
export declare function createStartCommand(userService: UserService): (ctx: BotContext) => Promise<void>;
//# sourceMappingURL=start.command.d.ts.map