/**
 * Main config file used throughout the application
 * @module config
 * @type {object}
 * @property {integer} port - The port to expose to application to.
 * @property {string} pgUrl - The url used by sequlize to connect to postgres.
 * @property {string} nodeEnv - The environment to run the server in
 * @property {string} secret - The secret used to encrypt JWT`s and passwords
 * @property {string} email - The address which emails are sent from and replied to
 * @property {string} sentry - Url for sentry to log all errors
 * @property {string} web - The url of the web application using the api
 * @property {string} adminPassword - The admin password for the default admin user
 * @property {string} region - The aws region wich the server is running in
 * @property {string} smtpUrl - The smtp url that tansports the emails
 * @property {string} jwtExpiresIn - The amount of time a token is valid
 */
export default {
    port: process.env.PORT || 9000,
    pgUrl: process.env.PG_URL || 'postgres://dih:@localhost/dih',
    nodeEnv: process.env.NODE_ENV || 'development',
    secret: process.env.SECRET || 'hemmelig',
    email: process.env.EMAIL || 'frivillig@drapenihavet.no',
    sentry: process.env.SENTRY_DSN || '',
    web: process.env.WEB || 'http://localhost:3000',
    adminPassword: process.env.ADMIN_PASSWORD || 'capra2016',
    region: process.env.REGION || 'eu-west-1',
    smtpUrl: process.env.SMTP_URL || 'smtp://127.0.0.1:25',
    jwtExpiresIn: process.env.JWT_EXPIRES || '30 days'
};
