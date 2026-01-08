const STATUS_LABELS = {
  Active: 'Проверен',
  Admin: 'Администратор',
  Banned: 'Блокировка'
};

export function getUserStatusLabel(status) {
  if (!status) {
    return '—';
  }
  return STATUS_LABELS[status] ?? status;
}

export function isUserBanned(status) {
  return status === 'Banned';
}
