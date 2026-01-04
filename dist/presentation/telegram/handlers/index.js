"use strict";
/**
 * @file index.ts
 * @brief Экспорт всех обработчиков callback-запросов.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCloseTicketCallbackHandler = exports.createEditDescriptionCallbackHandler = exports.createEditTitleCallbackHandler = exports.createMyTicketsCallbackHandler = exports.createBackToTitleCallbackHandler = exports.createBackToMenuCallbackHandler = exports.createNewTicketCallbackHandler = exports.createViewTicketCallbackHandler = void 0;
var ticket_callback_handler_1 = require("./ticket-callback.handler");
Object.defineProperty(exports, "createViewTicketCallbackHandler", { enumerable: true, get: function () { return ticket_callback_handler_1.createViewTicketCallbackHandler; } });
var start_callback_handler_1 = require("./start-callback.handler");
Object.defineProperty(exports, "createNewTicketCallbackHandler", { enumerable: true, get: function () { return start_callback_handler_1.createNewTicketCallbackHandler; } });
Object.defineProperty(exports, "createBackToMenuCallbackHandler", { enumerable: true, get: function () { return start_callback_handler_1.createBackToMenuCallbackHandler; } });
Object.defineProperty(exports, "createBackToTitleCallbackHandler", { enumerable: true, get: function () { return start_callback_handler_1.createBackToTitleCallbackHandler; } });
Object.defineProperty(exports, "createMyTicketsCallbackHandler", { enumerable: true, get: function () { return start_callback_handler_1.createMyTicketsCallbackHandler; } });
var ticket_edit_callback_handler_1 = require("./ticket-edit-callback.handler");
Object.defineProperty(exports, "createEditTitleCallbackHandler", { enumerable: true, get: function () { return ticket_edit_callback_handler_1.createEditTitleCallbackHandler; } });
Object.defineProperty(exports, "createEditDescriptionCallbackHandler", { enumerable: true, get: function () { return ticket_edit_callback_handler_1.createEditDescriptionCallbackHandler; } });
Object.defineProperty(exports, "createCloseTicketCallbackHandler", { enumerable: true, get: function () { return ticket_edit_callback_handler_1.createCloseTicketCallbackHandler; } });
//# sourceMappingURL=index.js.map