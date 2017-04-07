exports.up = function(knex, Promise) {
  return knex.schema.createTable("tabs", function (table) {
    table.uuid('id').notNullable().primary();
    table.integer('author_id').notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("tabs")
}
