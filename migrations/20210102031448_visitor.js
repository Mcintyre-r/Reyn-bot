
exports.up = function(knex) {
    return knex.schema.createTable("Visitor", tbl => {
        tbl.string("UID");
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists("Visitor")
};
