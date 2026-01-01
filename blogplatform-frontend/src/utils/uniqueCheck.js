// src/utils/uniqueCheck.js
import { usersService } from '@/services/users';

/**
 * Проверка уникальности username через /api/Users/check
 * Возвращает true, если свободно
 */
export async function checkUniqueUsername(username) {
  if (!username?.trim()) return false;
  const res = await usersService.checkAvailability({ username: username.trim() });
  if (!res) throw new Error('Не удалось проверить имя пользователя');
  return !res.usernameTaken;
}

/**
 * Проверка уникальности email через /api/Users/check
 * Возвращает true, если свободно
 */
export async function checkUniqueEmail(email) {
  if (!email?.trim()) return false;
  const res = await usersService.checkAvailability({ email: email.trim() });
  if (!res) throw new Error('Не удалось проверить email');
  return !res.emailTaken;
}
