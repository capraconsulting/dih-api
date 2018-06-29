
module.exports = {

    up(migration, DataTypes) {
        return migration.addColumn('users', 'hash', DataTypes.STRING);
    },

    down(migration) {
        return migration.removeColumn('users', 'hash');
    }

};
