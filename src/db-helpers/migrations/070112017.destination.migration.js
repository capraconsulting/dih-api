module.exports = {
    up(migration, DataTypes) {
        return migration.addColumn('destinations', 'leftStatusMailTemplateId', {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 4
        });
    },

    down(migration) {
        return migration.removeColumn('destinations', 'leftStatusMailTemplateId');
    }

};
