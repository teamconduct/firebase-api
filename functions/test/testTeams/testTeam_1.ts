import { Tagged, UtcDate } from 'firebase-function';
import { TestTeam } from '../createTestTeam';
import { Amount, FineId } from '../../src/types';

const fineIds: FineId[] = [
    Tagged.generate('fine'),
    Tagged.generate('fine'),
    Tagged.generate('fine')
];

export const testTeam: TestTeam = {
    id: Tagged.generate('team'),
    name: 'Test Team 1',
    persons: [
        {
            id: Tagged.generate('person'),
            properties: {
                firstName: 'John',
                lastName: 'Doe'
            },
            fineIds: [fineIds[0], fineIds[1]]
        },
        {
            id: Tagged.generate('person'),
            properties: {
                firstName: 'Max',
                lastName: 'Mustermann'
            },
            fineIds: [fineIds[2]]
        }
    ],
    fineTemplates: [
        {
            id: Tagged.generate('fineTemplate'),
            reason: 'Fine Template 1',
            amount: new Amount(10, 50),
            multiple: null
        },
        {
            id: Tagged.generate('fineTemplate'),
            reason: 'Fine Template 2',
            amount: new Amount(5, 0),
            multiple: {
                item: 'day',
                maxCount: 3
            }
        }
    ],
    fines: [
        {
            id: fineIds[0],
            amount: new Amount(10, 50),
            date: UtcDate.now,
            reason: 'Fine 1',
            payedState: 'notPayed'
        },
        {
            id: fineIds[1],
            amount: new Amount(1, 0),
            date: UtcDate.now,
            reason: 'Fine 2',
            payedState: 'payed'
        },
        {
            id: fineIds[2],
            amount: new Amount(5, 0),
            date: UtcDate.now,
            reason: 'Fine 3',
            payedState: 'notPayed'
        }
    ]
};
