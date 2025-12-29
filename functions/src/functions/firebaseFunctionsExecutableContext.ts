import { FirebaseFunctionsExecutableContext } from '@stevenkellner/firebase-function';
import { firebaseFunctionsContext } from '@stevenkellner/team-conduct-api';
import {
    UserLoginExecutableFunction, UserRegisterExecutableFunction
} from '.';

export const firebaseFunctionsExecutableContext = FirebaseFunctionsExecutableContext.build<typeof firebaseFunctionsContext>(builder => ({
    user: {
        login: builder.function(UserLoginExecutableFunction),
        register: builder.function(UserRegisterExecutableFunction),
    }
}));
