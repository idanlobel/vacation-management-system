/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('vacation_requests', function (table) {
        table.increments('id').primary();
        table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
        table.date('start_date').notNullable();
        table.date('end_date').notNullable();
        table.text('reason');
        table.enum('status', ['pending', 'approved', 'rejected']).defaultTo('pending');
        table.text('comments'); // For validator comments on rejection
        table.integer('validator_id').unsigned().references('id').inTable('users').onDelete('SET NULL');
        table.timestamps(true, true);

        // Add indexes for better query performance
        table.index('user_id');
        table.index('status');
        table.index('created_at');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('vacation_requests');
};