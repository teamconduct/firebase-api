import { expect } from '@assertive-ts/core';
import { Configuration } from '../../src/types/Configuration';
import { Currency } from '../../src/types/Currency';
import { Locale } from '../../src/types/Locale';

describe('Configuration', () => {

    describe('Configuration constructor', () => {

        it('should create a configuration with USD and en', () => {
            const config = new Configuration('USD', 'en');

            expect(config.currency).toBeEqual('USD');
            expect(config.locale).toBeEqual('en');
        });

        it('should create a configuration with EUR and de', () => {
            const config = new Configuration('EUR', 'de');

            expect(config.currency).toBeEqual('EUR');
            expect(config.locale).toBeEqual('de');
        });

        it('should accept all valid currency and locale combinations', () => {
            for (const currency of Currency.all) {
                for (const locale of Locale.all) {
                    const config = new Configuration(currency, locale);
                    expect(config.currency).toBeEqual(currency);
                    expect(config.locale).toBeEqual(locale);
                }
            }
        });
    });

    describe('Configuration.flatten', () => {

        it('should return flattened representation', () => {
            const config = new Configuration('USD', 'en');
            const flattened = config.flatten;

            expect(flattened.currency).toBeEqual('USD');
            expect(flattened.locale).toBeEqual('en');
        });

        it('should match the original values', () => {
            const config = new Configuration('EUR', 'de');
            const flattened = config.flatten;

            expect(flattened.currency).toBeEqual(config.currency);
            expect(flattened.locale).toBeEqual(config.locale);
        });

        it('should have correct structure', () => {
            const config = new Configuration('USD', 'en');
            const flattened = config.flatten;

            expect(Object.keys(flattened).sort()).toBeEqual(['currency', 'locale']);
        });
    });

    describe('Configuration.TypeBuilder', () => {

        it('should build configuration from flattened data', () => {
            const flattened: Configuration.Flatten = {
                currency: 'USD',
                locale: 'en'
            };
            const config = Configuration.builder.build(flattened);

            expect(config.currency).toBeEqual('USD');
            expect(config.locale).toBeEqual('en');
        });

        it('should build configuration with EUR and de', () => {
            const flattened: Configuration.Flatten = {
                currency: 'EUR',
                locale: 'de'
            };
            const config = Configuration.builder.build(flattened);

            expect(config.currency).toBeEqual('EUR');
            expect(config.locale).toBeEqual('de');
        });

        it('should round-trip through flatten and build', () => {
            const original = new Configuration('USD', 'en');
            const rebuilt = Configuration.builder.build(original.flatten);

            expect(rebuilt.currency).toBeEqual(original.currency);
            expect(rebuilt.locale).toBeEqual(original.locale);
        });

        it('should round-trip for all combinations', () => {
            for (const currency of Currency.all) {
                for (const locale of Locale.all) {
                    const original = new Configuration(currency, locale);
                    const rebuilt = Configuration.builder.build(original.flatten);

                    expect(rebuilt.currency).toBeEqual(original.currency);
                    expect(rebuilt.locale).toBeEqual(original.locale);
                }
            }
        });
    });
});
