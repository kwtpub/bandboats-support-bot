"use strict";
/**
 * @file index.ts
 * @brief Экспорт всех обработчиков команд.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAssignCommand = exports.createAllTicketsCommand = exports.createTicketCommand = exports.createTicketMessageHandler = exports.createCancelCommand = exports.createNewTicketCommand = exports.createMyTicketsCommand = exports.createHelpCommand = exports.createStartCommand = void 0;
var start_command_1 = require("./start.command");
Object.defineProperty(exports, "createStartCommand", { enumerable: true, get: function () { return start_command_1.createStartCommand; } });
var help_command_1 = require("./help.command");
Object.defineProperty(exports, "createHelpCommand", { enumerable: true, get: function () { return help_command_1.createHelpCommand; } });
var mytickets_command_1 = require("./mytickets.command");
Object.defineProperty(exports, "createMyTicketsCommand", { enumerable: true, get: function () { return mytickets_command_1.createMyTicketsCommand; } });
var newticket_command_1 = require("./newticket.command");
Object.defineProperty(exports, "createNewTicketCommand", { enumerable: true, get: function () { return newticket_command_1.createNewTicketCommand; } });
Object.defineProperty(exports, "createCancelCommand", { enumerable: true, get: function () { return newticket_command_1.createCancelCommand; } });
Object.defineProperty(exports, "createTicketMessageHandler", { enumerable: true, get: function () { return newticket_command_1.createTicketMessageHandler; } });
var ticket_command_1 = require("./ticket.command");
Object.defineProperty(exports, "createTicketCommand", { enumerable: true, get: function () { return ticket_command_1.createTicketCommand; } });
var alltickets_command_1 = require("./alltickets.command");
Object.defineProperty(exports, "createAllTicketsCommand", { enumerable: true, get: function () { return alltickets_command_1.createAllTicketsCommand; } });
var assign_command_1 = require("./assign.command");
Object.defineProperty(exports, "createAssignCommand", { enumerable: true, get: function () { return assign_command_1.createAssignCommand; } });
//# sourceMappingURL=index.js.map