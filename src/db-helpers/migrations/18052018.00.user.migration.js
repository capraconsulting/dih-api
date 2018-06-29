module.exports = {
    up(migration, DataTypes) {
        return migration.addColumn('users', 'readPrivacyTerms', {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        });
    },

    down(migration) {
        return migration.removeColumn('users', 'readPrivacyTerms');
    }
};
