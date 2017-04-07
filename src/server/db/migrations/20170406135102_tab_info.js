exports.up = function(knex, Promise) {
  return knex.schema.createTable("tab_info", function (table) {
    table.increments();
    table.uuid('tab_id').notNullable();
    table.integer('fret').notNullable();
    table.integer('string').notNullable();
    table.integer('time').notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("tab_info")
}
