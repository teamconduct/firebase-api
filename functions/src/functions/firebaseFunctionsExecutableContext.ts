import { FirebaseFunctionsExecutableContext } from '@stevenkellner/firebase-function';
import { firebaseFunctionsContext } from '@stevenkellner/team-conduct-api';
import {
    UserLoginExecutableFunction, UserLoginAfter2FAExecutableFunction, UserRegisterExecutableFunction
} from '.';

export const firebaseFunctionsExecutableContext = FirebaseFunctionsExecutableContext.build<typeof firebaseFunctionsContext>(builder => ({
    user: {
        login: builder.function(UserLoginExecutableFunction),
        loginAfter2FA: builder.function(UserLoginAfter2FAExecutableFunction),
        register: builder.function(UserRegisterExecutableFunction)
    }
}));
