"use strict";
/**
 * @file index.ts
 * @brief Экспорт конфигурации приложения.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = exports.getConfig = exports.initializeConfig = exports.LogLevel = exports.Environment = void 0;
var env_config_1 = require("./env.config");
Object.defineProperty(exports, "Environment", { enumerable: true, get: function () { return env_config_1.Environment; } });
Object.defineProperty(exports, "LogLevel", { enumerable: true, get: function () { return env_config_1.LogLevel; } });
Object.defineProperty(exports, "initializeConfig", { enumerable: true, get: function () { return env_config_1.initializeConfig; } });
Object.defineProperty(exports, "getConfig", { enumerable: true, get: function () { return env_config_1.getConfig; } });
Object.defineProperty(exports, "loadConfig", { enumerable: true, get: function () { return env_config_1.loadConfig; } });
//# sourceMappingURL=index.js.map