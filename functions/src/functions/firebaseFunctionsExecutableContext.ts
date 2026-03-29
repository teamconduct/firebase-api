import { FirebaseFunctionsExecutableContext } from '@stevenkellner/firebase-function';
import { firebaseFunctionsContext } from '@stevenkellner/team-conduct-api';
import {
    UserLoginExecutableFunction, UserUpdateExecutableFunction, UserRegisterExecutableFunction,
    TeamNewExecutableFunction, TeamUpdateExecutableFunction, TeamDeleteExecutableFunction,
    PersonKickoutExecutableFunction, PersonRoleEditExecutableFunction, PersonAddExecutableFunction, PersonUpdateExecutableFunction, PersonDeleteExecutableFunction,
    FineAddExecutableFunction, FineUpdateExecutableFunction, FineDeleteExecutableFunction,
    FineTemplateAddExecutableFunction, FineTemplateUpdateExecutableFunction, FineTemplateDeleteExecutableFunction
} from '.';

export const firebaseFunctionsExecutableContext = FirebaseFunctionsExecutableContext.build<typeof firebaseFunctionsContext>(builder => ({
    user: {
        login: builder.function(UserLoginExecutableFunction),
        update: builder.function(UserUpdateExecutableFunction),
        register: builder.function(UserRegisterExecutableFunction)
    },
    team: {
        new: builder.function(TeamNewExecutableFunction),
        update: builder.function(TeamUpdateExecutableFunction),
        delete: builder.function(TeamDeleteExecutableFunction)
    },
    person: {
        kickout: builder.function(PersonKickoutExecutableFunction),
        roleEdit: builder.function(PersonRoleEditExecutableFunction),
        add: builder.function(PersonAddExecutableFunction),
        update: builder.function(PersonUpdateExecutableFunction),
        delete: builder.function(PersonDeleteExecutableFunction)
    },
    fine: {
        add: builder.function(FineAddExecutableFunction),
        update: builder.function(FineUpdateExecutableFunction),
        delete: builder.function(FineDeleteExecutableFunction)
    },
    fineTemplate: {
        add: builder.function(FineTemplateAddExecutableFunction),
        update: builder.function(FineTemplateUpdateExecutableFunction),
        delete: builder.function(FineTemplateDeleteExecutableFunction)
    }
}));
