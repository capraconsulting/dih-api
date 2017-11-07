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
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: ''
            },
            value: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: ''
            }
        });
    },

    down(migration) {
        return migration.dropTable('adminValue');
    }
};
