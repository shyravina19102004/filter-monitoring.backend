# API Endpoints

Базовый URL: `/api`

## Аутентификация
- `POST /api/auth/login` — вход, получение JWT
- `GET /api/auth/me` — информация о текущем пользователе
- `PUT /api/auth/me` — редактирование своего профиля

## Пользователи
- `GET /api/users` — список пользователей (админ — все; мастер — только своего участка)
- `POST /api/users` — создание пользователя (админ)
- `GET /api/users/:id` — детали пользователя (админ или сам пользователь)
- `PUT /api/users/:id` — обновление данных (админ или сам пользователь)
- `DELETE /api/users/:id` — удаление (админ)

## Роли и разрешения (админ)
- `GET /api/roles` — список ролей
- `POST /api/roles` — создание роли
- `GET /api/roles/:id` — детали роли
- `PUT /api/roles/:id` — обновление
- `DELETE /api/roles/:id` — удаление
- `GET /api/permissions` — список всех разрешений
- `PUT /api/roles/:id/permissions` — назначить разрешения роли

## Справочники (админ)
- `location-types` — CRUD для типов местоположений
- `manufacturers` — CRUD для производителей
- `filter-types` — CRUD для типов фильтров
- `units` — CRUD для единиц измерения

## Иерархия объектов (locations)
- `GET /api/locations` — список узлов (с фильтрацией по родителю, типу)
- `GET /api/locations/tree` — всё дерево целиком
- `GET /api/locations/:id` — детали узла (включая дочерние)
- `POST /api/locations` — создать узел (мастер/админ)
- `PUT /api/locations/:id` — редактировать (мастер/админ)
- `DELETE /api/locations/:id` — удалить (мастер/админ, с проверкой)
- `GET /api/locations/:id/hierarchy` — поддерево узла (рекурсивно)

## Модели фильтров (filter-models)
- `GET /api/filter-models` — список моделей (с фильтрацией)
- `GET /api/filter-models/:id` — детали
- `POST /api/filter-models` — создать (мастер/админ)
- `PUT /api/filter-models/:id` — редактировать (мастер/админ)
- `DELETE /api/filter-models/:id` — удалить (админ)

## Экземпляры фильтров (склад) (filter-instances)
- `GET /api/filter-instances` — список экземпляров (фильтр по статусу, модели)
- `GET /api/filter-instances/:id` — детали
- `POST /api/filter-instances` — добавить на склад (мастер/админ)
- `PUT /api/filter-instances/:id` — редактировать (мастер/админ)
- `DELETE /api/filter-instances/:id` — удалить (только неиспользованный, админ)
- `PATCH /api/filter-instances/:id/write-off` — списать (мастер/админ)

## Корпуса фильтров (filter-housings)
- `GET /api/filter-housings` — список (фильтр по locationId)
- `GET /api/filter-housings/:id` — детали
- `POST /api/filter-housings` — создать (мастер/админ)
- `PUT /api/filter-housings/:id` — редактировать (мастер/админ)
- `DELETE /api/filter-housings/:id` — удалить (если нет активных установок, мастер/админ)

## Счётчики (meters)
- `GET /api/meters` — список счётчиков (фильтр по locationId)
- `GET /api/meters/:id` — детали
- `POST /api/meters` — добавить счётчик (мастер/админ)
- `PUT /api/meters/:id` — настройка (мастер/админ)
- `DELETE /api/meters/:id` — удалить (админ)

## Показания счётчиков (meter-readings)
- `GET /api/meter-readings` — история показаний (фильтр по meterId, дате; поддержка `?format=csv` для экспорта)
- `GET /api/meter-readings/:id` — детали показания
- `POST /api/meter-readings` — внести показание (рабочий, мастер, админ)
- `PUT /api/meter-readings/:id` — редактировать (админ)
- `DELETE /api/meter-readings/:id` — удалить (админ)

## Правила обслуживания (rules)
- `GET /api/rules` — список правил (фильтр по filterModelId)
- `GET /api/rules/:id` — детали
- `POST /api/rules` — создать правило (мастер/админ)
- `PUT /api/rules/:id` — редактировать (мастер/админ)
- `DELETE /api/rules/:id` — удалить (админ)

## Установки (installations)
- `GET /api/installations` — список установок (фильтр по housingId, isActive)
- `GET /api/installations/:id` — детали
- `POST /api/installations` — установка/замена фильтра (рабочий, мастер, админ)
- `DELETE /api/installations/:id` — удалить (только админ, опасно)
- `GET /api/installations/:id/history` — история установок для данного корпуса

## Оповещения (notifications)
- `GET /api/notifications` — оповещения текущего пользователя (с фильтром по прочтению)
- `GET /api/notifications/:id` — детали
- `PATCH /api/notifications/:id/read` — отметить прочитанным
- `PATCH /api/notifications/read-all` — отметить все прочитанными
- `DELETE /api/notifications/:id` — удалить (админ)

## Акты выполненных работ (work-orders)
- `GET /api/work-orders` — список актов (фильтр по дате, объекту)
- `GET /api/work-orders/:id` — детали
- `POST /api/work-orders` — создать акт вручную (мастер/админ, обычно создаётся автоматически при замене)
- `PUT /api/work-orders/:id` — редактировать (мастер/админ)
- `DELETE /api/work-orders/:id` — удалить (админ)
- `GET /api/work-orders/:id/pdf` — скачать PDF-версию акта
- `POST /api/work-orders/:id/attachments` — добавить фото (multipart/form-data)
- `GET /api/work-orders/:id/attachments/:fileId` — скачать прикреплённый файл

## Отчёты (руководитель, админ)
- `GET /api/reports/violations` — нарушения сроков ТО (с параметрами периода, установок; поддержка `?format=pdf|xlsx`)
- `GET /api/reports/usage-analysis` — анализ наработки фильтров
- `GET /api/reports/forecast` — прогноз расхода фильтров
- `GET /api/reports/efficiency` — эффективность мастеров
- `GET /api/reports/stock` — складские остатки
- `GET /api/reports/dynamics` — динамика показателей (графики)
- `GET /api/reports/export` — универсальный экспорт отчёта (параметры: type, format)

## Дашборд
- `GET /api/dashboard/summary` — сводка для руководителя (планируемые работы, остатки, эффективность) с возможностью экспорта

## Настройки системы (settings)
- `GET /api/settings` — все настройки (ключ-значение)
- `PUT /api/settings` — массовое обновление
- `GET /api/settings/:key` — значение по ключу
- `PUT /api/settings/:key` — установить значение

## Конфигурация уведомлений (notification-configs)
- `GET /api/notification-configs` — список каналов (Telegram, Email)
- `POST /api/notification-configs` — создать канал
- `PUT /api/notification-configs/:id` — редактировать
- `DELETE /api/notification-configs/:id` — удалить

## Логи (logs)
- `GET /api/logs` — список логов (с фильтрацией по дате, уровню, пользователю; админ)
- `GET /api/logs/:id` — детали записи
- `DELETE /api/logs/old` — очистить логи старше указанной даты

## Шаблоны документов (document-templates)
- `GET /api/document-templates` — список шаблонов (по типу)
- `GET /api/document-templates/:id` — детали
- `POST /api/document-templates` — создать шаблон
- `PUT /api/document-templates/:id` — редактировать
- `DELETE /api/document-templates/:id` — удалить

## Интеграции
- `GET /api/integrations/status` — статус всех интеграций (ТОИР, Telegram, SMTP)
- `POST /api/integrations/toir/sync` — ручная синхронизация с ТОИР
- `GET /api/integrations/toir/logs` — логи последних синхронизаций

## Файлы
- `GET /api/files/:type/:filename` — доступ к загруженным файлам (фото актов, PDF) с проверкой прав

**Примечание:** Все эндпоинты, кроме `/auth/login`, требуют заголовок `Authorization: Bearer <token>`. Доступ к данным ограничен ролевой моделью (RBAC) и привязкой пользователя к иерархии locations (рабочий видит только своё поддерево, мастер — свой участок, руководитель и админ — всё). Для списков поддерживаются параметры пагинации (`page`, `limit`), сортировки (`sortBy`, `sortOrder`) и фильтрации по полям.