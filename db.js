let init = function(db) {

	// Create the tables we need to store galleries and files
	db.schema.createTableIfNotExists('Key', function (table) {
        table.increments()
        table.string('tableID')
        table.string('value')
        table.string('createdAt')
        table.string('category') /* Category tableID */
        table.string('user') /* Discord User tableID */
	}).then(() => {})

	db.schema.createTableIfNotExists('category', function (table) {
		table.increments()
		table.integer('tableID')
		table.string('name')
		table.string('roles') /* JSON array */
	}).then(() => {})

}

module.exports = init