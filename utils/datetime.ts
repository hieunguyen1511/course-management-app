import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import vi from 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale(vi);

export const formatDateTime = (date: string) => {
  return dayjs(date).format('DD/MM/YYYY HH:mm');
};

export const formatDateTimeRelative = (date: string) => {
  return dayjs(date).fromNow();
};

export const formatDateOrRelative = (date: string) => {
  const now = dayjs();
  const diffInDays = now.diff(dayjs(date), 'days');
  if (diffInDays > 6) {
    return dayjs(date).format('DD/MM/YYYY');
  } else {
    return dayjs(date).fromNow();
  }
};
