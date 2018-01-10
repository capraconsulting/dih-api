module.exports = {
    up(migration, DataTypes) {
        return migration.createTable('adminValue', {
            title: {
                type: DataTypes.STRING,
                unique: false,
                allowNull: false,
                defaultValue: ''
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: false,
                defaultValue: ''
            },
            value: {
                type: DataTypes.TEXT,
                allowNull: false,
                defaultValue: ''
            }
        });
    },

    down(migration) {
        return migration.dropTable('adminValue');
    }
};
