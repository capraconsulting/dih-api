module.exports = {
    up(migration) {
        return migration.renameColumn('users', 'readPrivacyTerms', 'agreesToPrivacyTerms');
    },

    down(migration) {
        return migration.renameColumn('users', 'agreesToPrivacyTerms', 'readPrivacyTerms');
    }
};
