import { expect } from '@assertive-ts/core';
import { Locale } from '../../src/types/Locale';
import { localizations } from '../../src/types/Localization';
import { keys } from '@stevenkellner/typescript-common-functionality';

describe('Locale', () => {

    describe('Locale type', () => {

        it('should be a valid locale type', () => {
            const locale1: Locale = 'en';
            const locale2: Locale = 'de';

            expect(locale1).toBeEqual('en');
            expect(locale2).toBeEqual('de');
        });
    });

    describe('Locale.all', () => {

        it('should contain all available locales', () => {
            expect(Locale.all.length).toBeEqual(2);
            expect(Locale.all).toContainAll('en', 'de');
        });

        it('should match keys from localizations', () => {
            const localizationKeys = keys(localizations);
            expect(Locale.all).toBeEqual(localizationKeys);
        });

        it('should contain only valid locale strings', () => {
            for (const locale of Locale.all) {
                expect(typeof locale).toBeEqual('string');
                expect(locale.length).toBeGreaterThan(0);
            }
        });
    });

    describe('Locale.builder', () => {

        it('should build valid locale from string', () => {
            const locale1 = Locale.builder.build('en');
            const locale2 = Locale.builder.build('de');

            expect(locale1).toBeEqual('en');
            expect(locale2).toBeEqual('de');
        });

        it('should preserve locale value', () => {
            for (const locale of Locale.all) {
                const built = Locale.builder.build(locale);
                expect(built).toBeEqual(locale);
            }
        });
    });
});
