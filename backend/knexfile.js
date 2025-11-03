require('dotenv').config();

module.exports = {
    development: {
        client: 'sqlite3',
        connection: {
            filename: './vacation_management.sqlite'
        },
        migrations: {
            directory: './migrations'
        },
        seeds: {
            directory: './seeds'
        },
        useNullAsDefault: true
    },

    test: {
        client: 'sqlite3',
        connection: {
            filename: './vacation_management_test.sqlite'
        },
        migrations: {
            directory: './migrations'
        },
        seeds: {
            directory: './seeds'
        },
        useNullAsDefault: true
    },

    production: {
        client: 'postgresql',
        connection: {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
        },
        migrations: {
            directory: './migrations'
        },
        seeds: {
            directory: './seeds'
        }
    }
};