import { Tagged, UtcDate } from '@stevenkellner/typescript-common-functionality';
import { Money, Fine, FineTemplate, Person, PersonProperties } from '@stevenkellner/team-conduct-api';
import { TestTeam } from './TestTeam';

const fineIds: [Fine.Id, Fine.Id, Fine.Id] = [
    Tagged.generate('fine'),
    Tagged.generate('fine'),
    Tagged.generate('fine')
];

export const testTeam1: TestTeam = {
    id: Tagged.generate('team'),
    name: 'Test Team 1',
    persons: [
        new Person(
            Tagged.generate('person'),
            new PersonProperties('John', 'Doe'),
            [fineIds[0], fineIds[1]]
        ),
        new Person(
            Tagged.generate('person'),
            new PersonProperties('Max', 'Mustermann'),
            [fineIds[2]]
        )
    ],
    fineTemplates: [
        new FineTemplate(
            Tagged.generate('fineTemplate'),
            'Fine Template 1',
            Fine.Amount.money(new Money(10, 50)),
            null
        ),
        new FineTemplate(
            Tagged.generate('fineTemplate'),
            'Fine Template 2',
            Fine.Amount.item('crateOfBeer', 1),
            new FineTemplate.Repetition('day', 3)
        )
    ],
    fines: [
        new Fine(
            fineIds[0],
            'notPayed',
            UtcDate.now,
            'Fine 1',
            Fine.Amount.money(new Money(10, 50))
        ),
        new Fine(
            fineIds[1],
            'payed',
            UtcDate.now,
            'Fine 2',
            Fine.Amount.item('crateOfBeer', 2)
        ),
        new Fine(
            fineIds[2],
            'notPayed',
            UtcDate.now,
            'Fine 3',
            Fine.Amount.money(new Money(5, 0))
        )
    ]
};
