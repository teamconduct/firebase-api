import { FirebaseFunctionsExecutableContext } from '@stevenkellner/firebase-function';
import { firebaseFunctionsContext } from '@stevenkellner/team-conduct-api';
import {
    UserLoginExecutableFunction, UserUpdateExecutableFunction, UserRegisterExecutableFunction,
    TeamNewExecutableFunction, TeamUpdateExecutableFunction, TeamDeleteExecutableFunction
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
    }
}));
