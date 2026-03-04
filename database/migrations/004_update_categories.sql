UPDATE categories SET name_ru = 'Коммуналка' WHERE code = 'expense_utilities';
UPDATE categories SET name_ru = 'Репетиторство' WHERE code = 'income_freelance';
UPDATE categories SET is_active = 0 WHERE code = 'income_advance';

INSERT OR IGNORE INTO categories
(code, name_ru, type, icon_name, color, is_service, sort_order, is_active)
VALUES
('expense_fastfood', 'Фастфуд', 'expense', 'utensils', '#F97316', 0, 200, 1),
('expense_supermarket', 'Супермаркет', 'expense', 'shopping-cart', '#EF4444', 0, 210, 1);
