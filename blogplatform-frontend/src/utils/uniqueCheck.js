// src/utils/uniqueCheck.js
import { usersService } from '@/services/users';

/**
 * Проверка уникальности username через /api/Users/search?query=
 * Возвращает true, если свободно
 */
export async function checkUniqueUsername(username) {
  if (!username?.trim()) return false;
  const res = await usersService.search(username.trim(), 1, 10);
  const items = Array.isArray(res) ? res : res?.items || [];
  const found = items.some((u) => (u.username || '').toLowerCase() === username.trim().toLowerCase());
  return !found;
}

/**
 * Проверка уникальности email. В API прямого /Users/check?email нет,
 * поэтому используем тот же /Users/search?query= и сравниваем email.
 * Если бэк не ищет по email — считаем email свободным (true),
 * чтобы не блокировать регистрацию.
 */
export async function checkUniqueEmail(email) {
  if (!email?.trim()) return false;
  const res = await usersService.search(email.trim(), 1, 10);
  const items = Array.isArray(res) ? res : res?.items || [];

  // Пытаемся найти точное совпадение по email, если бэк возвращает поле email
  const found = items.some((u) => (u.email || '').toLowerCase() === email.trim().toLowerCase());

  // Если API не ищет по email, items скорее всего пусты → допустим email
  return !found || items.length === 0;
}
