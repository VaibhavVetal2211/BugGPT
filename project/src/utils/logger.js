import log from 'loglevel';

log.setLevel(process.env.NODE_ENV === 'production' ? 'info' : 'debug');

export const logger = log;