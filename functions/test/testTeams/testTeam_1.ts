import { Guid, UtcDate } from 'firebase-function';
import { TestTeam } from '../createTestTeam';
import { Amount } from '../../src/types';

const fineIds = [Guid.generate(), Guid.generate(), Guid.generate()];

export const testTeam: TestTeam = {
    id: Guid.generate(),
    name: 'Test Team 1',
    persons: [
        {
            id: Guid.generate(),
            properties: {
                firstName: 'John',
                lastName: 'Doe'
            },
            fineIds: [fineIds[0], fineIds[1]]
        },
        {
            id: Guid.generate(),
            properties: {
                firstName: 'Max',
                lastName: 'Mustermann'
            },
            fineIds: [fineIds[2]]
        }
    ],
    fineTemplates: [
        {
            id: Guid.generate(),
            reason: 'Fine Template 1',
            amount: new Amount(10, 50),
            multiple: null
        },
        {
            id: Guid.generate(),
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
