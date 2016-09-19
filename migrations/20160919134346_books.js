'use strict';

// migrate:latest
exports.up = function(knex) {
  return knex.schema.createTable('books', (table) => {
    table.increments(); // PK defaults to id
    table.string('title').notNullable().defaultTo('');
    table.string('author').notNullable().defaultTo('');
    table.string('genre').notNullable().defaultTo('');
    table.text('description').notNullable().defaultTo('');
    table.text('cover_url').notNullable().defaultTo('');
    table.timestamps(true, true);
  });
};

// migrate:rollback
exports.down = function(knex) {
  return knex.schema.dropTable('books');
};
