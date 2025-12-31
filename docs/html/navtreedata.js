/*
 @licstart  The following is the entire license notice for the JavaScript code in this file.

 The MIT License (MIT)

 Copyright (C) 1997-2020 by Dimitri van Heesch

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 and associated documentation files (the "Software"), to deal in the Software without restriction,
 including without limitation the rights to use, copy, modify, merge, publish, distribute,
 sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or
 substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
 BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 @licend  The above is the entire license notice for the JavaScript code in this file
*/
var NAVTREE =
[
  [ "Bandboats Support Bot", "index.html", [
    [ "Bandboats Support Bot - DDD Architecture", "index.html", "index" ],
    [ "Application Layer (Слой приложения)", "application_documentation.html", [
      [ "Обзор", "application_documentation.html#app_overview", null ],
      [ "Ответственность Application Layer", "application_documentation.html#app_responsibility", null ],
      [ "Структура Application Layer", "application_documentation.html#app_structure", [
        [ "use-cases/", "application_documentation.html#app_usecases", null ],
        [ "dto/", "application_documentation.html#app_dto", null ],
        [ "ports/", "application_documentation.html#app_ports", null ],
        [ "mappers/", "application_documentation.html#app_mappers", null ]
      ] ],
      [ "Поток выполнения Use Case", "application_documentation.html#app_flow", null ],
      [ "Правила Application Layer", "application_documentation.html#app_rules", null ],
      [ "Ключевые концепции", "application_documentation.html#app_concepts", null ],
      [ "Преимущества", "application_documentation.html#app_benefits", null ]
    ] ],
    [ "Domain Layer Documentation", "domain_documentation.html", [
      [ "Обзор", "domain_documentation.html#domain_overview", null ],
      [ "Ответственность Domain Layer", "domain_documentation.html#domain_responsibility", null ],
      [ "Структура Domain Layer", "domain_documentation.html#domain_structure", [
        [ "entities/", "domain_documentation.html#domain_entities", null ],
        [ "aggregates/", "domain_documentation.html#domain_aggregates", null ],
        [ "value-objects/", "domain_documentation.html#domain_value_objects", null ],
        [ "repositories/", "domain_documentation.html#domain_repositories", null ],
        [ "services/", "domain_documentation.html#domain_services", null ],
        [ "events/", "domain_documentation.html#domain_events", null ]
      ] ],
      [ "Правила Domain Layer", "domain_documentation.html#domain_rules", null ],
      [ "Ключевые концепции", "domain_documentation.html#domain_concepts", null ]
    ] ],
    [ "Infrastructure Layer Documentation", "infrastructure_documentation.html", [
      [ "Обзор", "infrastructure_documentation.html#infra_overview", null ],
      [ "Ответственность Infrastructure Layer", "infrastructure_documentation.html#infra_responsibility", null ],
      [ "Структура Infrastructure Layer", "infrastructure_documentation.html#infra_structure", [
        [ "persistence/", "infrastructure_documentation.html#infra_persistence", null ],
        [ "services/", "infrastructure_documentation.html#infra_services", null ],
        [ "messaging/", "infrastructure_documentation.html#infra_messaging", null ],
        [ "config/", "infrastructure_documentation.html#infra_config", null ],
        [ "di/", "infrastructure_documentation.html#infra_di", null ]
      ] ],
      [ "Маппинг данных", "infrastructure_documentation.html#infra_mapping", null ],
      [ "Repository Implementation", "infrastructure_documentation.html#infra_repositories", null ],
      [ "Правила Infrastructure Layer", "infrastructure_documentation.html#infra_rules", null ],
      [ "Ключевые концепции", "infrastructure_documentation.html#infra_concepts", null ],
      [ "Возможные технологии", "infrastructure_documentation.html#infra_technologies", null ],
      [ "Преимущества", "infrastructure_documentation.html#infra_benefits", null ]
    ] ],
    [ "Presentation Layer Documentation", "presentation_documentation.html", [
      [ "Обзор", "presentation_documentation.html#pres_overview", null ],
      [ "Ответственность Presentation Layer", "presentation_documentation.html#pres_responsibility", null ],
      [ "Структура Presentation Layer", "presentation_documentation.html#pres_structure", [
        [ "telegram-bot/", "presentation_documentation.html#pres_telegram", null ],
        [ "web/", "presentation_documentation.html#pres_web", null ],
        [ "api/", "presentation_documentation.html#pres_api", null ],
        [ "graphql/", "presentation_documentation.html#pres_graphql", null ]
      ] ],
      [ "Поток обработки запроса", "presentation_documentation.html#pres_flow", null ],
      [ "Валидация данных", "presentation_documentation.html#pres_validation", null ],
      [ "Обработка ошибок", "presentation_documentation.html#pres_error", null ],
      [ "Правила Presentation Layer", "presentation_documentation.html#pres_rules", null ],
      [ "Ключевые концепции", "presentation_documentation.html#pres_concepts", null ],
      [ "Множественные интерфейсы", "presentation_documentation.html#pres_multiple", null ],
      [ "Преимущества архитектуры", "presentation_documentation.html#pres_benefits", null ]
    ] ],
    [ "Классы", "annotated.html", [
      [ "Классы", "annotated.html", "annotated_dup" ],
      [ "Алфавитный указатель классов", "classes.html", null ],
      [ "Члены классов", "functions.html", [
        [ "Указатель", "functions.html", null ],
        [ "Функции", "functions_func.html", null ]
      ] ]
    ] ],
    [ "Файлы", "files.html", [
      [ "Файлы", "files.html", "files_dup" ],
      [ "Список членов всех файлов", "globals.html", [
        [ "Указатель", "globals.html", null ],
        [ "Переменные", "globals_vars.html", null ],
        [ "Перечисления", "globals_enum.html", null ],
        [ "Элементы перечислений", "globals_eval.html", null ]
      ] ]
    ] ]
  ] ]
];

var NAVTREEINDEX =
[
"annotated.html"
];

var SYNCONMSG = 'нажмите на выключить для синхронизации панелей';
var SYNCOFFMSG = 'нажмите на включить для синхронизации панелей';
var LISTOFALLMEMBERS = 'Полный список членов класса';