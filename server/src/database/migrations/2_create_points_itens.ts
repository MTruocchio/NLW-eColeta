import Knex from 'knex'
export async function up(knex:Knex){
   return knex.schema.createTable('points_itens', table => {
        table.increments('id').primary(),
        table.integer('points_id').references('id').inTable('points').notNullable(),
        table.integer('itens_id').references('id').inTable('itens').notNullable()
        
    })
}

export async function down(knex:Knex){
    return knex.schema.dropTable('points_itens')
}