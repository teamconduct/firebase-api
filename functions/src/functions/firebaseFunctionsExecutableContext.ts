import { FirebaseFunctionsExecutableContext } from '@stevenkellner/firebase-function';
import { firebaseFunctionsContext } from '@stevenkellner/team-conduct-api';
import { TeamNewExecutableFunction,
    UserKickoutExecutableFunction, UserLoginExecutableFunction, UserRoleEditExecutableFunction,
    PaypalMeEditExecutableFunction, NotificationRegisterExecutableFunction, NotificationSubscribeExecutableFunction,
    InvitationInviteExecutableFunction, InvitationWithdrawExecutableFunction, InvitationGetInvitationExecutableFunction, InvitationRegisterExecutableFunction,
    PersonAddExecutableFunction, PersonDeleteExecutableFunction, PersonUpdateExecutableFunction,
    FineTemplateAddExecutableFunction, FineTemplateDeleteExecutableFunction, FineTemplateUpdateExecutableFunction,
    FineAddExecutableFunction, FineDeleteExecutableFunction, FineUpdateExecutableFunction
} from '.';

export const firebaseFunctionsExecutableContext = FirebaseFunctionsExecutableContext.build<typeof firebaseFunctionsContext>(builder => ({
    team: {
        new: builder.function(TeamNewExecutableFunction)
    },
    user: {
        kickout: builder.function(UserKickoutExecutableFunction),
        login: builder.function(UserLoginExecutableFunction),
        roleEdit: builder.function(UserRoleEditExecutableFunction)
    },
    paypalMe: {
        edit: builder.function(PaypalMeEditExecutableFunction)
    },
    notification: {
        register: builder.function(NotificationRegisterExecutableFunction),
        subscribe: builder.function(NotificationSubscribeExecutableFunction)
    },
    invitation: {
        invite: builder.function(InvitationInviteExecutableFunction),
        withdraw: builder.function(InvitationWithdrawExecutableFunction),
        getInvitation: builder.function(InvitationGetInvitationExecutableFunction),
        register: builder.function(InvitationRegisterExecutableFunction)
    },
    person: {
        add: builder.function(PersonAddExecutableFunction),
        update: builder.function(PersonUpdateExecutableFunction),
        delete: builder.function(PersonDeleteExecutableFunction)
    },
    fineTemplate: {
        add: builder.function(FineTemplateAddExecutableFunction),
        update: builder.function(FineTemplateUpdateExecutableFunction),
        delete: builder.function(FineTemplateDeleteExecutableFunction)
    },
    fine: {
        add: builder.function(FineAddExecutableFunction),
        update: builder.function(FineUpdateExecutableFunction),
        delete: builder.function(FineDeleteExecutableFunction)
    }
}));
