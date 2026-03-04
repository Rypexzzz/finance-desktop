INSERT OR IGNORE INTO categories
(code, name_ru, type, icon_name, color, is_service, sort_order, is_active)
VALUES
-- EXPENSE
('expense_food', 'Еда и продукты', 'expense', 'shopping-cart', '#EF4444', 0, 10, 1),
('expense_cafe', 'Кафе и рестораны', 'expense', 'utensils', '#F97316', 0, 20, 1),
('expense_transport', 'Транспорт', 'expense', 'car', '#3B82F6', 0, 30, 1),
('expense_taxi', 'Такси', 'expense', 'taxi', '#F59E0B', 0, 40, 1),
('expense_housing', 'Жильё / аренда', 'expense', 'home', '#8B5CF6', 0, 50, 1),
('expense_utilities', 'Коммуналка', 'expense', 'bolt', '#06B6D4', 0, 60, 1),
('expense_mobile', 'Мобильная связь', 'expense', 'smartphone', '#0EA5E9', 0, 70, 1),
('expense_internet', 'Связь и интернет', 'expense', 'wifi', '#14B8A6', 0, 80, 1),
('expense_marketplace', 'Маркетплейсы / онлайн-покупки', 'expense', 'package', '#A855F7', 0, 90, 1),
('expense_clothes', 'Одежда', 'expense', 'shirt', '#EC4899', 0, 100, 1),
('expense_health', 'Аптека', 'expense', 'pill', '#10B981', 0, 110, 1),
('expense_medicine', 'Медицина / клиники', 'expense', 'hospital', '#22C55E', 0, 120, 1),
('expense_home_goods', 'Бытовые товары', 'expense', 'spray-can', '#64748B', 0, 130, 1),
('expense_entertainment', 'Развлечения', 'expense', 'film', '#E11D48', 0, 140, 1),
('expense_subscriptions', 'Подписки и сервисы', 'expense', 'play-circle', '#6366F1', 0, 150, 1),
('expense_gifts', 'Подарки', 'expense', 'gift', '#FB7185', 0, 160, 1),
('expense_travel', 'Путешествия', 'expense', 'plane', '#0EA5E9', 0, 170, 1),
('expense_fitness', 'Спорт / фитнес', 'expense', 'dumbbell', '#84CC16', 0, 180, 1),
('expense_auto_service', 'Автообслуживание', 'expense', 'wrench', '#78716C', 0, 190, 1),
('expense_other', 'Прочие расходы', 'expense', 'circle-help', '#94A3B8', 0, 999, 1),
('expense_fastfood', 'Фастфуд', 'expense', 'utensils', '#F97316', 0, 200, 1),
('expense_supermarket', 'Супермаркет', 'expense', 'shopping-cart', '#EF4444', 0, 210, 1),

-- INCOME
('income_salary', 'Зарплата', 'income', 'wallet', '#22C55E', 0, 10, 1),
('income_freelance', 'Репетиторство', 'income', 'laptop', '#10B981', 0, 30, 1),
('income_business', 'Бизнес / предпринимательство', 'income', 'building-2', '#059669', 0, 40, 1),
('income_gift', 'Подарок / денежные поступления', 'income', 'gift', '#34D399', 0, 50, 1),
('income_cashback', 'Проценты / кэшбэк', 'income', 'coins', '#65A30D', 0, 60, 1),
('income_refund', 'Возврат средств', 'income', 'rotate-ccw', '#2DD4BF', 0, 70, 1),
('income_other', 'Прочие доходы', 'income', 'circle-help', '#94A3B8', 0, 999, 1),

-- SERVICE
('service_goal_contribution', 'Пополнение цели накопления', 'service', 'target', '#3B82F6', 1, 10, 1),
('service_loan_payment', 'Погашение кредита', 'service', 'landmark', '#F59E0B', 1, 20, 1),
('service_credit_card_payment', 'Погашение кредитной карты', 'service', 'credit-card', '#EF4444', 1, 30, 1);

INSERT OR IGNORE INTO app_settings (id, theme, currency, locale, created_at, updated_at)
VALUES (1, 'system', 'RUB', 'ru-RU', datetime('now'), datetime('now'));
