import { createFirebaseFunctions } from 'firebase-function';
import { TeamNewFunction } from './functions/TeamNewFunction';
import { PersonAddFunction } from './functions/PersonAddFunction';
import { FineTemplateAddFunction } from './functions/FineTemplateAddFunction';

export const firebaseFunctions = createFirebaseFunctions(builder => ({
    team: {
        new: builder.function(TeamNewFunction)
    },
    person: {
        add: builder.function(PersonAddFunction)
    },
    fineTemplate: {
        add: builder.function(FineTemplateAddFunction)
    }
}));
